import React, { useState, useEffect, useCallback } from 'react'
import {
  ThemeProvider, createTheme, CssBaseline, Box, AppBar, Toolbar, Typography, Drawer, List, ListItemButton,
  ListItemText, Button, TextField, Table, TableHead, TableRow, TableCell, TableBody, Paper, Chip, Dialog,
  DialogTitle, DialogContent, DialogActions, MenuItem, Snackbar, Alert, Tabs, Tab, Grid, Stack, IconButton, Avatar, Menu, Checkbox, FormControlLabel,
} from '@mui/material'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const SERIF = { fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 700, letterSpacing: '-0.02em' }
const theme = createTheme({
  palette: { primary: { main: '#a32630' }, secondary: { main: '#d6a53a' }, background: { default: '#f4f2ec', paper: '#ffffff' }, text: { primary: '#2a2220', secondary: '#8a817a' } },
  shape: { borderRadius: 14 }, typography: { fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif', button: { textTransform: 'none', fontWeight: 700 } },
  components: { MuiCssBaseline: { styleOverrides: { body: { background: '#f4f2ec' } } }, MuiPaper: { styleOverrides: { root: { borderRadius: 18, border: '1px solid #ece8df', boxShadow: '0 1px 2px rgba(42,34,32,.04)' } } }, MuiButton: { styleOverrides: { root: { borderRadius: 12 } } },
    MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 12, backgroundColor: '#fffefb' }, notchedOutline: { borderColor: '#e4dfd4' } } } },
})
const Ico = ({ d, c }) => <svg width="18" height="18" viewBox="0 0 24 24" fill={c}><path d={d} fillRule="evenodd" /></svg>
const P = { trash: 'M6 19a2 2 0 002 2h8a2 2 0 002-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z',
  edit: 'M17.65 6.35A7.96 7.96 0 0012 4a8 8 0 108 8h-2a6 6 0 11-1.76-4.24L13 11h7V4l-2.35 2.35z',
  eye: 'M12 4.5C7 4.5 2.7 7.6 1 12c1.7 4.4 6 7.5 11 7.5s9.3-3.1 11-7.5c-1.7-4.4-6-7.5-11-7.5zM12 17a5 5 0 110-10 5 5 0 010 10zm0-8a3 3 0 100 6 3 3 0 000-6z' }
const Act = ({ k, c, t, onClick }) => <IconButton size="small" title={t} onClick={onClick}><Ico d={P[k]} c={c} /></IconButton>
const LOGOS = ['/logo.png', 'https://communemeknes.ma/sites/default/files/logo/logo-meknes.png'] // 1) fichier local public/logo.png  2) logo officiel du site de la commune  3) emblème neutre
const Logo = ({ size = 40 }) => {
  const [n, setN] = useState(0)
  return n < LOGOS.length ? <img src={LOGOS[n]} alt="Commune Urbaine de Meknès" onError={() => setN(n + 1)} style={{ height: size, width: 'auto', maxWidth: size * 3, objectFit: 'contain', display: 'block' }} />
    : <svg width={size} height={size} viewBox="0 0 40 40"><rect width="40" height="40" rx="12" fill="#1d2a6b" /><path d="M20 8 7 14.5V17h26v-2.5L20 8zM10.5 19v9h3.2v-9h-3.2zm5.2 0v9h3.2v-9h-3.2zm5.2 0v9h3.2v-9h-3.2zm5.2 0v9h3.2v-9h-3.2zM7 29.5v2.3h26v-2.3H7z" fill="#fff" /><rect x="7" y="33.5" width="26" height="2" rx="1" fill="#c1272d" /></svg>
}
const SKIN = ['#f2c9a5', '#e0a97d', '#c68863', '#a86f4c', '#f7d9bd'], HAIR = ['#2b2118', '#4a3326', '#1c1c1c', '#6b4a2f', '#8a8f98'], BGS = ['#ffe3d8', '#dff3ee', '#e7e1ff', '#dcefff', '#fff1c9']
const TOPS = ['#a32630', '#267a57', '#d6a53a', '#ff7a59', '#4f7186'], SCARF = ['#e7a3b5', '#9fc5e8', '#c9b8f0', '#f3c98b', '#a7d7c5']
function Face({ id = 0, size = 40, sexe, x, y, clip, square }) {
  const h = (n, m) => (id * 7 + n * 13 + (id % 5) * 3) % m; const f = sexe === 'F', veil = f && h(5, 3) === 0
  const skin = SKIN[h(1, 5)], hair = HAIR[h(2, 5)], sc = SCARF[h(6, 5)]
  const body = <>
    <rect width="64" height="64" fill={BGS[h(3, 5)]} /><path d="M8 64c2-15 13-21 24-21s22 6 24 21z" fill={TOPS[h(4, 5)]} /><rect x="28" y="36" width="8" height="10" fill={skin} />
    {veil && <path d="M16 31c0-15 7-22 16-22s16 7 16 22c0 9-3 15-3 15H19s-3-6-3-15z" fill={sc} />}
    {f && !veil && <path d="M16 34c-2-16 6-24 16-24s18 8 16 24c-1 8-4 12-4 12H20s-3-4-4-12z" fill={hair} />}
    <ellipse cx="32" cy="29" rx={veil ? 9.5 : 11} ry={veil ? 11.5 : 13} fill={skin} />
    {!veil && <path d={f ? 'M20 28c0-12 7-16 12-16s12 4 12 16c-3-6-8-8-12-8s-9 2-12 8z' : 'M20 26c0-10 6-15 12-15s12 5 12 15c-2-4-5-6-12-6s-10 2-12 6z'} fill={hair} />}
    {veil && <path d="M21 25c3-7 19-7 22 0-5-3-17-3-22 0z" fill={sc} />}
    <circle cx="27.5" cy="30" r="1.3" fill="#2a2220" /><circle cx="36.5" cy="30" r="1.3" fill="#2a2220" /><path d="M28 36c2.5 2 5.5 2 8 0" stroke="#2a2220" strokeWidth="1.4" fill="none" strokeLinecap="round" /></>
  return <svg viewBox="0 0 64 64" width={size} height={size} x={x} y={y} style={{ borderRadius: square ? 0 : '50%', display: 'block', flexShrink: 0 }}>
    {clip ? <><defs><clipPath id="fc"><circle cx="32" cy="32" r="32" /></clipPath></defs><g clipPath="url(#fc)">{body}</g></> : body}</svg>
}
const Seg = ({ value, onChange, opts }) => <Stack direction="row" spacing={1}>{opts.map(([v, l]) =>
  <Button key={v} size="small" variant={value === v ? 'contained' : 'outlined'} onClick={() => onChange(v)}
    sx={{ textTransform: 'none', ...(value !== v && { bgcolor: '#ffffff' }) }}>{l}</Button>)}</Stack>
const BLUE = { background: 'linear-gradient(135deg,#b32a36,#8f1f2b)', color: '#fff', boxShadow: '0 10px 22px rgba(163,38,48,.28)', '&:hover': { background: 'linear-gradient(135deg,#a32630,#7a1f2b)' } }

async function api(path, { method = 'GET', body } = {}) {
  const r = await fetch(API + path, {
    method, body: body && JSON.stringify(body),
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + (localStorage.getItem('token') || '') },
  })
  const d = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(d.message || 'Erreur')
  return d
}
const STATUT = { en_attente: ['En attente', 'warning'], traitee_rh: ['Traitée par RH', 'info'], validee: ['Validée', 'success'], refusee: ['Refusée', 'error'] }
const ROLE = { admin: 'Administrateur', rh: 'Responsable RH', chef: 'Chef hiérarchique', agent: 'Agent' }
const PILL = { en_attente: ['#f5ecd3', '#9a7420', 'En attente'], traitee_rh: ['#e3ebf0', '#4f7186', 'Traitée RH'], validee: ['#e4efe9', '#267a57', 'Validée'], refusee: ['#f6e4e1', '#a32630', 'Refusée'] }
const Badge = ({ s }) => <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: .8, px: 1.4, py: .4, borderRadius: 99, bgcolor: PILL[s][0], color: PILL[s][1], fontSize: 12, fontWeight: 700 }}><Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'currentColor' }} />{PILL[s][2]}</Box>

function printHtml(title, inner) {
  const w = window.open('', '_blank')
  w.document.write(`<html><head><title>${title}</title><style>body{font-family:Georgia,serif;padding:48px;max-width:760px;margin:auto}
  h3,h4,p.c{text-align:center}table{width:100%;border-collapse:collapse;margin:16px 0}td,th{border:1px solid #333;padding:8px}
  .sig{margin-top:60px;text-align:right}</style></head><body>
  <p class="c"><b>ROYAUME DU MAROC<br>Commune Urbaine de Meknès<br>Division des Ressources Humaines</b></p>${inner}</body></html>`)
  w.document.close(); w.print()
}
const today = () => new Date().toLocaleDateString('fr-FR')

function Form({ title, fields, init = {}, onSubmit, onClose }) {
  const [v, setV] = useState(init)
  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0 }}>
          {fields.map((f) => (
            <Grid item xs={12} sm={f.full ? 12 : 6} key={f.k}>
              <TextField fullWidth size="small" label={f.l} type={f.t || 'text'} select={!!f.opts} value={v[f.k] ?? ''}
                InputLabelProps={f.t === 'date' ? { shrink: true } : undefined}
                onChange={(e) => setV({ ...v, [f.k]: e.target.value })}>
                {f.opts && f.opts.map((o) => <MenuItem key={o.v ?? o} value={o.v ?? o}>{o.l ?? o}</MenuItem>)}
              </TextField>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions><Button onClick={onClose}>Annuler</Button><Button variant="contained" onClick={() => onSubmit(v)}>Enregistrer</Button></DialogActions>
    </Dialog>
  )
}
const Grid2 = ({ cols, rows, empty = 'Aucune donnée' }) => (
  <Box sx={{ bgcolor: '#ffffff', borderRadius: 2, overflow: 'auto', p: 1 }}>
    <Table size="medium" sx={{ '& td,& th': { textAlign: 'center', borderBottom: '1px solid #eef2f6' } }}>
      <TableHead><TableRow>{cols.map((c) => <TableCell key={c.l} sx={{ fontWeight: 600, color: '#5d534c' }}>{c.l}</TableCell>)}</TableRow></TableHead>
      <TableBody>{rows.length ? rows.map((r, i) => <TableRow key={r.id ?? i} hover>{cols.map((c) => <TableCell key={c.l}>{c.r(r)}</TableCell>)}</TableRow>)
        : <TableRow><TableCell colSpan={cols.length}>{empty}</TableCell></TableRow>}</TableBody></Table></Box>
)

// ---------- pages ----------
const PK = { users: 'M16 11a3 3 0 100-6 3 3 0 000 6zm-8 0a3 3 0 100-6 3 3 0 000 6zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z',
  org: 'M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z', clock: 'M12 2a10 10 0 100 20 10 10 0 000-20zm.5 5H11v6l5.25 3.15.75-1.23-4.5-2.67V7z',
  sun: 'M12 7a5 5 0 100 10 5 5 0 000-10zM2 13h2v-2H2v2zm18 0h2v-2h-2v2zM11 2v2h2V2h-2zm0 18v2h2v-2h-2z' }
const STC = { en_attente: '#d6a53a', traitee_rh: '#4f7186', validee: '#267a57', refusee: '#dc2626' }

function Donut({ data, colors, size = 150 }) {
  const tot = data.reduce((a, d) => a + d.n, 0); const T = tot || 1; let off = 0; const C = 2 * Math.PI * 54
  return <svg viewBox="0 0 140 140" width={size} height={size}><g transform="rotate(-90 70 70)"><circle cx="70" cy="70" r="54" fill="none" stroke="#ece8df" strokeWidth="16" />
    {data.map((d) => { const len = (d.n / T) * C; const el = <circle key={d.key} cx="70" cy="70" r="54" fill="none" stroke={colors[d.key]} strokeWidth="16"
      strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-off} />; off += len; return el })}</g>
    <text x="70" y="77" textAnchor="middle" fontSize="26" fontWeight="700" fill="#2a2220">{tot}</text></svg>
}
const Skyline = () => <svg viewBox="0 0 400 140" preserveAspectRatio="xMaxYMax meet" style={{ position: 'absolute', right: 0, bottom: 0, height: '100%', opacity: .16 }} fill="#ffffff">
  {[[20, 70, 40], [70, 30, 34], [112, 55, 48], [170, 8, 30], [208, 60, 44], [262, 36, 36], [306, 80, 50], [364, 50, 30]].map(([x, y, w]) => <rect key={x} x={x} y={y} width={w} height={140 - y} />)}</svg>

