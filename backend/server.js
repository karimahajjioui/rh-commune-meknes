require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { countWorkingDays } = require('./lib/dates');

const app = express();
app.use(cors({ origin: process.env.FRONT_URL || 'http://localhost:3000' }));
app.use(helmet());
app.use(express.json({ limit: '100kb' }));
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { message: 'Trop de tentatives, réessayez dans quelques minutes' } });
app.get('/api/health', (_q, res) => res.json({ status: 'ok' }));

const db = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306, connectTimeout: 10000,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'rh_commune_meknes',
  dateStrings: true,
});

// Création automatique de la base au premier démarrage (aucun import manuel)
async function initDb() {
  let c;
  for (let i = 0; ; i++) { // attend que MySQL soit prêt (utile avec Docker)
    try {
      c = await mysql.createConnection({ host: process.env.DB_HOST || '127.0.0.1', port: Number(process.env.DB_PORT) || 3306, user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '', multipleStatements: true });
      break;
    } catch (e) { if (i >= 30) throw e; await new Promise((r) => setTimeout(r, 2000)); }
  }
  const [r] = await c.query('SHOW DATABASES LIKE ?', [process.env.DB_NAME || 'rh_commune_meknes']);
  if (!r.length) { await c.query(fs.readFileSync(path.join(__dirname, '..', 'database', 'schema.sql'), 'utf8')); console.log('Base de données créée.'); }
  await c.end();
}
const SECRET = process.env.JWT_SECRET || 'changez-moi';
if (SECRET === 'changez-moi') console.warn('ATTENTION : définissez JWT_SECRET dans .env avant toute mise en production.');
const ROLES = { admin: 'admin', rh: 'rh', chef: 'chef', agent: 'agent' };

// ---------- middlewares ----------
const auth = (...allowed) => (req, res, next) => {
  try {
    const token = (req.headers.authorization || '').replace('Bearer ', '');
    req.user = jwt.verify(token, SECRET);
    if (allowed.length && !allowed.includes(req.user.role))
      return res.status(403).json({ message: 'Accès refusé' });
    if (req.method !== 'GET') log(req.user.id, `${req.method} ${req.originalUrl.split('?')[0]}`).catch(() => {}); // journal d'audit transversal
    next();
  } catch { res.status(401).json({ message: 'Non authentifié' }); }
};
const wrap = (fn) => (req, res) => fn(req, res).catch((e) => {
  console.error(e);
  if (['ETIMEDOUT', 'ECONNREFUSED', 'PROTOCOL_CONNECTION_LOST', 'ENOTFOUND'].includes(e.code)) return res.status(503).json({ message: 'Base de données injoignable : vérifiez que MySQL est démarré (XAMPP, bouton Start) puis réessayez.' });
  if (e.code === 'ER_DUP_ENTRY')
    return res.status(409).json({ message: 'CIN, matricule, email ou username déjà utilisé' });
  res.status(e.status || 500).json({ message: e.message || 'Erreur serveur' });
});
const fail = (status, message) => Object.assign(new Error(message), { status });
const log = (uid, action) => db.query('INSERT INTO journal(user_id,action) VALUES (?,?)', [uid, action]);

// ---------- authentification ----------
app.post('/api/auth/login', loginLimiter, wrap(async (req, res) => {
  const { login, password } = req.body;
  const [[u]] = await db.query('SELECT * FROM users WHERE (email=? OR username=?) AND actif=1', [login, login]);
  if (!u || !(await bcrypt.compare(password || '', u.password_hash)))
    throw fail(401, 'Login ou mot de passe incorrect');
  const token = jwt.sign({ id: u.id, role: u.role }, SECRET, { expiresIn: '8h' });
  await log(u.id, 'Connexion');
  delete u.password_hash;
  res.json({ token, user: u });
}));

