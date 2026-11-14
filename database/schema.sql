CREATE DATABASE IF NOT EXISTS rh_commune_meknes CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE rh_commune_meknes;

CREATE TABLE divisions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(120) NOT NULL UNIQUE
);
CREATE TABLE services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(120) NOT NULL,
  division_id INT NOT NULL,
  FOREIGN KEY (division_id) REFERENCES divisions(id) ON DELETE CASCADE
);

-- role : admin | rh | chef | agent
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  matricule VARCHAR(20) NOT NULL UNIQUE,
  cin VARCHAR(15) NOT NULL UNIQUE,
  nom VARCHAR(60) NOT NULL,
  prenom VARCHAR(60) NOT NULL,
  sexe ENUM('H','F') NOT NULL,
  date_naissance DATE,
  email VARCHAR(120) NOT NULL UNIQUE,
  username VARCHAR(40) NOT NULL UNIQUE,
  password_hash VARCHAR(100) NOT NULL,
  adresse VARCHAR(200),
  situation_familiale VARCHAR(20),
  grade VARCHAR(60),
  echelle VARCHAR(10),
  date_recrutement DATE,
  role ENUM('admin','rh','chef','agent') NOT NULL DEFAULT 'agent',
  service_id INT NULL,
  solde_conge DECIMAL(4,1) NOT NULL DEFAULT 22,
  actif TINYINT(1) NOT NULL DEFAULT 1,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL
);

-- statut : en_attente -> traitee_rh -> validee | refusee
CREATE TABLE conges (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type_conge VARCHAR(40) NOT NULL,
  date_debut DATE NOT NULL,
  date_fin DATE NOT NULL,
  jours_ouvrables DECIMAL(4,1) NOT NULL,
  jours_non_ouvrables INT NOT NULL DEFAULT 0,
  statut ENUM('en_attente','traitee_rh','validee','refusee') NOT NULL DEFAULT 'en_attente',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE TABLE ordres_mission (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  objet VARCHAR(200) NOT NULL,
  lieu VARCHAR(120) NOT NULL,
  date_debut DATE NOT NULL,
  date_fin DATE NOT NULL,
  statut ENUM('en_attente','traitee_rh','validee','refusee') NOT NULL DEFAULT 'en_attente',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE TABLE attestations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type ENUM('travail','salaire') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE TABLE jours_feries (
  jour DATE PRIMARY KEY,
  libelle VARCHAR(80) NOT NULL
);
CREATE TABLE journal (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  action VARCHAR(200) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO divisions(nom) VALUES ('Division des Ressources Humaines'),('Division des Affaires Administratives'),('Division Technique');
INSERT INTO services(nom,division_id) VALUES ('Service du Personnel',1),('Service de la Formation',1),('Bureau d\'Ordre',2),('Service Informatique',3);
INSERT INTO jours_feries VALUES ('2026-11-06','Marche Verte'),('2026-11-18','Fête de l\'Indépendance');