function Calendrier({ abs }) {
  const now = new Date(); const y = now.getFullYear(), m = now.getMonth(); const nd = new Date(y, m + 1, 0).getDate(); const lead = (new Date(y, m, 1).getDay() + 6) % 7
  const iso = (d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  const who = (d) => abs.filter((a) => a.date_debut <= iso(d) && a.date_fin >= iso(d))
  return <Box><Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, textTransform: 'capitalize' }}>{now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</Typography>
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: .6, textAlign: 'center' }}>
      {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => <Typography key={i} variant="caption" color="text.secondary">{d}</Typography>)}
      {Array.from({ length: lead }, (_, i) => <Box key={'e' + i} />)}
      {Array.from({ length: nd }, (_, i) => { const d = i + 1, w = who(d), wk = (lead + i) % 7 > 4, today = d === now.getDate()
        return <Box key={d} title={w.map((a) => `${a.prenom} ${a.nom}`).join(', ')} sx={{ py: .9, borderRadius: 2, fontSize: 13, fontWeight: w.length || today ? 700 : 400,
          color: w.length ? '#fff' : wk ? '#94a3b8' : '#2a2220', bgcolor: w.length ? '#4f7186' : 'transparent', outline: today ? '2px solid #a32630' : 0 }}>{d}</Box> })}</Box>
    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>Jours en bleu : agents en congé validé (survolez pour les noms).</Typography></Box>
}

const SC = { present: '#267a57', conge: '#4f7186', attente: '#d6a53a' }; const SL = { present: 'Présent', conge: 'En congé', attente: 'Demande en cours' }
function Constellation({ agents, me, go, summary, total }) {
  const [sel, setSel] = useState(null); const [hov, setHov] = useState(null)
  const divs = []; agents.forEach((a) => { let d = divs.find((x) => x.id === a.division_id); if (!d) divs.push(d = { id: a.division_id, nom: a.division, list: [] }); d.list.push(a) })
  const cx = 380, cy = 280, m = Math.max(divs.length, 1); const P = (g, r) => [cx + r * Math.cos(g), cy + r * Math.sin(g)]
  const cur = divs.find((d) => d.id === sel); const shown = cur ? cur.list : agents; const cnt = (k) => shown.filter((a) => a.statut === k).length
  return <Paper sx={{ color: '#2a2220', overflow: 'hidden', backgroundColor: '#ffffff', backgroundImage: 'radial-gradient(circle at 25% 0%,#f6ebe9,transparent 55%),linear-gradient(rgba(30,58,138,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(30,58,138,.045) 1px,transparent 1px)', backgroundSize: 'auto,34px 34px,34px 34px' }}>
    <Grid container>
      <Grid item xs={12} md={8} sx={{ p: 3, position: 'relative' }}>
        <Typography variant="body2" sx={{ opacity: .7 }}>Présidence · Constellation RH</Typography>
        <Typography sx={{ ...SERIF, fontSize: 28 }}>Bonjour, {me.prenom}</Typography>
        <Typography sx={{ opacity: .85, mt: .5 }}>{summary}</Typography>
        <svg viewBox="0 0 760 560" width="100%" style={{ marginTop: 4 }}>
          <g fill="none" stroke="rgba(30,58,138,.16)"><circle cx={cx} cy={cy} r="125" /><circle cx={cx} cy={cy} r="225" strokeDasharray="2 7" /><circle cx={cx} cy={cy} r="265" /></g>
          {divs.map((d, k) => { const a0 = ((2 * Math.PI) / m) * k - Math.PI / 2; const [dx, dy] = P(a0, 125); const dim = sel !== null && sel !== d.id; const n = d.list.length; const span = Math.min(((2 * Math.PI) / m) * 0.72, 1.6)
            const [lx, ly] = P(a0, 163)
            return <g key={d.id} opacity={dim ? .2 : 1} style={{ transition: 'opacity .35s' }}>
              <line x1={cx} y1={cy} x2={dx} y2={dy} stroke="rgba(30,58,138,.4)" />
              {d.list.map((a, i) => { const [ax, ay] = P(a0 + (n > 1 ? (i / (n - 1) - .5) * span : 0), 228)
                return <g key={a.id} onMouseEnter={() => setHov(a)} onMouseLeave={() => setHov(null)} style={{ cursor: 'pointer' }}>
                  <line x1={dx} y1={dy} x2={ax} y2={ay} stroke="rgba(30,58,138,.2)" />
                  <circle cx={ax} cy={ay} r="21" fill="none" stroke={SC[a.statut]} strokeWidth="3">{a.statut === 'attente' && <animate attributeName="stroke-opacity" values="1;.25;1" dur="2s" repeatCount="indefinite" />}</circle>
                  <Face id={a.id} sexe={a.sexe} size={36} x={ax - 18} y={ay - 18} clip /></g> })}
              <g onClick={() => setSel(sel === d.id ? null : d.id)} style={{ cursor: 'pointer' }}>
                <circle cx={dx} cy={dy} r="23" fill="#ffffff" stroke={sel === d.id ? '#c1272d' : '#a32630'} strokeWidth="2" />
                <text x={dx} y={dy + 5} textAnchor="middle" fontSize="14" fontWeight="700" fill="#a32630">{n}</text>
                <text x={lx} y={ly + 4} textAnchor="middle" fontSize="12" fill="#5d534c" stroke="#ffffff" strokeWidth="4" paintOrder="stroke">{d.nom.replace('Division ', '').replace('des ', '').slice(0, 20)}</text></g></g> })}
          <circle cx={cx} cy={cy} r="50" fill="#a32630" stroke="#a32630" strokeWidth="2" /><circle cx={cx} cy={cy} r="62" fill="none" stroke="rgba(30,58,138,.3)" />
          <text x={cx} y={cy - 2} textAnchor="middle" fontSize="26" fontWeight="800" fill="#ffffff">{total}</text><text x={cx} y={cy + 16} textAnchor="middle" fontSize="11" fill="#dbe5ff">agents · Meknès</text></svg>
        <Stack direction="row" spacing={3} sx={{ mt: 1 }}>{Object.keys(SC).map((k) => <Typography key={k} variant="body2" sx={{ color: '#6f665f' }}><span style={{ color: SC[k] }}>●</span> {SL[k]}</Typography>)}</Stack>
        {hov && <Box sx={{ position: 'absolute', left: 24, bottom: 24, px: 2, py: 1.2, borderRadius: 2, bgcolor: '#ffffff', border: '1px solid #e3dff2', boxShadow: '0 8px 24px rgba(15,23,42,.12)' }}>
          <Typography sx={{ fontWeight: 700 }}>{hov.prenom} {hov.nom}</Typography><Typography variant="body2" sx={{ opacity: .8 }}>{hov.grade || '–'} · {hov.division}</Typography>
          <Typography variant="body2" sx={{ color: SC[hov.statut], fontWeight: 600 }}>● {SL[hov.statut]}</Typography></Box>}</Grid>
      <Grid item xs={12} md={4} sx={{ p: 3, borderLeft: { md: '1px solid rgba(30,58,138,.18)' }, bgcolor: '#faf9fe' }}>
        <Typography variant="body2" sx={{ opacity: .7 }}>Zone observée</Typography><Typography sx={{ ...SERIF, fontSize: 22, mb: 2 }}>{cur ? cur.nom : 'Toute la commune'}</Typography>
        <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>{Object.keys(SC).map((k) => <Box key={k} sx={{ flex: 1, p: 1.2, borderRadius: 2, bgcolor: '#ffffff', border: '1px solid #ece8df' }}>
          <Typography sx={{ ...SERIF, fontSize: 26, color: SC[k], lineHeight: 1 }}>{cnt(k)}</Typography><Typography variant="caption" sx={{ opacity: .75 }}>{SL[k]}</Typography></Box>)}</Stack>
        <Box sx={{ maxHeight: 250, overflow: 'auto' }}>{shown.map((a) => <Stack key={a.id} direction="row" spacing={1.5} alignItems="center" sx={{ py: .9, borderBottom: '1px solid #ece8df' }}>
          <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: SC[a.statut] }} /><Box><Typography variant="body2">{a.prenom} {a.nom}</Typography><Typography variant="caption" sx={{ opacity: .6 }}>{a.grade}</Typography></Box></Stack>)}</Box>
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}><Button size="small" variant="contained" onClick={() => go('gestion')} sx={{ bgcolor: '#a32630', color: '#fff', '&:hover': { bgcolor: '#7a1f2b' } }}>Traiter les demandes</Button>
          {cur && <Button size="small" onClick={() => setSel(null)} sx={{ color: '#a32630' }}>Tout afficher</Button>}</Stack></Grid></Grid></Paper>
}