app.get('/api/me', auth(), wrap(async (req, res) => {
  const [[u]] = await db.query(
    `SELECT u.id,u.matricule,u.cin,u.nom,u.prenom,u.sexe,u.date_naissance,u.email,u.username,u.adresse,u.situation_familiale,
     u.grade,u.echelle,u.date_recrutement,u.role,u.solde_conge,s.nom AS service, d.nom AS division
     FROM users u LEFT JOIN services s ON s.id=u.service_id LEFT JOIN divisions d ON d.id=s.division_id WHERE u.id=?`, [req.user.id]);
  res.json(u);
}));

// ---------- organisation ----------
app.get('/api/organisation', auth(), wrap(async (_q, res) => {
  const [divisions] = await db.query('SELECT * FROM divisions ORDER BY nom');
  const [services] = await db.query('SELECT * FROM services ORDER BY nom');
  res.json({ divisions, services });
}));
app.post('/api/divisions', auth('admin'), wrap(async (req, res) => {
  const [r] = await db.query('INSERT INTO divisions(nom) VALUES (?)', [req.body.nom]);
  res.status(201).json({ id: r.insertId });
}));
app.post('/api/services', auth('admin'), wrap(async (req, res) => {
  const [r] = await db.query('INSERT INTO services(nom,division_id) VALUES (?,?)', [req.body.nom, req.body.division_id]);
  res.status(201).json({ id: r.insertId });
}));

// ---------- employés (admin + RH) ----------
const EMP_COLS = 'matricule,cin,nom,prenom,sexe,date_naissance,email,username,adresse,situation_familiale,grade,echelle,date_recrutement,role,service_id';
app.get('/api/employes', auth('admin', 'rh'), wrap(async (req, res) => {
  const actif = req.query.actif === '0' ? 0 : 1;
  const [rows] = await db.query(
    `SELECT u.id,${EMP_COLS.split(',').map((c) => 'u.' + c).join(',')},u.solde_conge,s.nom AS service,d.nom AS division,
       CASE WHEN EXISTS(SELECT 1 FROM conges c WHERE c.user_id=u.id AND c.statut='validee' AND CURDATE() BETWEEN c.date_debut AND c.date_fin) THEN 'conge'
            WHEN EXISTS(SELECT 1 FROM ordres_mission m WHERE m.user_id=u.id AND m.statut='validee' AND CURDATE() BETWEEN m.date_debut AND m.date_fin) THEN 'mission' ELSE 'actif' END AS statut_jour
     FROM users u LEFT JOIN services s ON s.id=u.service_id LEFT JOIN divisions d ON d.id=s.division_id WHERE u.actif=? ORDER BY u.nom`, [actif]);
  res.json(rows);
}));
app.post('/api/employes', auth('admin', 'rh'), wrap(async (req, res) => {
  const b = req.body;
  for (const k of ['matricule', 'cin', 'nom', 'prenom', 'sexe', 'email', 'username', 'password'])
    if (!b[k]) throw fail(400, `Champ obligatoire manquant : ${k}`);
  if (!ROLES[b.role || 'agent']) throw fail(400, 'Rôle invalide');
  if (b.role === 'admin' && req.user.role !== 'admin') throw fail(403, 'Seul un admin crée un admin');
  const hash = await bcrypt.hash(b.password, 10);
  const vals = EMP_COLS.split(',').map((c) => b[c] ?? null);
  const [r] = await db.query(
    `INSERT INTO users(${EMP_COLS},password_hash,solde_conge) VALUES (${EMP_COLS.split(',').map(() => '?').join(',')},?,?)`,
    [...vals, hash, b.solde_conge ?? 22]);
  await log(req.user.id, `Ajout employé ${b.matricule}`);
  res.status(201).json({ id: r.insertId });
}));
app.put('/api/employes/:id', auth('admin', 'rh'), wrap(async (req, res) => {
  const b = req.body;
  const cols = EMP_COLS.split(',').filter((c) => b[c] !== undefined);
  const sets = cols.map((c) => `${c}=?`);
  const vals = cols.map((c) => b[c]);
  if (b.password) { sets.push('password_hash=?'); vals.push(await bcrypt.hash(b.password, 10)); }
  if (!sets.length) throw fail(400, 'Rien à modifier');
  await db.query(`UPDATE users SET ${sets.join(',')} WHERE id=?`, [...vals, req.params.id]);
  await log(req.user.id, `Modification employé #${req.params.id}`);
  res.json({ ok: true });
}));
// "supprimer" = désactiver ; "restaurer" = réactiver (scénario alternatif 1 du rapport)
app.patch('/api/employes/:id/actif', auth('admin', 'rh'), wrap(async (req, res) => {
  if (+req.params.id === req.user.id) throw fail(400, 'Vous ne pouvez pas désactiver votre propre compte');
  await db.query('UPDATE users SET actif=? WHERE id=?', [req.body.actif ? 1 : 0, req.params.id]);
  await log(req.user.id, `${req.body.actif ? 'Réactivation' : 'Désactivation'} employé #${req.params.id}`);
  res.json({ ok: true });
}));

// ---------- congés ----------
async function joursOuvrables(debut, fin) {
  const [fer] = await db.query('SELECT jour FROM jours_feries WHERE jour BETWEEN ? AND ?', [debut, fin]);
  return countWorkingDays(debut, fin, new Set(fer.map((f) => f.jour)));
}
const owns = (req) => (['admin', 'rh'].includes(req.user.role) && req.query.tous === '1' ? '' : 'WHERE c.user_id=' + Number(req.user.id));

app.get('/api/conges', auth(), wrap(async (req, res) => {
  const [rows] = await db.query(
    `SELECT c.*,u.matricule,u.nom,u.prenom FROM conges c JOIN users u ON u.id=c.user_id ${owns(req)} ORDER BY c.created_at DESC`);
  res.json(rows);
}));
app.post('/api/conges', auth(), wrap(async (req, res) => {
  const { type_conge, date_debut, date_fin } = req.body;
  if (!type_conge || !date_debut || !date_fin) throw fail(400, 'Veuillez renseigner tous les champs');
  if (date_fin < date_debut) throw fail(400, 'La date de fin précède la date de début');
  const jours = await joursOuvrables(date_debut, date_fin);
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [[u]] = await conn.query('SELECT solde_conge FROM users WHERE id=? FOR UPDATE', [req.user.id]);
    if (jours > u.solde_conge) throw fail(400, `Maximum de jours à demander : ${u.solde_conge}`);
    const [[chev]] = await conn.query(
      `SELECT COUNT(*) n FROM conges WHERE user_id=? AND statut IN ('en_attente','traitee_rh','validee')
       AND date_debut<=? AND date_fin>=?`, [req.user.id, date_fin, date_debut]);
    if (chev.n) throw fail(400, 'Une demande existe déjà sur cette période');
    await conn.query('UPDATE users SET solde_conge=solde_conge-? WHERE id=?', [jours, req.user.id]);
    // demande de l'admin : validée automatiquement (comme dans le rapport)
    const statut = req.user.role === 'admin' ? 'validee' : 'en_attente';
    const [r] = await conn.query(
      'INSERT INTO conges(user_id,type_conge,date_debut,date_fin,jours_ouvrables,statut) VALUES (?,?,?,?,?,?)',
      [req.user.id, type_conge, date_debut, date_fin, jours, statut]);
    await conn.commit();
    res.status(201).json({ id: r.insertId, jours_ouvrables: jours, statut });
  } catch (e) { await conn.rollback(); throw e; } finally { conn.release(); }
}));
app.delete('/api/conges/:id', auth(), wrap(async (req, res) => {
  const [[c]] = await db.query('SELECT * FROM conges WHERE id=?', [req.params.id]);
  if (!c || c.user_id !== req.user.id) throw fail(404, 'Demande introuvable');
  if (c.statut !== 'en_attente') throw fail(400, 'Seule une demande en attente peut être supprimée');
  await db.query('UPDATE users SET solde_conge=solde_conge+? WHERE id=?', [c.jours_ouvrables, c.user_id]);
  await db.query('DELETE FROM conges WHERE id=?', [c.id]);
  res.json({ ok: true });
}));
// RH : traite et transmet à l'admin (peut corriger les jours non ouvrables)
app.patch('/api/conges/:id/traiter', auth('rh'), wrap(async (req, res) => {
  const [r] = await db.query(
    "UPDATE conges SET statut='traitee_rh', jours_non_ouvrables=? WHERE id=? AND statut='en_attente'",
    [req.body.jours_non_ouvrables ?? 0, req.params.id]);
  if (!r.affectedRows) throw fail(400, 'Demande non modifiable');
  res.json({ ok: true });
}));
app.patch('/api/conges/:id/valider', auth('admin'), wrap(async (req, res) => {
  const [r] = await db.query("UPDATE conges SET statut='validee' WHERE id=? AND statut='traitee_rh'", [req.params.id]);
  if (!r.affectedRows) throw fail(400, 'La demande doit d\'abord être traitée par le RH');
  res.json({ ok: true });
}));
app.patch('/api/conges/:id/refuser', auth('admin', 'rh'), wrap(async (req, res) => {
  const [[c]] = await db.query('SELECT * FROM conges WHERE id=?', [req.params.id]);
  if (!c || ['refusee', 'validee'].includes(c.statut)) throw fail(400, 'Demande non modifiable');
  await db.query("UPDATE conges SET statut='refusee' WHERE id=?", [c.id]);
  await db.query('UPDATE users SET solde_conge=solde_conge+? WHERE id=?', [c.jours_ouvrables, c.user_id]); // restitue le solde
  res.json({ ok: true });
}));
// Bulletin de congé (données pour impression côté React)
app.get('/api/conges/:id/bulletin', auth('admin', 'rh'), wrap(async (req, res) => {
  const [[b]] = await db.query(
    `SELECT c.*,u.matricule,u.nom,u.prenom,u.grade,u.solde_conge,s.nom AS service
     FROM conges c JOIN users u ON u.id=c.user_id LEFT JOIN services s ON s.id=u.service_id
     WHERE c.id=? AND c.statut='validee'`, [req.params.id]);
  if (!b) throw fail(404, 'Bulletin disponible uniquement pour un congé validé');
  res.json(b);
}));