const MOIS = ['janv', 'févr', 'mars', 'avr', 'mai', 'juin', 'juil', 'août', 'sept', 'oct', 'nov', 'déc']
function Ring({ pct, color, size = 60 }) {
  const c = 2 * Math.PI * 22
  return <svg width={size} height={size} viewBox="0 0 56 56"><circle cx="28" cy="28" r="22" fill="none" stroke="#f6ebe9" strokeWidth="6" />
    <circle cx="28" cy="28" r="22" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" strokeDasharray={`${(Math.min(100, pct) / 100) * c} ${c}`} transform="rotate(-90 28 28)" />
    <text x="28" y="33" textAnchor="middle" fontSize="15" fontWeight="700" fill={color}>↗</text></svg>
}
function Gauge({ pct }) {
  const v = Math.min(100, Math.max(0, pct)); const c = Math.PI * 80
  return <svg viewBox="0 0 200 118" width="100%" style={{ maxWidth: 270 }}><defs><linearGradient id="gg"><stop offset="0" stopColor="#d6a53a" /><stop offset="1" stopColor="#a32630" /></linearGradient></defs>
    <path d="M20 100A80 80 0 0 1 180 100" fill="none" stroke="#f6ebe9" strokeWidth="18" strokeLinecap="round" />
    <path d="M20 100A80 80 0 0 1 180 100" fill="none" stroke="url(#gg)" strokeWidth="18" strokeLinecap="round" strokeDasharray={`${(v / 100) * c} ${c}`} />
    <text x="100" y="92" textAnchor="middle" fontSize="30" fontWeight="800" fill="#2a2220">{v}%</text></svg>
}
function SmoothChart({ data, h = 230 }) {
  const [hv, setHv] = useState(null); const W = 640, pad = 30; const mx = Math.max(5, ...data.map((d) => d.j))
  const X = (i) => pad + (i * (W - 2 * pad)) / Math.max(1, data.length - 1), Y = (v) => h - pad - (v / mx) * (h - 2 * pad - 10); const pts = data.map((d, i) => [X(i), Y(d.j)])
  const path = pts.map((p, i) => { if (!i) return `M${p[0]},${p[1]}`; const q = pts[i - 1], c = (p[0] - q[0]) / 2; return `C${q[0] + c},${q[1]} ${p[0] - c},${p[1]} ${p[0]},${p[1]}` }).join(' ')
  return <svg viewBox={`0 0 ${W} ${h}`} width="100%"><defs><linearGradient id="ar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#a32630" stopOpacity=".35" /><stop offset="1" stopColor="#a32630" stopOpacity="0" /></linearGradient></defs>
    {[0, .5, 1].map((t) => <g key={t}><line x1={pad} x2={W - pad} y1={Y(mx * t)} y2={Y(mx * t)} stroke="#ece8df" /><text x="2" y={Y(mx * t) + 4} fontSize="11" fill="#8a817a">{Math.round(mx * t)}</text></g>)}
    <path d={`${path} L${X(data.length - 1)},${h - pad} L${X(0)},${h - pad} Z`} fill="url(#ar)" /><path d={path} fill="none" stroke="#a32630" strokeWidth="3.5" strokeLinecap="round" />
    {data.map((d, i) => <g key={d.m} onMouseEnter={() => setHv(i)} onMouseLeave={() => setHv(null)}><rect x={X(i) - 20} y="0" width="40" height={h} fill="transparent" />
      <text x={X(i)} y={h - 8} textAnchor="middle" fontSize="11" fill="#8a817a">{MOIS[+d.m.slice(5) - 1]}</text>
      {hv === i && <><line x1={X(i)} x2={X(i)} y1="8" y2={h - pad} stroke="#a32630" strokeDasharray="3 4" /><circle cx={X(i)} cy={Y(d.j)} r="6" fill="#fff" stroke="#a32630" strokeWidth="3" />
        <rect x={Math.min(X(i) - 52, W - 112)} y="4" width="104" height="38" rx="10" fill="#fff" stroke="#ece8df" /><text x={Math.min(X(i) - 52, W - 112) + 52} y="21" textAnchor="middle" fontSize="12" fontWeight="700" fill="#2a2220">{d.j} jours</text>
        <text x={Math.min(X(i) - 52, W - 112) + 52} y="35" textAnchor="middle" fontSize="11" fill="#8a817a">{d.n} demande(s)</text></>}</g>)}</svg>
}
const DESC = [[/\/employes\/\d+\/actif/, 'Activation / désactivation d’un agent'], [/\/employes\/\d+/, 'Modification d’un agent'], [/\/employes/, 'Création d’un agent'], [/conges\/\d+\/traiter/, 'Traitement RH d’un congé'], [/conges\/\d+\/valider/, 'Validation d’un congé'], [/conges\/\d+\/refuser/, 'Refus d’un congé'],
  [/conges\/\d+/, 'Suppression d’une demande de congé'], [/conges/, 'Nouvelle demande de congé'], [/missions\/\d+/, 'Décision sur un ordre de mission'], [/missions/, 'Nouvel ordre de mission'], [/attestations/, 'Demande d’attestation'], [/divisions|services/, 'Modification de l’organisation']]
const descr = (a) => (a === 'Connexion' ? 'Connexion à la plateforme' : (DESC.find(([re]) => re.test(a.split(' ')[1] || '')) || [0, a])[1])
function Audit({ notify, cmd }) {
  const [rows, setRows] = useState([]); const [pg, setPg] = useState(1); useEffect(() => { api('/audit').then(setRows).catch((e) => notify(e.message)) }, [])
  useEffect(() => { if (cmd && cmd.name === 'export') { const csv = 'date;utilisateur;action\n' + rows.map((r) => `${r.created_at};${r.prenom || ''} ${r.nom || ''};${descr(r.action)}`).join('\n'); const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv' })); a.download = 'journal-audit.csv'; a.click() } }, [cmd && cmd.n])
  const N = 8, pages = Math.max(1, Math.ceil(rows.length / N)), cur = rows.slice((pg - 1) * N, pg * N); const c = (re) => rows.filter((r) => re.test(r.action)).length
  return <Grid container spacing={3}><Grid item xs={12} md={9}><Paper sx={{ overflow: 'hidden' }}><DT rows={cur} cols={[{ l: 'Date / heure', r: (r) => r.created_at }, { l: 'Utilisateur', r: (r) => <Stack direction="row" spacing={1.5} alignItems="center"><Ini nom={r.nom || ''} prenom={r.prenom || '?'} i={r.id} size={30} /><b style={{ color: '#2a2220' }}>{r.nom ? `${r.prenom} ${r.nom}` : '—'}</b></Stack> },
    { l: 'Action', r: (r) => descr(r.action) }, { l: 'Détail technique', r: (r) => <code style={{ fontSize: 11 }}>{r.action}</code> }, { l: 'Résultat', r: () => <Pill t={STJ.actif.slice(0, 2).concat('Réussi')} /> }]} />
    <Pager page={pg} pages={pages} onPage={setPg} text={`${cur.length} événements sur ${rows.length}`} /></Paper></Grid>
    <Grid item xs={12} md={3}><Box sx={{ p: 3, borderRadius: 4, bgcolor: '#5a1a1e', color: '#fff' }}><Ico d={IC.shield} c="#e0b95a" /><Typography sx={{ fontWeight: 800, mt: 1.5 }}>Traçabilité complète</Typography><Typography sx={{ fontSize: 12, opacity: .7, mb: 2 }}>Chaque action sensible est consignée.</Typography>
      {[['Connexions', c(/^Connexion/)], ['Modifications', c(/^(PUT|POST|PATCH|DELETE)/)], ['Décisions', c(/valider|refuser|traiter/)]].map(([l, n]) => <Stack key={l} direction="row" justifyContent="space-between" sx={{ py: .8, fontSize: 13 }}><span style={{ opacity: .8 }}>{l}</span><b>{n}</b></Stack>)}</Box></Grid></Grid>
}
function DonutPct({ parts, label, size = 190 }) {
  const T = parts.reduce((a, p) => a + p.n, 0) || 1; let off = 0; const C = 2 * Math.PI * 54
  return <svg viewBox="0 0 140 140" width={size} height={size}><g transform="rotate(-90 70 70)"><circle cx="70" cy="70" r="54" fill="none" stroke="#ece8df" strokeWidth="14" />
    {parts.map((p) => { const len = (p.n / T) * C; const el = <circle key={p.c} cx="70" cy="70" r="54" fill="none" stroke={p.c} strokeWidth="14" strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-off} />; off += len; return el })}</g>
    <text x="70" y="73" textAnchor="middle" fontSize="24" fontWeight="800" fill="#2a2220">{label}</text><text x="70" y="88" textAnchor="middle" fontSize="9" fill="#8a817a">présents</text></svg>
}
function Dashboard({ notify, me, go }) {
  const [s, setS] = useState({})
  useEffect(() => { api('/stats').then(setS).catch((e) => notify(e.message)) }, [])
  const tot = s.employes || 0, conge = s.enCongeAujourdhui || 0, enc = s.demandesEnCours || 0, pres = Math.max(0, tot - conge), pct = tot ? Math.round((pres / tot) * 100) : 0
  const sx = Object.fromEntries((s.sexes || []).map((x) => [x.sexe, x.n])); const pd = s.parDivision || []; const al = s.alertes || {}; const maxd = Math.max(1, ...pd.map((d) => d.n))
  const now = new Date(); const tr = Array.from({ length: 12 }, (_, i) => { const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1); const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const r = (s.tendance || []).find((t) => t.m === m); return { m, j: r ? Number(r.j) : 0, n: r ? r.n : 0 } })
  const alerts = [[al.enRetard, 'demande(s) en attente depuis plus de 3 jours', '#a32630'], [al.soldeBas, 'agent(s) dont le solde de congé est de 3 jours ou moins', '#d6a53a'], [al.retraite, 'agent(s) âgés de 58 ans et plus', '#4f7186']].filter((a) => a[0] > 0)
  const kp = [['EFFECTIF TOTAL', tot, `${sx.F || 0} F · ${sx.H || 0} H`, 'users', ['#f6e4e1', '#a32630']], ['AGENTS PRÉSENTS', pres, `${pct}% de l’effectif`, 'check', ['#e4efe9', '#267a57']],
    ['DEMANDES EN ATTENTE', enc, al.enRetard ? `${al.enRetard} en retard` : 'aucun retard', 'clock', ['#f5ecd3', '#9a7420']], ['EN CONGÉ', conge, `${tot ? Math.round((conge / tot) * 100) : 0}% de l’effectif`, 'req', ['#e3ebf0', '#4f7186']]]
  const Card = ({ title, sub, link, onLink, children }) => <Paper sx={{ p: 3, height: '100%' }}><Stack direction="row" justifyContent="space-between" alignItems="flex-start"><Box><Typography sx={{ fontWeight: 800, fontSize: 15 }}>{title}</Typography>{sub && <Typography variant="caption" color="text.secondary">{sub}</Typography>}</Box>
    {link && <Typography onClick={onLink} sx={{ color: '#a32630', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>{link} →</Typography>}</Stack><Box sx={{ mt: 2.5 }}>{children}</Box></Paper>
  const COL4 = ['#a32630', '#d6a53a', '#267a57', '#4f7186']
  return <Stack spacing={3}>
    <Grid container spacing={2.5}>{kp.map(([l, n, sub, ic, t]) => <Grid item xs={12} sm={6} lg={3} key={l}><Paper sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between"><Box sx={{ width: 44, height: 44, borderRadius: 3.5, display: 'grid', placeItems: 'center', bgcolor: t[0] }}><Ico d={IC[ic]} c={t[1]} /></Box><Typography color="text.secondary">···</Typography></Stack>
      <Typography sx={{ mt: 3, fontSize: 11, letterSpacing: 1.2, fontWeight: 700, color: 'text.secondary' }}>{l}</Typography>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-end"><Typography sx={{ fontSize: 42, fontWeight: 800, lineHeight: 1.1 }}>{n}</Typography><Typography variant="caption" color="text.secondary">{sub}</Typography></Stack></Paper></Grid>)}</Grid>
    <Grid container spacing={3}>
      <Grid item xs={12} lg={8}><Card title="Évolution des congés" sub="Jours ouvrables par mois · 12 derniers mois"><SmoothChart data={tr} /></Card></Grid>
      <Grid item xs={12} lg={4}><Card title="Présence aujourd’hui" sub={now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}>
        <Stack alignItems="center" spacing={2}><DonutPct parts={[{ n: pres, c: '#267a57' }, { n: conge, c: '#d6a53a' }]} label={`${pct}%`} />
          <Stack direction="row" spacing={3}><Typography variant="body2"><span style={{ color: '#267a57' }}>●</span> Présents <b>{pres}</b></Typography><Typography variant="body2"><span style={{ color: '#d6a53a' }}>●</span> En congé <b>{conge}</b></Typography></Stack></Stack></Card></Grid></Grid>
    <Grid container spacing={3}>
      <Grid item xs={12} md={7}><Card title="Demandes récentes" sub="À traiter par la division RH" link="Voir toutes" onLink={() => go('gestion')}>{(s.dernieres || []).map((r) => <Stack key={r.id} direction="row" spacing={2} alignItems="center" sx={{ py: 1.4, borderTop: '1px solid #ece8df' }}>
        <Ini nom={r.nom} prenom={r.prenom} i={r.id} size={40} /><Box sx={{ flex: 1 }}><Typography sx={{ fontWeight: 700, fontSize: 14 }}>{r.prenom} {r.nom}</Typography><Typography variant="caption" color="text.secondary">{r.type_conge} · {r.date_debut.slice(5)} → {r.date_fin.slice(5)}</Typography></Box><Badge s={r.statut} /></Stack>)}</Card></Grid>
      <Grid item xs={12} md={5}><Card title="Répartition par division" sub={`${tot} agents au total`}>{pd.map((d, i) => <Box key={d.nom} sx={{ mb: 2.4 }}><Stack direction="row" justifyContent="space-between"><Typography sx={{ fontSize: 13, fontWeight: 700 }}>{d.nom}</Typography><Typography variant="body2" color="text.secondary">{d.n}</Typography></Stack>
        <Box sx={{ height: 7, bgcolor: '#ece8df', borderRadius: 4, mt: .8 }}><Box sx={{ height: 7, borderRadius: 4, width: `${(d.n / maxd) * 100}%`, bgcolor: COL4[i % 4] }} /></Box></Box>)}</Card></Grid></Grid>
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}><Card title="Calendrier des absences"><Calendrier abs={s.absences || []} /></Card></Grid>
      <Grid item xs={12} md={4}><Card title="Anniversaires du mois">{(s.naissances || []).length ? s.naissances.map((p) => <Stack key={p.id} direction="row" spacing={1.5} alignItems="center" sx={{ py: 1 }}><Ini nom={p.nom} prenom={p.prenom} i={p.id} size={38} />
        <Box><Typography variant="body2"><b>{p.prenom} {p.nom}</b></Typography><Typography variant="caption" color="text.secondary">{p.d.slice(8)} · {p.age} ans</Typography></Box></Stack>) : <Typography color="text.secondary">Aucun anniversaire ce mois-ci.</Typography>}</Card></Grid>
      <Grid item xs={12} md={4}><Card title="Points d’attention">{alerts.length ? alerts.map(([n, t, c]) => <Stack key={t} direction="row" spacing={1.5} alignItems="center" sx={{ py: 1.1 }}>
        <Box sx={{ minWidth: 32, height: 32, borderRadius: 3, display: 'grid', placeItems: 'center', bgcolor: c + '22', color: c, fontWeight: 800 }}>{n}</Box><Typography variant="body2">{t}</Typography></Stack>) : <Typography color="text.secondary">Aucune alerte : tout est à jour.</Typography>}</Card></Grid></Grid>
  </Stack>
}

const fD = (d) => new Date(String(d).slice(0, 10) + 'T00:00:00')
const per = (a, b) => { const x = fD(a), y = fD(b), o = { day: '2-digit', month: 'short' }, yr = y.getFullYear(); if (String(a).slice(0, 10) === String(b).slice(0, 10)) return `${x.toLocaleDateString('fr-FR', o)} ${yr}`
  return x.getMonth() === y.getMonth() ? `${String(x.getDate()).padStart(2, '0')} – ${y.toLocaleDateString('fr-FR', o)} ${yr}` : `${x.toLocaleDateString('fr-FR', o)} – ${y.toLocaleDateString('fr-FR', o)} ${yr}` }
const dur = (a, b) => Math.round((fD(b) - fD(a)) / 864e5) + 1
const frDate = (d) => (d ? fD(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '–')
const Eyebrow = ({ children }) => <Typography sx={{ fontSize: 10.5, letterSpacing: 1.3, fontWeight: 700, color: '#8a817a', textTransform: 'uppercase' }}>{children}</Typography>
const Pager = ({ page, pages, onPage, text }) => <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 3, py: 2, borderTop: '1px solid #ece8df' }}><Typography variant="caption" color="text.secondary">{text}</Typography>
  <Stack direction="row" spacing={1}>{Array.from({ length: pages }, (_, i) => i + 1).map((n) => <Box key={n} onClick={() => onPage(n)} sx={{ width: 30, height: 30, borderRadius: 2, display: 'grid', placeItems: 'center', cursor: 'pointer', fontSize: 12, fontWeight: 700, border: '1px solid #ece8df', bgcolor: n === page ? '#a32630' : '#fff', color: n === page ? '#fff' : '#5d534c' }}>{n}</Box>)}</Stack></Stack>
const DT = ({ cols, rows }) => <Table size="medium" sx={{ '& th': { bgcolor: '#faf8f3', fontSize: 10.5, letterSpacing: 1.1, fontWeight: 700, color: '#9a9088', borderBottom: '1px solid #ece8df', textTransform: 'uppercase' }, '& td': { fontSize: 13, color: '#5d534c', borderBottom: '1px solid #f0ece3' } }}>
  <TableHead><TableRow>{cols.map((c) => <TableCell key={c.l}>{c.l}</TableCell>)}</TableRow></TableHead><TableBody>{rows.length ? rows.map((r, i) => <TableRow key={r.id ?? i} hover>{cols.map((c) => <TableCell key={c.l}>{c.r(r)}</TableCell>)}</TableRow>)
    : <TableRow><TableCell colSpan={cols.length} align="center">Aucun résultat</TableCell></TableRow>}</TableBody></Table>
const Search = ({ value, onChange, ph }) => <TextField size="small" placeholder={ph} value={value} onChange={(e) => onChange(e.target.value)} sx={{ flex: 1 }} InputProps={{ startAdornment: <Box sx={{ mr: 1, display: 'flex' }}><Ico d={IC.search} c="#9a9088" /></Box> }} />
const Sel = ({ value, onChange, opts, w = 170 }) => <TextField select size="small" value={value} onChange={(e) => onChange(e.target.value)} sx={{ width: w }}>{opts.map(([v, l]) => <MenuItem key={v} value={v}>{l}</MenuItem>)}</TextField>
const Tab2 = ({ tabs, value, onChange }) => <Stack direction="row" spacing={3} sx={{ px: 3, pt: 2.5, borderBottom: '1px solid #ece8df' }}>{tabs.map(([v, l]) => <Box key={v} onClick={() => onChange(v)} sx={{ pb: 1.5, cursor: 'pointer', fontSize: 12.5, fontWeight: 700, color: value === v ? '#a32630' : '#8a817a', borderBottom: value === v ? '2px solid #a32630' : '2px solid transparent', mb: '-1px' }}>{l}</Box>)}</Stack>
const KPI = ({ label, value, sub, ic, t }) => <Paper sx={{ p: 3, flex: 1 }}><Stack direction="row" justifyContent="space-between"><Box><Eyebrow>{label}</Eyebrow><Typography sx={{ fontSize: 40, fontWeight: 800, lineHeight: 1.2, mt: 1 }}>{value}</Typography></Box>
  <Box sx={{ width: 42, height: 42, borderRadius: 3, display: 'grid', placeItems: 'center', bgcolor: t[0] }}><Ico d={IC[ic]} c={t[1]} /></Box></Stack><Typography variant="caption" color="text.secondary">{sub}</Typography></Paper>
const LNK = { color: '#a32630', fontWeight: 700, fontSize: 13, cursor: 'pointer' }
const STJ = { actif: ['#e4efe9', '#267a57', 'Actif'], conge: ['#f5ecd3', '#9a7420', 'En congé'], mission: ['#e3ebf0', '#4f7186', 'Mission'], off: ['#f6e4e1', '#a32630', 'Désactivé'] }
const Pill = ({ t }) => <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: .8, px: 1.4, py: .4, borderRadius: 99, bgcolor: t[0], color: t[1], fontSize: 12, fontWeight: 700 }}><Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'currentColor' }} />{t[2]}</Box>

function Profil({ me }) {
  const ans = me.date_recrutement ? Math.max(0, Math.floor((Date.now() - fD(me.date_recrutement)) / 31557600000)) : 0; const cin = me.cin ? me.cin[0] + '•••••' + me.cin.slice(-2) : '–'
  const F = ([k, v]) => <Grid item xs={6} key={k}><Eyebrow>{k}</Eyebrow><Typography sx={{ fontWeight: 700, mt: .5 }}>{v || '–'}</Typography></Grid>
  return <Grid container spacing={3}><Grid item xs={12} md={4}><Paper sx={{ p: 4, textAlign: 'center' }}>
    <Box sx={{ width: 110, height: 110, borderRadius: '50%', mx: 'auto', display: 'grid', placeItems: 'center', bgcolor: '#f6e4e1', color: '#a32630', fontSize: 38, fontWeight: 800, boxShadow: '0 0 0 8px #faf0ee' }}>{me.prenom[0]}{me.nom[0]}</Box>
    <Typography sx={{ fontSize: 22, fontWeight: 800, mt: 2.5 }}>{me.prenom} {me.nom}</Typography><Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{me.grade || ROLE[me.role]}</Typography><Pill t={STJ.actif.slice(0, 2).concat('Agent actif')} />
    <Stack direction="row" sx={{ mt: 3, py: 2, borderTop: '1px solid #ece8df', borderBottom: '1px solid #ece8df' }}><Box sx={{ flex: 1, borderRight: '1px solid #ece8df' }}><Typography sx={{ fontSize: 24, fontWeight: 800 }}>{me.solde_conge}</Typography><Typography variant="caption" color="text.secondary">Jours disponibles</Typography></Box>
      <Box sx={{ flex: 1 }}><Typography sx={{ fontSize: 24, fontWeight: 800 }}>{ans} ans</Typography><Typography variant="caption" color="text.secondary">Ancienneté</Typography></Box></Stack></Paper></Grid>
    <Grid item xs={12} md={8}><Stack spacing={3}><Paper sx={{ p: 3.5 }}><Typography sx={{ fontWeight: 800 }}>Informations administratives</Typography><Grid container spacing={3} sx={{ mt: .5 }}>
      {[['MATRICULE', me.matricule], ['CIN', cin], ['DIVISION', me.division], ['SERVICE', me.service], ['DATE DE RECRUTEMENT', frDate(me.date_recrutement)], ['GRADE', `${me.grade || '–'}${me.echelle ? ' · échelle ' + me.echelle : ''}`]].map(F)}</Grid></Paper>
      <Paper sx={{ p: 3.5 }}><Typography sx={{ fontWeight: 800 }}>Coordonnées professionnelles</Typography><Grid container spacing={3} sx={{ mt: .5 }}>{[['ADRESSE E-MAIL', me.email], ['ADRESSE', me.adresse]].map(F)}</Grid></Paper></Stack></Grid></Grid>
}