// ---------- ordres de mission ----------
app.get('/api/missions', auth(), wrap(async (req, res) => {
  const where = owns(req).replace('c.user_id', 'm.user_id');
  const [rows] = await db.query(
    `SELECT m.*,u.matricule,u.nom,u.prenom FROM ordres_mission m JOIN users u ON u.id=m.user_id ${where} ORDER BY m.created_at DESC`);
  res.json(rows);
}));
app.post('/api/missions', auth(), wrap(async (req, res) => {
  const { objet, lieu, date_debut, date_fin } = req.body;
  if (!objet || !lieu || !date_debut || !date_fin) throw fail(400, 'Veuillez renseigner tous les champs');
  const statut = req.user.role === 'admin' ? 'validee' : 'en_attente';
  const [r] = await db.query(
    'INSERT INTO ordres_mission(user_id,objet,lieu,date_debut,date_fin,statut) VALUES (?,?,?,?,?,?)',
    [req.user.id, objet, lieu, date_debut, date_fin, statut]);
  res.status(201).json({ id: r.insertId });
}));
app.patch('/api/missions/:id/:action', auth('admin', 'rh'), wrap(async (req, res) => {
  const { action } = req.params;
  const map = { traiter: ['traitee_rh', 'en_attente', ['rh']], valider: ['validee', 'traitee_rh', ['admin']], refuser: ['refusee', null, ['admin', 'rh']] };
  const m = map[action];
  if (!m || !m[2].includes(req.user.role)) throw fail(403, 'Action non autorisée');
  const [r] = await db.query(
    `UPDATE ordres_mission SET statut=? WHERE id=? ${m[1] ? 'AND statut=?' : "AND statut NOT IN ('validee','refusee')"}`,
    m[1] ? [m[0], req.params.id, m[1]] : [m[0], req.params.id]);
  if (!r.affectedRows) throw fail(400, 'Demande non modifiable');
  res.json({ ok: true });
}));