function Employes({ notify, search = '', cmd }) {
  const [rows, setRows] = useState([]); const [q, setQ] = useState(search); const [dv, setDv] = useState(''); const [st, setSt] = useState(''); const [pg, setPg] = useState(1)
  const [org, setOrg] = useState({ divisions: [], services: [] }); const [form, setForm] = useState(null); const [det, setDet] = useState(null); const [mn, setMn] = useState(null); const off = st === 'off'
  const load = useCallback(() => api(`/employes?actif=${off ? 0 : 1}`).then(setRows).catch((e) => notify(e.message)), [off])
  useEffect(() => { load(); api('/organisation').then(setOrg) }, [load])
  useEffect(() => { if (cmd && cmd.name === 'newAgent') setForm({}) }, [cmd && cmd.n])
  const fields = [{ k: 'matricule', l: 'Matricule' }, { k: 'cin', l: 'CIN' }, { k: 'nom', l: 'Nom' }, { k: 'prenom', l: 'Prénom' }, { k: 'sexe', l: 'Sexe', opts: [{ v: 'H', l: 'Homme' }, { v: 'F', l: 'Femme' }] }, { k: 'date_naissance', l: 'Date de naissance', t: 'date' },
    { k: 'email', l: 'Email', t: 'email' }, { k: 'username', l: 'Username' }, { k: 'password', l: 'Mot de passe', t: 'password' }, { k: 'adresse', l: 'Adresse' }, { k: 'situation_familiale', l: 'Situation familiale', opts: ['Célibataire', 'Marié(e)', 'Divorcé(e)', 'Veuf(ve)'] },
    { k: 'grade', l: 'Grade / fonction' }, { k: 'echelle', l: 'Échelle' }, { k: 'date_recrutement', l: 'Date de recrutement', t: 'date' }, { k: 'role', l: 'Rôle', opts: Object.entries(ROLE).map(([v, l]) => ({ v, l })) }, { k: 'service_id', l: 'Service', opts: org.services.map((s) => ({ v: s.id, l: s.nom })) }]
  const save = async (v) => { try { if (v.id) await api('/employes/' + v.id, { method: 'PUT', body: v }); else await api('/employes', { method: 'POST', body: v }); setForm(null); notify('Agent enregistré', 'success'); load() } catch (e) { notify(e.message) } }
  const toggle = async (r) => { try { await api(`/employes/${r.id}/actif`, { method: 'PATCH', body: { actif: off } }); load() } catch (e) { notify(e.message) } }
  const f = rows.filter((r) => `${r.nom} ${r.prenom} ${r.matricule} ${r.cin}`.toLowerCase().includes(q.toLowerCase()) && (!dv || r.division === dv) && (!st || off || r.statut_jour === st))
  const N = 6, pages = Math.max(1, Math.ceil(f.length / N)), cur = f.slice((pg - 1) * N, pg * N)
  return <Paper sx={{ overflow: 'hidden' }}>
    <Stack direction="row" spacing={2} alignItems="center" sx={{ p: 2.5 }}><Search value={q} onChange={(v) => { setQ(v); setPg(1) }} ph="Rechercher par nom, matricule ou CIN…" />
      <Sel value={dv} onChange={(v) => { setDv(v); setPg(1) }} opts={[['', 'Toutes les divisions'], ...org.divisions.map((d) => [d.nom, d.nom])]} w={220} />
      <Sel value={st} onChange={(v) => { setSt(v); setPg(1) }} opts={[['', 'Tous les statuts'], ['actif', 'Actif'], ['conge', 'En congé'], ['mission', 'Mission'], ['off', 'Désactivé']]} w={170} /><Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>{f.length} agents</Typography></Stack>
    <DT rows={cur} cols={[{ l: 'Agent', r: (r) => <Stack direction="row" spacing={1.5} alignItems="center"><Ini nom={r.nom} prenom={r.prenom} i={r.id} size={38} /><Box><Typography sx={{ fontWeight: 700, fontSize: 13 }}>{r.prenom} {r.nom}</Typography><Typography variant="caption" color="text.secondary">{r.email}</Typography></Box></Stack> },
      { l: 'Matricule', r: (r) => r.matricule }, { l: 'Division', r: (r) => r.division || '–' }, { l: 'Fonction', r: (r) => r.grade || ROLE[r.role] }, { l: 'Statut', r: (r) => <Pill t={off ? STJ.off : STJ[r.statut_jour]} /> },
      { l: '', r: (r) => <IconButton size="small" onClick={(e) => setMn({ el: e.currentTarget, r })}>···</IconButton> }]} />
    <Pager page={pg} pages={pages} onPage={setPg} text={`Affichage de ${f.length ? (pg - 1) * N + 1 : 0} à ${Math.min(pg * N, f.length)} sur ${f.length} agents`} />
    <Menu anchorEl={mn && mn.el} open={!!mn} onClose={() => setMn(null)}><MenuItem onClick={() => { setForm({ ...mn.r, password: '' }); setMn(null) }}>Modifier</MenuItem><MenuItem onClick={() => { setDet(mn.r); setMn(null) }}>Voir la fiche</MenuItem>
      <MenuItem onClick={() => { toggle(mn.r); setMn(null) }} sx={{ color: '#a32630' }}>{off ? 'Réactiver' : 'Désactiver'}</MenuItem></Menu>
    {form && <Form title={form.id ? 'Modifier l’agent' : 'Nouvel agent'} fields={form.id ? fields.filter((x) => x.k !== 'password') : fields} init={form} onSubmit={save} onClose={() => setForm(null)} />}
    {det && <Dialog open onClose={() => setDet(null)} fullWidth maxWidth="sm"><DialogTitle>Fiche agent</DialogTitle><DialogContent><Grid container spacing={2}>{[['Nom', `${det.prenom} ${det.nom}`], ['Matricule', det.matricule], ['CIN', det.cin], ['E-mail', det.email], ['Division', det.division], ['Service', det.service], ['Grade', det.grade],
      ['Recrutement', frDate(det.date_recrutement)], ['Solde de congé', `${det.solde_conge} jours`], ['Rôle', ROLE[det.role]]].map(([k, v]) => <Grid item xs={6} key={k}><Eyebrow>{k}</Eyebrow><Typography sx={{ fontWeight: 700 }}>{v || '–'}</Typography></Grid>)}</Grid></DialogContent></Dialog>}
  </Paper>
}

function Demandes({ me, notify, manage, cmd, refreshMe }) {
  const [rows, setRows] = useState([]); const [tab, setTab] = useState('all'); const [q, setQ] = useState(''); const [ty, setTy] = useState(''); const [pg, setPg] = useState(1); const [form, setForm] = useState(null); const [ex, setEx] = useState(null); const [jno, setJno] = useState(0)
  const load = useCallback(async () => { try { const qs = manage ? '?tous=1' : ''; const [c, m] = await Promise.all([api('/conges' + qs), api('/missions' + qs)])
    setRows([...c.map((r) => ({ ...r, kind: 'conges', label: r.type_conge ? `Congé ${r.type_conge.toLowerCase()}` : 'Congé', d: r.jours_ouvrables })), ...m.map((r) => ({ ...r, kind: 'missions', label: 'Ordre de mission', d: dur(r.date_debut, r.date_fin) }))].sort((a, b) => b.created_at.localeCompare(a.created_at))) } catch (e) { notify(e.message) } }, [manage])
  useEffect(() => { load() }, [load]); useEffect(() => { if (cmd && cmd.name === 'newReq') setForm({ kind: 'conges' }) }, [cmd && cmd.n])
  const ref = (r) => `${r.kind === 'conges' ? 'C' : 'M'}-${r.created_at.slice(0, 4)}-${r.id}`; const isA = me.role === 'admin', isR = me.role === 'rh'
  const act = async (r, a, body) => { try { await api(`/${r.kind}/${r.id}/${a}`, { method: 'PATCH', body }); setEx(null); load() } catch (e) { notify(e.message) } }
  const del = async (r) => { try { await api('/conges/' + r.id, { method: 'DELETE' }); setEx(null); load(); refreshMe && refreshMe() } catch (e) { notify(e.message) } }
  const add = async (v) => { try { await api('/' + (v.kind || 'conges'), { method: 'POST', body: v }); setForm(null); notify('Demande envoyée', 'success'); load(); refreshMe && refreshMe() } catch (e) { notify(e.message) } }
  const bulletin = async (r) => { try { const b = await api(`/conges/${r.id}/bulletin`); printHtml('Bulletin de congé', `<h3>BULLETIN DE CONGÉ</h3><p>Date : ${today()}</p><table><tr><th>Matricule</th><th>Nom & Prénom</th><th>Service</th></tr><tr><td>${b.matricule}</td><td>${b.nom} ${b.prenom}</td><td>${b.service || ''}</td></tr></table>
    <table><tr><td>Type</td><td>${b.type_conge}</td></tr><tr><td>Départ</td><td>${b.date_debut}</td></tr><tr><td>Reprise</td><td>${b.date_fin}</td></tr><tr><td>Jours ouvrables</td><td>${b.jours_ouvrables}</td></tr><tr><td>Jours non ouvrables</td><td>${b.jours_non_ouvrables}</td></tr><tr><td>Solde restant</td><td>${b.solde_conge}</td></tr></table><p class="sig">Le Responsable RH</p>`) } catch (e) { notify(e.message) } }
  const fields = [{ k: 'kind', l: 'Type de demande', full: true, opts: [{ v: 'conges', l: 'Congé' }, { v: 'missions', l: 'Ordre de mission' }] }, { k: 'type_conge', l: 'Type de congé (congé)', opts: ['Annuel', 'Maladie', 'Exceptionnel', 'Maternité'] }, { k: 'date_debut', l: 'Date de début', t: 'date' }, { k: 'date_fin', l: 'Date de fin', t: 'date' }, { k: 'objet', l: 'Objet (mission)', full: true }, { k: 'lieu', l: 'Lieu (mission)' }]
  const cnt = (s) => rows.filter((r) => r.statut === s).length; const mois = new Date().toISOString().slice(0, 7)
  const f = rows.filter((r) => (tab === 'all' || (manage ? r.statut === tab : tab === 'cours' ? ['en_attente', 'traitee_rh'].includes(r.statut) : ['validee', 'refusee'].includes(r.statut))) && (!ty || r.kind === ty) && `${r.nom || ''} ${r.prenom || ''} ${r.label}`.toLowerCase().includes(q.toLowerCase()))
  const N = manage ? 6 : 8, pages = Math.max(1, Math.ceil(f.length / N)), cur = f.slice((pg - 1) * N, pg * N); const sw = (v) => { setTab(v); setPg(1) }
  const dlg = ex && <Dialog open onClose={() => setEx(null)} fullWidth maxWidth="sm"><DialogTitle>{ex.label} · {ref(ex)}</DialogTitle><DialogContent><Grid container spacing={2}>{[['Demandeur', manage ? `${ex.prenom} ${ex.nom}` : `${me.prenom} ${me.nom}`], ['Période', per(ex.date_debut, ex.date_fin)], ['Durée', `${ex.d} jour(s)`], ['Statut', <Badge s={ex.statut} />],
    ...(ex.kind === 'missions' ? [['Objet', ex.objet], ['Lieu', ex.lieu]] : [['Jours non ouvrables', ex.jours_non_ouvrables]])].map(([k, v]) => <Grid item xs={6} key={k}><Eyebrow>{k}</Eyebrow><Typography component="div" sx={{ fontWeight: 700 }}>{v}</Typography></Grid>)}</Grid>
    {isR && ex.kind === 'conges' && ex.statut === 'en_attente' && <TextField sx={{ mt: 3 }} size="small" type="number" label="Jours non ouvrables à retrancher" value={jno} onChange={(e) => setJno(e.target.value)} />}</DialogContent>
    <DialogActions sx={{ p: 2.5 }}>{manage && isR && ex.statut === 'en_attente' && <Button variant="contained" sx={BLUE} onClick={() => act(ex, 'traiter', { jours_non_ouvrables: Number(jno) || 0 })}>Traiter et transmettre</Button>}
      {manage && isA && ex.statut === 'traitee_rh' && <Button variant="contained" sx={BLUE} onClick={() => act(ex, 'valider')}>Valider</Button>}
      {manage && ['en_attente', 'traitee_rh'].includes(ex.statut) && <Button color="error" onClick={() => act(ex, 'refuser')}>Refuser</Button>}
      {manage && isR && ex.kind === 'conges' && ex.statut === 'validee' && <Button onClick={() => bulletin(ex)}>Imprimer le bulletin</Button>}
      {!manage && ex.kind === 'conges' && ex.statut === 'en_attente' && <Button color="error" onClick={() => del(ex)}>Supprimer la demande</Button>}<Button onClick={() => setEx(null)}>Fermer</Button></DialogActions></Dialog>
  const frm = form && <Form title="Nouvelle demande" fields={fields} init={form} onSubmit={add} onClose={() => setForm(null)} />
  if (manage) return <Stack spacing={3}><Stack direction="row" spacing={3}><KPI label="EN ATTENTE" value={cnt('en_attente')} sub="demandes à traiter" ic="req" t={['#f5ecd3', '#9a7420']} /><KPI label="TRAITÉES PAR RH" value={cnt('traitee_rh')} sub="en validation" ic="clock" t={['#e3ebf0', '#4f7186']} />
    <KPI label="VALIDÉES CE MOIS" value={rows.filter((r) => r.statut === 'validee' && r.date_debut.slice(0, 7) === mois).length} sub="congés et missions" ic="check" t={['#e4efe9', '#267a57']} /></Stack>
    <Paper sx={{ overflow: 'hidden' }}><Tab2 value={tab} onChange={sw} tabs={[['all', `Toutes ${rows.length}`], ['en_attente', `En attente ${cnt('en_attente')}`], ['traitee_rh', `Traitement RH ${cnt('traitee_rh')}`], ['validee', `Validées ${cnt('validee')}`]]} />
      <Stack direction="row" spacing={2} sx={{ p: 2.5 }}><Search value={q} onChange={(v) => { setQ(v); setPg(1) }} ph="Rechercher une demande…" /><Sel value={ty} onChange={(v) => { setTy(v); setPg(1) }} opts={[['', 'Tous les types'], ['conges', 'Congés'], ['missions', 'Missions']]} /></Stack>
      <DT rows={cur} cols={[{ l: 'Demandeur', r: (r) => <Stack direction="row" spacing={1.5} alignItems="center"><Ini nom={r.nom} prenom={r.prenom} i={r.user_id || r.id} size={30} /><b style={{ color: '#2a2220' }}>{r.prenom} {r.nom}</b></Stack> }, { l: 'Type', r: (r) => r.label }, { l: 'Période', r: (r) => per(r.date_debut, r.date_fin) },
        { l: 'Durée', r: (r) => `${r.d} jour${r.d > 1 ? 's' : ''}` }, { l: 'Statut', r: (r) => <Badge s={r.statut} /> }, { l: 'Action', r: (r) => <Typography sx={LNK} onClick={() => { setJno(r.jours_non_ouvrables || 0); setEx(r) }}>Examiner →</Typography> }]} />
      <Pager page={pg} pages={pages} onPage={setPg} text={`${cur.length} demandes sur ${f.length}`} /></Paper>{dlg}{frm}</Stack>
  const used = Math.max(0, 22 - me.solde_conge)
  return <Grid container spacing={3}><Grid item xs={12} md={3.5}><Stack spacing={3}><Paper sx={{ p: 3 }}><Eyebrow>SOLDE DE CONGÉ</Eyebrow><Stack direction="row" spacing={1} alignItems="baseline" sx={{ mt: 1 }}><Typography sx={{ fontSize: 46, fontWeight: 800, color: '#a32630' }}>{me.solde_conge}</Typography><Typography variant="body2" color="text.secondary">jours restants</Typography></Stack>
    <Box sx={{ height: 6, bgcolor: '#ece8df', borderRadius: 3, my: 1.5 }}><Box sx={{ height: 6, borderRadius: 3, bgcolor: '#a32630', width: `${Math.min(100, (used / 22) * 100)}%` }} /></Box><Stack direction="row" justifyContent="space-between"><Typography variant="caption" color="text.secondary">{used} utilisés</Typography><Typography variant="caption" color="text.secondary">22 annuels</Typography></Stack></Paper>
    <Paper sx={{ p: 3 }}><Eyebrow>CETTE ANNÉE</Eyebrow>{[['Demandes', rows.length, '#a32630'], ['Validées', cnt('validee'), '#267a57'], ['En cours', cnt('en_attente') + cnt('traitee_rh'), '#d6a53a']].map(([l, n, c]) => <Stack key={l} direction="row" spacing={1.5} alignItems="center" sx={{ mt: 1.8 }}><Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: c }} /><Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>{l}</Typography><b>{n}</b></Stack>)}</Paper></Stack></Grid>
    <Grid item xs={12} md={8.5}><Paper sx={{ overflow: 'hidden' }}><Tab2 value={tab} onChange={sw} tabs={[['all', 'Toutes'], ['cours', 'En cours'], ['hist', 'Historique']]} />
      {cur.length ? cur.map((r) => <Stack key={r.kind + r.id} direction="row" spacing={2} alignItems="center" sx={{ px: 3, py: 2, borderBottom: '1px solid #f0ece3' }}><Box sx={{ width: 42, height: 42, borderRadius: 3, display: 'grid', placeItems: 'center', bgcolor: r.kind === 'conges' ? '#f6e4e1' : '#e3ebf0' }}><Ico d={r.kind === 'conges' ? IC.req : IC.brief} c={r.kind === 'conges' ? '#a32630' : '#4f7186'} /></Box>
        <Box sx={{ flex: 1 }}><Typography sx={{ fontWeight: 800, fontSize: 14 }}>{r.label}</Typography><Typography variant="caption" color="text.secondary">Demande N° {ref(r)} · {per(r.date_debut, r.date_fin)}</Typography></Box>
        <Typography variant="body2" color="text.secondary">{r.d} jour{r.d > 1 ? 's' : ''}</Typography><Badge s={r.statut} /><IconButton onClick={() => setEx(r)} sx={{ border: '1px solid #ece8df' }}><Ico d={IC.eye} c="#5d534c" /></IconButton></Stack>) : <Typography sx={{ p: 4 }} color="text.secondary">Aucune demande.</Typography>}</Paper></Grid>{dlg}{frm}</Grid>
}