// ---------- attestations ----------
app.get('/api/attestations', auth(), wrap(async (req, res) => {
  const all = ['admin', 'rh'].includes(req.user.role) && req.query.tous === '1';
  const [rows] = await db.query(
    `SELECT a.*,u.matricule,u.nom,u.prenom,u.grade,u.date_recrutement FROM attestations a JOIN users u ON u.id=a.user_id
     ${all ? '' : 'WHERE a.user_id=' + Number(req.user.id)} ORDER BY a.created_at DESC`);
  res.json(rows);
}));
app.post('/api/attestations', auth(), wrap(async (req, res) => {
  const type = req.body.type === 'salaire' ? 'salaire' : 'travail';
  const [r] = await db.query('INSERT INTO attestations(user_id,type) VALUES (?,?)', [req.user.id, type]);
  res.status(201).json({ id: r.insertId });
}));

// ---------- journal d'audit (admin) ----------
app.get('/api/audit', auth('admin'), wrap(async (_q, res) => {
  const [rows] = await db.query('SELECT j.id,j.action,j.created_at,u.nom,u.prenom FROM journal j LEFT JOIN users u ON u.id=j.user_id ORDER BY j.id DESC LIMIT 100');
  res.json(rows);
}));

// ---------- tableau de bord ----------
app.get('/api/stats', auth('admin', 'rh'), wrap(async (_q, res) => {
  const [[a]] = await db.query('SELECT COUNT(*) n FROM users WHERE actif=1');
  const [[b]] = await db.query('SELECT COUNT(*) n FROM divisions');
  const [[c]] = await db.query('SELECT COUNT(*) n FROM services');
  const [[d]] = await db.query("SELECT COUNT(*) n FROM conges WHERE statut IN ('en_attente','traitee_rh')");
  const [[e]] = await db.query("SELECT COUNT(*) n FROM conges WHERE statut='validee' AND CURDATE() BETWEEN date_debut AND date_fin");
  const [pd] = await db.query(`SELECT d.nom, COUNT(u.id) n FROM divisions d LEFT JOIN services s ON s.division_id=d.id
    LEFT JOIN users u ON u.service_id=s.id AND u.actif=1 GROUP BY d.id,d.nom ORDER BY n DESC`);
  const [cs] = await db.query('SELECT statut, COUNT(*) n FROM conges GROUP BY statut');
  const [agents] = await db.query(`SELECT u.id,u.nom,u.prenom,u.sexe,u.grade,COALESCE(d.id,0) division_id,COALESCE(d.nom,'Direction') division,
    CASE WHEN EXISTS(SELECT 1 FROM conges c WHERE c.user_id=u.id AND c.statut='validee' AND CURDATE() BETWEEN c.date_debut AND c.date_fin) THEN 'conge'
         WHEN EXISTS(SELECT 1 FROM conges c WHERE c.user_id=u.id AND c.statut IN ('en_attente','traitee_rh')) THEN 'attente' ELSE 'present' END statut
    FROM users u LEFT JOIN services s ON s.id=u.service_id LEFT JOIN divisions d ON d.id=s.division_id WHERE u.actif=1 ORDER BY d.id,u.nom`);
  const [tendance] = await db.query(`SELECT DATE_FORMAT(date_debut,'%Y-%m') m, SUM(jours_ouvrables) j, COUNT(*) n FROM conges WHERE statut<>'refusee'
    AND date_debut >= DATE_SUB(DATE_FORMAT(CURDATE(),'%Y-%m-01'), INTERVAL 11 MONTH) GROUP BY m ORDER BY m`);
  const [naissances] = await db.query("SELECT id,nom,prenom,sexe,date_naissance d,TIMESTAMPDIFF(YEAR,date_naissance,LAST_DAY(CURDATE())) age FROM users WHERE actif=1 AND date_naissance IS NOT NULL AND MONTH(date_naissance)=MONTH(CURDATE()) ORDER BY DAY(date_naissance)");
  const [anciennetes] = await db.query("SELECT id,nom,prenom,sexe,date_recrutement d,TIMESTAMPDIFF(YEAR,date_recrutement,LAST_DAY(CURDATE())) ans FROM users WHERE actif=1 AND date_recrutement IS NOT NULL AND MONTH(date_recrutement)=MONTH(CURDATE()) AND TIMESTAMPDIFF(YEAR,date_recrutement,LAST_DAY(CURDATE()))>=1 ORDER BY DAY(date_recrutement)");
  const [sexes] = await db.query('SELECT sexe, COUNT(*) n FROM users WHERE actif=1 GROUP BY sexe');
  const [parEchelle] = await db.query("SELECT COALESCE(echelle,'–') echelle, COUNT(*) n FROM users WHERE actif=1 GROUP BY echelle ORDER BY CAST(echelle AS UNSIGNED)");
  const [absences] = await db.query(`SELECT c.date_debut,c.date_fin,u.nom,u.prenom FROM conges c JOIN users u ON u.id=c.user_id
    WHERE c.statut='validee' AND c.date_debut<=LAST_DAY(CURDATE()) AND c.date_fin>=DATE_FORMAT(CURDATE(),'%Y-%m-01')`);
  const [dernieres] = await db.query(`SELECT c.id,c.type_conge,c.date_debut,c.date_fin,c.jours_ouvrables,c.statut,u.nom,u.prenom,u.grade
    FROM conges c JOIN users u ON u.id=c.user_id ORDER BY c.id DESC LIMIT 6`);
  const [[bas]] = await db.query('SELECT COUNT(*) n FROM users WHERE actif=1 AND solde_conge<=3');
  const [[ret]] = await db.query('SELECT COUNT(*) n FROM users WHERE actif=1 AND date_naissance IS NOT NULL AND TIMESTAMPDIFF(YEAR,date_naissance,CURDATE())>=58');
  const [[att]] = await db.query("SELECT COUNT(*) n FROM conges WHERE statut IN ('en_attente','traitee_rh') AND created_at < NOW() - INTERVAL 3 DAY");
  res.json({ employes: a.n, divisions: b.n, services: c.n, demandesEnCours: d.n, enCongeAujourdhui: e.n, parDivision: pd, congesParStatut: cs,
    sexes, parEchelle, absences, dernieres, agents, naissances, anciennetes, tendance, alertes: { soldeBas: bas.n, retraite: ret.n, enRetard: att.n } });
}));