function Attestations({ me, notify, manage, cmd }) {
  const [rows, setRows] = useState([]); const [form, setForm] = useState(null); const [q, setQ] = useState(''); const [pg, setPg] = useState(1)
  const load = () => api('/attestations' + (manage ? '?tous=1' : '')).then(setRows).catch((e) => notify(e.message)); useEffect(() => { load() }, [])
  useEffect(() => { if (cmd && cmd.name === 'newAtt') setForm({ type: 'travail' }) }, [cmd && cmd.n])
  const ask = async (type) => { try { await api('/attestations', { method: 'POST', body: { type } }); setForm(null); notify('Demande enregistrée', 'success'); load() } catch (e) { notify(e.message) } }
  const T = (t) => (t === 'salaire' ? 'Attestation de salaire' : 'Attestation de travail'); const ref = (r) => `ATT-${r.created_at.slice(0, 4)}-${String(r.id).padStart(4, '0')}`
  const print = (r) => printHtml('Attestation', `<h3>ATTESTATION DE ${r.type === 'travail' ? 'TRAVAIL' : 'SALAIRE'}</h3><p>Le Président de la Commune Urbaine de Meknès atteste que M./Mme <b>${r.nom} ${r.prenom}</b>, matricule <b>${r.matricule}</b>, ${r.grade ? `grade ${r.grade}, ` : ''}exerce ses fonctions au sein de la Commune ${r.date_recrutement ? `depuis le ${r.date_recrutement}` : ''}.</p><p>La présente attestation est délivrée à l’intéressé(e) pour servir et valoir ce que de droit.</p><p>Fait à Meknès, le ${today()}</p><p class="sig">Le Président</p>`)
  const Prt = (r) => <IconButton onClick={() => print(r)} sx={{ border: '1px solid #ece8df' }}><Ico d={IC.print} c="#5d534c" /></IconButton>
  const frm = form && <Form title="Nouvelle attestation" fields={[{ k: 'type', l: 'Type de document', full: true, opts: [{ v: 'travail', l: 'Attestation de travail' }, { v: 'salaire', l: 'Attestation de salaire' }] }]} init={form} onSubmit={(v) => ask(v.type)} onClose={() => setForm(null)} />
  if (manage) { const mois = new Date().toISOString().slice(0, 7); const f = rows.filter((r) => `${r.nom} ${r.prenom} ${T(r.type)}`.toLowerCase().includes(q.toLowerCase())); const N = 6, pages = Math.max(1, Math.ceil(f.length / N)), cur = f.slice((pg - 1) * N, pg * N)
    return <Stack spacing={3}><Stack direction="row" spacing={3}><KPI label="DEMANDES CE MOIS" value={rows.filter((r) => r.created_at.slice(0, 7) === mois).length} sub="toutes attestations" ic="doc" t={['#f6e4e1', '#a32630']} /><KPI label="ATTESTATIONS DE TRAVAIL" value={rows.filter((r) => r.type === 'travail').length} sub="délivrées" ic="check" t={['#e4efe9', '#267a57']} />
      <KPI label="ATTESTATIONS DE SALAIRE" value={rows.filter((r) => r.type === 'salaire').length} sub="délivrées" ic="doc" t={['#f5ecd3', '#9a7420']} /></Stack>
      <Paper sx={{ overflow: 'hidden' }}><Stack direction="row" sx={{ p: 2.5 }}><Search value={q} onChange={(v) => { setQ(v); setPg(1) }} ph="Rechercher une attestation…" /></Stack>
        <DT rows={cur} cols={[{ l: 'Référence', r: (r) => <b style={{ color: '#a32630' }}>{ref(r)}</b> }, { l: 'Agent', r: (r) => <Stack direction="row" spacing={1.5} alignItems="center"><Ini nom={r.nom} prenom={r.prenom} i={r.id} size={30} /><b style={{ color: '#2a2220' }}>{r.prenom} {r.nom}</b></Stack> }, { l: 'Type de document', r: (r) => T(r.type) },
          { l: 'Date de demande', r: (r) => frDate(r.created_at) }, { l: 'Statut', r: () => <Pill t={STJ.actif.slice(0, 2).concat('Délivrée')} /> }, { l: '', r: Prt }]} /><Pager page={pg} pages={pages} onPage={setPg} text={`${cur.length} attestations sur ${f.length}`} /></Paper>{frm}</Stack> }
  return <Grid container spacing={3}><Grid item xs={12} md={7.5}><Paper sx={{ p: 3 }}><Typography sx={{ fontWeight: 800, mb: 1 }}>Mes documents</Typography>{rows.length ? rows.map((r) => <Stack key={r.id} direction="row" spacing={2} alignItems="center" sx={{ py: 1.6, borderTop: '1px solid #f0ece3' }}>
    <Box sx={{ width: 40, height: 40, borderRadius: 3, display: 'grid', placeItems: 'center', bgcolor: '#f6e4e1' }}><Ico d={IC.doc} c="#a32630" /></Box><Box sx={{ flex: 1 }}><Typography sx={{ fontWeight: 700, fontSize: 14 }}>{T(r.type)}</Typography><Typography variant="caption" color="text.secondary">Demandée le {frDate(r.created_at)}</Typography></Box><Pill t={STJ.actif.slice(0, 2).concat('Prête')} />{Prt(r)}</Stack>) : <Typography color="text.secondary">Aucun document pour le moment.</Typography>}</Paper></Grid>
    <Grid item xs={12} md={4.5}><Stack spacing={3}>{[['travail', 'Attestation de travail', 'Atteste de votre emploi au sein de la Commune.', '#e4efe9', '#267a57'], ['salaire', 'Attestation de salaire', 'Justificatif de votre rémunération.', '#f5ecd3', '#9a7420']].map(([t, n, d, bg, c]) => <Paper key={t} sx={{ p: 3 }}>
      <Box sx={{ width: 40, height: 40, borderRadius: 3, display: 'grid', placeItems: 'center', bgcolor: bg, mb: 1.5 }}><Ico d={IC.doc} c={c} /></Box><Typography sx={{ fontWeight: 800 }}>{n}</Typography><Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{d}</Typography><Button fullWidth variant="outlined" color="inherit" onClick={() => ask(t)} sx={{ borderColor: '#ece8df' }}>Faire une demande</Button></Paper>)}</Stack></Grid>{frm}</Grid>
}