// ---------- création du 1er admin au démarrage ----------
initDb().then(async () => {
  const [[n]] = await db.query('SELECT COUNT(*) n FROM users');
  if (!n.n) {
    const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@2026', 10);
    await db.query(
      "INSERT INTO users(matricule,cin,nom,prenom,sexe,email,username,password_hash,role,grade) VALUES ('0001','A000001','Admin','Commune','H','admin@meknes.ma','admin',?,'admin','Administrateur')", [hash]);
    console.log('Admin créé : admin / ' + (process.env.ADMIN_PASSWORD || 'Admin@2026'));
    if (process.env.DEMO_DATA !== '0') { // données de démonstration (mettre DEMO_DATA=0 en production)
      const h = await bcrypt.hash('Demo@2026', 10);
      const U = [['0101','B100101','Idrissi','Fatima','F','rh','rh',1,'Administrateur','10','1976-04-12'],['0102','B100102','Benjelloun','Youssef','H','chef','chef',1,'Chef de service','11','1971-09-03'],
        ['0103','B100103','Alaoui','Hamza','H','agent1','agent',1,'Rédacteur','8','1990-02-18'],['0104','B100104','Tazi','Salma','F','agent2','agent',2,'Technicien','7','1988-06-25'],
        ['0105','B100105','El Fassi','Omar','H','agent3','agent',3,'Adjoint administratif','6','1965-01-30'],['0106','B100106','Berrada','Khadija','F','agent4','agent',4,'Ingénieur','10','1992-11-09'],
        ['0107','B100107','Chraibi','Mehdi','H','agent5','agent',4,'Technicien','7','1985-03-14'],['0108','B100108','Lahlou','Imane','F','agent6','agent',3,'Rédacteur','8','1994-07-21'],
        ['0109','B100109','Squalli','Rachid','H','agent7','agent',2,'Adjoint technique','5','1968-02-02'],['0110','B100110','Ouazzani','Nadia','F','agent8','agent',1,'Administrateur','9','1983-05-16'],
        ['0111','B100111','Kettani','Anas','H','agent9','agent',4,'Ingénieur','10','1989-10-05'],['0112','B100112','Belhaj','Soumia','F','agent10','agent',3,'Adjoint administratif','6','1996-08-28']];
      for (const [m,c,n,p,x,u,r,sv,g,e,dn] of U) await db.query(
        'INSERT INTO users(matricule,cin,nom,prenom,sexe,email,username,password_hash,role,service_id,grade,echelle,date_recrutement,date_naissance) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
        [m,c,n,p,x,u+'@meknes.ma',u,h,r,sv,g,e,'2015-09-01',dn]);
      await db.query("UPDATE users SET solde_conge=2 WHERE username='agent3'"); await db.query("UPDATE users SET solde_conge=3 WHERE username='agent7'");
      await db.query("UPDATE users SET date_naissance=DATE_SUB(CURDATE(),INTERVAL 34 YEAR)+INTERVAL 4 DAY WHERE username='agent1'");
      await db.query("UPDATE users SET date_naissance=DATE_SUB(CURDATE(),INTERVAL 41 YEAR)-INTERVAL 1 DAY WHERE username='agent5'");
      await db.query("UPDATE users SET date_recrutement=DATE_SUB(CURDATE(),INTERVAL 10 YEAR)+INTERVAL 2 DAY WHERE username='chef'");
      await db.query("UPDATE users SET date_recrutement=DATE_SUB(CURDATE(),INTERVAL 5 YEAR)-INTERVAL 1 DAY WHERE username='agent4'");
      for (let m = 1; m <= 11; m++) for (let k = 0; k < 2 + (m % 4); k++) await db.query(
        "INSERT INTO conges(user_id,type_conge,date_debut,date_fin,jours_ouvrables,statut) VALUES (?, 'Annuel', DATE_SUB(CURDATE(),INTERVAL ? MONTH), DATE_SUB(CURDATE(),INTERVAL ? MONTH)+INTERVAL ? DAY, ?, 'validee')",
        [4 + ((m + k) % 9), m, m, 3 + k, 2 + k + (m % 3)]);
      await db.query(`INSERT INTO conges(user_id,type_conge,date_debut,date_fin,jours_ouvrables,statut) VALUES
        (4,'Annuel',CURDATE()+INTERVAL 5 DAY,CURDATE()+INTERVAL 8 DAY,4,'en_attente'),(5,'Maladie',CURDATE()+INTERVAL 2 DAY,CURDATE()+INTERVAL 4 DAY,3,'traitee_rh'),
        (6,'Annuel',CURDATE()-INTERVAL 2 DAY,CURDATE()+INTERVAL 3 DAY,5,'validee'),(7,'Annuel',CURDATE()+INTERVAL 10 DAY,CURDATE()+INTERVAL 18 DAY,7,'validee'),
        (8,'Exceptionnel',CURDATE()-INTERVAL 1 DAY,CURDATE()+INTERVAL 1 DAY,2,'validee'),(9,'Annuel',CURDATE()+INTERVAL 14 DAY,CURDATE()+INTERVAL 20 DAY,5,'en_attente'),
        (10,'Maladie',CURDATE()-INTERVAL 8 DAY,CURDATE()-INTERVAL 5 DAY,4,'refusee'),(11,'Annuel',CURDATE()+INTERVAL 20 DAY,CURDATE()+INTERVAL 24 DAY,4,'validee'),
        (12,'Annuel',CURDATE()+INTERVAL 1 DAY,CURDATE()+INTERVAL 2 DAY,2,'en_attente')`);
      console.log('Données de démonstration créées (mot de passe : Demo@2026)');
    }
  }
}).catch((e) => console.error('ERREUR : MySQL est-il démarré ? ->', e.message));

app.listen(process.env.PORT || 5000, () => console.log('API RH Commune de Meknès sur le port ' + (process.env.PORT || 5000)));