function Organisation({ notify, cmd }) {
  const [o, setO] = useState({ divisions: [], services: [] }); const [st, setSt] = useState({}); const [form, setForm] = useState(null)
  const load = () => Promise.all([api('/organisation'), api('/stats')]).then(([a, b]) => { setO(a); setSt(b) }).catch((e) => notify(e.message)); useEffect(() => { load() }, [])
  useEffect(() => { if (cmd && cmd.name === 'newDiv') setForm('divisions') }, [cmd && cmd.n])
  const save = async (v) => { try { await api('/' + form, { method: 'POST', body: v }); setForm(null); load() } catch (e) { notify(e.message) } }
  const COL = ['#a32630', '#c9962f', '#267a57', '#4f7186', '#8a6552', '#6b4f6b']; const nb = (d) => (st.parDivision || []).find((x) => x.nom === d.nom)?.n ?? 0
  const pdf = () => printHtml('Organigramme', `<h3>STRUCTURE ADMINISTRATIVE</h3>${o.divisions.map((d) => `<h4 style="text-align:left">${d.nom} (${nb(d)} agents)</h4><ul>${o.services.filter((s) => s.division_id === d.id).map((s) => `<li>${s.nom}</li>`).join('')}</ul>`).join('')}`)
  return <Grid container spacing={3}><Grid item xs={12} md={8.5}><Grid container spacing={3}>{o.divisions.map((d, i) => { const sv = o.services.filter((s) => s.division_id === d.id); const c = COL[i % 6]
    return <Grid item xs={12} sm={6} key={d.id}><Paper sx={{ p: 3, borderLeft: `4px solid ${c}`, height: '100%' }}><Box sx={{ width: 44, height: 44, borderRadius: 3, display: 'grid', placeItems: 'center', bgcolor: c }}><Ico d={IC.org} c="#fff" /></Box>
      <Typography sx={{ fontWeight: 800, fontSize: 17, mt: 2.5 }}>{d.nom}</Typography><Typography variant="body2" color="text.secondary" sx={{ minHeight: 22 }}>{sv.slice(0, 3).map((s) => s.nom).join(' · ') || 'Aucun service'}</Typography>
      <Stack direction="row" justifyContent="space-between" sx={{ mt: 2.5, pt: 2, borderTop: '1px solid #ece8df' }}><b style={{ color: c, fontSize: 13 }}>{nb(d)} agents</b><Typography variant="caption" color="text.secondary">{sv.length} service{sv.length > 1 ? 's' : ''}</Typography></Stack></Paper></Grid> })}</Grid></Grid>
    <Grid item xs={12} md={3.5}><Paper sx={{ p: 3 }}><Typography sx={{ fontWeight: 800 }}>Vue d’ensemble</Typography><Typography variant="caption" color="text.secondary">Structure actuelle</Typography>
      {[['Divisions', o.divisions.length], ['Services', o.services.length], ['Agents actifs', st.employes ?? 0]].map(([l, n]) => <Stack key={l} direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 2, borderBottom: '1px solid #ece8df' }}><Typography variant="body2" color="text.secondary">{l}</Typography><Typography sx={{ fontSize: 24, fontWeight: 800 }}>{n}</Typography></Stack>)}
      <Box sx={{ mt: 2.5, p: 2.5, borderRadius: 3, bgcolor: '#5a1a1e', color: '#fff' }}><Typography sx={{ fontSize: 10, letterSpacing: 1.3, color: '#e0b95a', fontWeight: 700 }}>ORGANIGRAMME</Typography><Typography sx={{ fontWeight: 800, my: .8 }}>Structure administrative {new Date().getFullYear()}</Typography><Typography onClick={pdf} sx={{ fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Télécharger le PDF ↓</Typography></Box>
      <Stack direction="row" spacing={1} sx={{ mt: 2 }}><Button size="small" variant="outlined" color="inherit" sx={{ borderColor: '#ece8df' }} onClick={() => setForm('services')}>Nouveau service</Button></Stack></Paper></Grid>
    {form && <Form title={form === 'divisions' ? 'Nouvelle division' : 'Nouveau service'} onClose={() => setForm(null)} onSubmit={save} fields={[{ k: 'nom', l: 'Nom', full: true }, ...(form === 'services' ? [{ k: 'division_id', l: 'Division', full: true, opts: o.divisions.map((d) => ({ v: d.id, l: d.nom })) }] : [])]} />}</Grid>
}

const IC = { grid: 'M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z', users: PK.users, check: 'M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z', clock: PK.clock, req: 'M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z',
  doc: 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z', org: 'M12 2L2 7v2h20V7L12 2zM4 11v7h3v-7H4zm5 0v7h3v-7H9zm5 0v7h3v-7h-3zm5 0v7h3v-7h-3zM2 20v2h20v-2H2z',
  shield: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z', user: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
  lock: 'M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z',
  eye: 'M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z',
  out: 'M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z', arrow: 'M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z' }
Object.assign(IC, { bell: 'M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z',
  brief: 'M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z',
  search: 'M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z',
  plus: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z', print: 'M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z' })
const TINTS = [['#f6e4e1', '#a32630'], ['#e4efe9', '#267a57'], ['#f5ecd3', '#9a7420'], ['#e3ebf0', '#4f7186']]
const Ini = ({ nom = '', prenom = '', size = 36, i = 0 }) => { const t = TINTS[(i + (prenom.charCodeAt(0) || 0)) % 4]
  return <Box sx={{ width: size, height: size, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: t[0], color: t[1], fontWeight: 800, fontSize: size * .34, flexShrink: 0 }}>{(prenom[0] || '') + (nom[0] || '')}</Box> }

function Login({ onLogin }) {
  const [login, setLogin] = useState(''); const [password, setPassword] = useState(''); const [err, setErr] = useState(''); const [show, setShow] = useState(false); const [keep, setKeep] = useState(true)
  const go = async () => { try { const d = await api('/auth/login', { method: 'POST', body: { login, password } }); localStorage.setItem('token', d.token)
    if (!keep) window.addEventListener('beforeunload', () => localStorage.removeItem('token')); onLogin() } catch (e) { setErr(e.message) } }
  const lead = (d) => <Box sx={{ mr: 1.2, display: 'flex' }}><Ico d={d} c="#8a817a" /></Box>
  const cards = [['Congés', 'Demandes & suivi', 'req'], ['Documents', 'Attestations', 'doc'], ['Personnel', 'Espace agent', 'users']]
  return <Box sx={{ minHeight: '100vh', display: 'flex' }}>
    <Box sx={{ flex: 1, display: { xs: 'none', md: 'flex' }, flexDirection: 'column', justifyContent: 'space-between', p: 7, color: '#fff', position: 'relative', overflow: 'hidden',
      background: 'repeating-linear-gradient(135deg,rgba(255,255,255,.035) 0 1px,transparent 1px 42px),radial-gradient(circle at 12% 88%,#7a1f2b 0,transparent 45%),linear-gradient(160deg,#5a1a1e,#3a0f13)' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center"><Stack direction="row" spacing={2} alignItems="center"><Box sx={{ bgcolor: '#fff', borderRadius: 3, p: .8, display: 'flex' }}><Logo size={52} /></Box>
        <Box><Typography sx={{ fontSize: 17, lineHeight: 1.1 }}>جماعة مكناس</Typography><Typography sx={{ fontWeight: 800, fontSize: 14 }}>COMMUNE DE MEKNÈS</Typography><Typography sx={{ fontSize: 9, letterSpacing: 1.2, opacity: .6, fontWeight: 700 }}>RESSOURCES HUMAINES</Typography></Box></Stack>
        <Box sx={{ px: 2, py: .8, borderRadius: 99, border: '1px solid rgba(255,255,255,.22)', fontSize: 10.5, letterSpacing: 1.3, fontWeight: 700, opacity: .85 }}>● PORTAIL SÉCURISÉ</Box></Stack>
      <Box><Typography sx={{ fontSize: 11.5, letterSpacing: 2.2, fontWeight: 700, color: '#e0b95a', mb: 3 }}>—  DIVISION DES RESSOURCES HUMAINES</Typography>
        <Typography sx={{ fontSize: 64, fontWeight: 800, lineHeight: 1.0, letterSpacing: '-0.03em' }}>Le capital humain</Typography>
        <Typography sx={{ fontSize: 64, lineHeight: 1.05, fontStyle: 'italic', fontFamily: 'Georgia, "Times New Roman", serif', fontWeight: 700, color: '#e0b95a' }}>au cœur de la ville.</Typography>
        <Typography sx={{ mt: 3.5, maxWidth: 470, opacity: .72, fontSize: 16, lineHeight: 1.7 }}>Un espace unique pour simplifier vos démarches, consulter votre dossier et rester connecté à la vie administrative de la Commune de Meknès.</Typography>
        <Stack direction="row" spacing={2} sx={{ mt: 5 }}>{cards.map(([t, d, ic]) => <Box key={t} sx={{ flex: 1, p: 2.2, minHeight: 132, borderRadius: 4, border: '1px solid rgba(255,255,255,.16)', bgcolor: 'rgba(255,255,255,.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <Box sx={{ width: 38, height: 38, borderRadius: 3, display: 'grid', placeItems: 'center', bgcolor: 'rgba(255,255,255,.1)' }}><Ico d={IC[ic]} c="#e0b95a" /></Box><Box><Typography sx={{ fontWeight: 800 }}>{t}</Typography><Typography sx={{ fontSize: 11.5, opacity: .6 }}>{d}</Typography></Box></Box>)}</Stack></Box>
      <Stack direction="row" justifyContent="space-between" sx={{ borderTop: '1px solid rgba(255,255,255,.12)', pt: 2.5, fontSize: 11, opacity: .65, letterSpacing: .8 }}><span>ROYAUME DU MAROC</span><span>المملكة المغربية · جماعة مكناس</span></Stack></Box>
    <Box sx={{ flex: 1, bgcolor: '#f8f5ee', position: 'relative', display: 'grid', placeItems: 'center', p: 3 }}>
      <Typography component="a" href="https://communemeknes.ma" target="_blank" rel="noreferrer" sx={{ position: 'absolute', top: 28, right: 40, fontSize: 13, fontWeight: 700, color: 'text.secondary', textDecoration: 'none' }}>Assistance</Typography>
      <Box sx={{ width: 420, maxWidth: '100%' }}>
        <Typography sx={{ fontSize: 11.5, letterSpacing: 2.2, fontWeight: 700, color: '#a32630', mb: 2 }}>—  ESPACE AGENTS</Typography>
        <Typography sx={{ fontSize: 44, fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.03em' }}>Bienvenue sur votre <span style={{ color: '#a32630' }}>espace RH.</span></Typography>
        <Typography color="text.secondary" sx={{ mt: 1.5, mb: 4 }}>Connectez-vous avec vos identifiants professionnels.</Typography>
        <Stack spacing={2.2}>
          <Box><Typography sx={{ fontWeight: 700, fontSize: 13, mb: .8 }}>E-mail ou nom d’utilisateur</Typography><TextField fullWidth placeholder="Saisissez votre identifiant" value={login} onChange={(e) => setLogin(e.target.value)} InputProps={{ startAdornment: lead(IC.user) }} /></Box>
          <Box><Stack direction="row" justifyContent="space-between"><Typography sx={{ fontWeight: 700, fontSize: 13, mb: .8 }}>Mot de passe</Typography>
            <Typography onClick={() => setErr('Pour réinitialiser votre mot de passe, contactez la Division des Ressources Humaines.')} sx={{ fontSize: 12, fontWeight: 700, color: '#a32630', cursor: 'pointer' }}>Mot de passe oublié ?</Typography></Stack>
            <TextField fullWidth placeholder="Saisissez votre mot de passe" type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && go()}
              InputProps={{ startAdornment: lead(IC.lock), endAdornment: <IconButton size="small" onClick={() => setShow(!show)} aria-label="Afficher le mot de passe"><Ico d={IC.eye} c="#8a817a" /></IconButton> }} /></Box>
          <FormControlLabel control={<Checkbox size="small" checked={keep} onChange={(e) => setKeep(e.target.checked)} sx={{ color: '#a32630', '&.Mui-checked': { color: '#a32630' } }} />} label={<Typography variant="body2" color="text.secondary">Maintenir ma session active</Typography>} />
          <Button variant="contained" size="large" onClick={go} endIcon={<Ico d={IC.arrow} c="#fff" />} sx={{ ...BLUE, justifyContent: 'space-between', px: 3, py: 1.7 }}>Accéder à mon espace</Button>
          {err && <Alert severity="error" onClose={() => setErr('')}>{err}</Alert>}
          <Stack direction="row" spacing={1.5} sx={{ p: 2, borderRadius: 3, bgcolor: '#fffefb', border: '1px solid #ece8df' }}><Ico d={IC.shield} c="#267a57" />
            <Typography variant="caption" color="text.secondary"><b style={{ color: '#2a2220' }}>Connexion protégée.</b> Accès nominatif, chaque connexion est journalisée.</Typography></Stack></Stack></Box></Box></Box>
}

export default function App() {
  const [me, setMe] = useState(null); const [page, setPage] = useState('profil'); const [msg, setMsg] = useState(null); const [anchor, setAnchor] = useState(null); const [search, setSearch] = useState(''); const [cmd, setCmd] = useState({ n: 0, name: '' }); const [pend, setPend] = useState(0)
  const notify = (text, sev = 'error') => setMsg({ text, sev })
  const loadMe = () => api('/me').then((u) => { setMe(u); setPage(['admin', 'rh'].includes(u.role) ? 'dashboard' : 'profil') }).catch(() => localStorage.removeItem('token'))
  useEffect(() => { if (localStorage.getItem('token')) loadMe() }, [])
  const logout = () => { localStorage.removeItem('token'); setMe(null) }
  const mgr = me && ['admin', 'rh'].includes(me.role)
  const menu = me ? [
    ...(mgr ? [['dashboard', 'Tableau de bord'], ['employes', 'Employés']] : []),
    ...(me.role === 'admin' ? [['organisation', 'Organisation'], ['audit', 'Journal d’audit']] : []),
    ...(mgr ? [['gestion', 'Gestion des demandes'], ['gattest', 'Attestations émises']] : []),
    ['profil', 'Mon profil'], ['demandes', 'Mes demandes'], ['attest', 'Mes attestations'],
  ] : []
  const title = me && (page === 'dashboard' ? 'Tableau de bord de la Présidence' : (menu.find(([k]) => k === page) || [])[1])
  const refreshMe = () => api('/me').then(setMe).catch(() => {})
  useEffect(() => { if (me && ['admin', 'rh'].includes(me.role)) api('/stats').then((x) => setPend(x.demandesEnCours || 0)).catch(() => {}) }, [me, page, cmd.n])
  const view = me && {
    dashboard: <Dashboard notify={notify} me={me} go={setPage} />, employes: <Employes key={search} notify={notify} search={search} cmd={cmd} />, organisation: <Organisation notify={notify} cmd={cmd} />, audit: <Audit notify={notify} cmd={cmd} />,
    gestion: <Demandes key="g" me={me} notify={notify} manage cmd={cmd} />, gattest: <Attestations key="ga" me={me} notify={notify} manage cmd={cmd} />,
    profil: <Profil me={me} />, demandes: <Demandes key="m" me={me} notify={notify} cmd={cmd} refreshMe={refreshMe} />, attest: <Attestations key="a" me={me} notify={notify} cmd={cmd} />,
  }[page]
  const ACT = { employes: ['Nouvel agent', 'newAgent'], gestion: ['Nouvelle demande', 'newReq'], gattest: ['Nouvelle attestation', 'newAtt'], organisation: ['Nouvelle division', 'newDiv'], audit: ['Exporter le journal', 'export'], demandes: ['Nouvelle demande', 'newReq'], attest: ['Nouvelle demande', 'newAtt'] }[page]
  const GRP = { dashboard: 'VUE GÉNÉRALE', employes: 'ADMINISTRATION', gestion: 'ADMINISTRATION', gattest: 'ADMINISTRATION', organisation: 'ADMINISTRATION', audit: 'ADMINISTRATION', profil: 'MON ESPACE', demandes: 'MON ESPACE', attest: 'MON ESPACE' }
  const ICN = { dashboard: 'grid', employes: 'users', gestion: 'req', gattest: 'doc', organisation: 'org', audit: 'shield', profil: 'user', demandes: 'req', attest: 'doc' }
  const EYE = { dashboard: 'PILOTAGE RH', employes: 'CAPITAL HUMAIN', gestion: 'CIRCUIT DE VALIDATION', gattest: 'DOCUMENTS OFFICIELS', organisation: 'STRUCTURE ADMINISTRATIVE', audit: 'SÉCURITÉ & CONFORMITÉ', profil: 'ESPACE PERSONNEL', demandes: 'ESPACE PERSONNEL', attest: 'ESPACE PERSONNEL' }
  const SUB = { dashboard: 'Voici l’essentiel de votre commune aujourd’hui.', employes: 'Gérez les dossiers et la situation de vos agents.', gestion: 'Traitez les congés et ordres de mission de la commune.', gattest: 'Consultez les attestations délivrées aux agents.',
    organisation: 'Divisions et services de la commune.', audit: 'Traçabilité des actions sensibles.', profil: 'Vos informations administratives.', demandes: 'Suivez vos demandes de congé et de mission.', attest: 'Vos documents officiels.' }
  const LBL = { employes: 'Personnel' }; const ORDER = ['dashboard', 'employes', 'gestion', 'gattest', 'organisation', 'audit', 'profil', 'demandes', 'attest']
  const items = me ? ORDER.map((k) => menu.find((m) => m[0] === k)).filter(Boolean) : []
  const heading = me && (page === 'dashboard' ? `Bonjour, ${me.prenom}` : LBL[page] || (menu.find((m) => m[0] === page) || [])[1])
  return <ThemeProvider theme={theme}><CssBaseline />
    {!me ? <Login onLogin={loadMe} /> : <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Box sx={{ width: 264, position: 'fixed', top: 0, bottom: 0, bgcolor: '#fbfaf6', borderRight: '1px solid #ece8df', p: 2.5, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3.5 }}><Box sx={{ border: '1px solid #ece8df', borderRadius: 3, p: .6, bgcolor: '#fff', display: 'flex' }}><Logo size={46} /></Box>
          <Box><Typography sx={{ fontSize: 16, lineHeight: 1.1 }}>جماعة مكناس</Typography><Typography sx={{ fontWeight: 800, fontSize: 13, letterSpacing: .3 }}>COMMUNE DE MEKNÈS</Typography><Typography sx={{ fontSize: 8.5, letterSpacing: 1.1, color: 'text.secondary', fontWeight: 700 }}>RESSOURCES HUMAINES</Typography></Box></Stack>
        <Box sx={{ flex: 1 }}>{items.map(([k, l], i) => <React.Fragment key={k}>
          {(i === 0 || GRP[items[i - 1][0]] !== GRP[k]) && <Typography sx={{ fontSize: 10.5, letterSpacing: 1.5, fontWeight: 700, color: '#9a9088', mt: i ? 3 : 0, mb: 1, px: 1 }}>{GRP[k]}</Typography>}
          <ListItemButton selected={page === k} onClick={() => setPage(k)} sx={{ borderRadius: 3, mb: .6, py: 1, color: '#5d534c', '&:hover': { bgcolor: '#f1eee6' }, '&.Mui-selected, &.Mui-selected:hover': { bgcolor: '#5a1a1e', color: '#fff', boxShadow: '0 10px 20px rgba(90,26,30,.28)' } }}>
            <Box sx={{ width: 34, height: 34, borderRadius: 2.5, display: 'grid', placeItems: 'center', mr: 1.5, bgcolor: page === k ? 'rgba(255,255,255,.14)' : '#f1eee6' }}><Ico d={IC[ICN[k]]} c={page === k ? '#e0b95a' : '#7d746d'} /></Box>
            <ListItemText primary={LBL[k] || l} primaryTypographyProps={{ fontWeight: 700, fontSize: 13.5 }} />{k === 'gestion' && pend > 0 && <Box sx={{ minWidth: 22, height: 22, borderRadius: 99, bgcolor: '#a32630', color: '#fff', fontSize: 11, fontWeight: 800, display: 'grid', placeItems: 'center', px: .8 }}>{pend}</Box>}</ListItemButton></React.Fragment>)}</Box>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ p: 1.5, borderRadius: 4, bgcolor: '#fff', border: '1px solid #ece8df' }}><Ini nom={me.nom} prenom={me.prenom} size={40} />
          <Box sx={{ flex: 1, minWidth: 0 }}><Typography sx={{ fontWeight: 800, fontSize: 13.5 }} noWrap>{me.prenom} {me.nom}</Typography><Typography variant="caption" color="text.secondary">{ROLE[me.role]}</Typography></Box>
          <IconButton size="small" onClick={logout} aria-label="Se déconnecter"><Ico d={IC.out} c="#8a817a" /></IconButton></Stack></Box>
      <Box sx={{ flex: 1, ml: '264px', minWidth: 0 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 5, py: 1.8, borderBottom: '1px solid #ece8df', bgcolor: '#f8f6f0' }}>
          <Paper sx={{ px: 2.5, py: .7, borderRadius: 99, width: 380 }}><TextField variant="standard" fullWidth placeholder="Rechercher un agent, une demande…" value={search} onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && mgr && setPage('employes')} InputProps={{ disableUnderline: true, startAdornment: <Box sx={{ mr: 1, display: 'flex' }}><Ico d={IC.search} c="#9a9088" /></Box>, endAdornment: <Box sx={{ fontSize: 10.5, px: .9, py: .2, border: '1px solid #e4dfd4', borderRadius: 1.5, color: '#9a9088' }}>⌘K</Box> }} /></Paper>
          <Stack direction="row" spacing={2} alignItems="center"><IconButton onClick={() => mgr && setPage('gestion')} sx={{ border: '1px solid #ece8df', bgcolor: '#fff', position: 'relative' }}><Ico d={IC.bell} c="#5d534c" />{pend > 0 && <Box sx={{ position: 'absolute', top: 8, right: 9, width: 8, height: 8, borderRadius: '50%', bgcolor: '#a32630' }} />}</IconButton><Box sx={{ width: '1px', height: 28, bgcolor: '#ece8df' }} /><Ini nom={me.nom} prenom={me.prenom} size={36} /><Box><Typography sx={{ fontWeight: 800, fontSize: 13, lineHeight: 1.2 }}>{me.prenom} {me.nom}</Typography><Typography variant="caption" color="text.secondary">{ROLE[me.role]}</Typography></Box></Stack></Stack>
        <Box sx={{ px: 5, py: 4 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 4 }}><Box>
            <Typography sx={{ fontSize: 11.5, letterSpacing: 2, fontWeight: 700, color: '#a32630' }}>{EYE[page]}</Typography>
            <Typography sx={{ fontSize: 42, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, mt: .5 }}>{heading}</Typography>
            <Typography color="text.secondary" sx={{ mt: .5 }}>{SUB[page]}</Typography></Box>
            {ACT && <Button variant="contained" startIcon={<Ico d={IC.plus} c="#fff" />} onClick={() => setCmd((c) => ({ n: c.n + 1, name: ACT[1] }))} sx={{ ...BLUE, px: 3, py: 1.3 }}>{ACT[0]}</Button>}</Stack>
          {view}
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 5 }}>Royaume du Maroc · Commune de Meknès · Division des Ressources Humaines</Typography></Box></Box></Box>}
    <Snackbar open={!!msg} autoHideDuration={4000} onClose={() => setMsg(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
      {msg ? <Alert severity={msg.sev} variant="filled" onClose={() => setMsg(null)}>{msg.text}</Alert> : undefined}</Snackbar>
  </ThemeProvider>
}
