# Plateforme de gestion des ressources humaines — Commune Urbaine de Meknès

![CI](https://github.com/<votre-compte>/rh-commune-meknes/actions/workflows/ci.yml/badge.svg)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql&logoColor=white)
![Licence](https://img.shields.io/badge/licence-MIT-blue)

Application web full-stack qui informatise le circuit RH d'une collectivité territoriale : dossiers du personnel, demandes de congé, ordres de mission, attestations et pilotage par tableau de bord.

**Contexte.** Projet réalisé pendant mon stage d'initiation (1ʳᵉ année du cycle ingénieur, ENSA Fès) au sein de la Division des Ressources Humaines de la Commune Urbaine de Meknès.

## Maquettes d'interface

Les images ci-dessous sont les **maquettes de conception** de l'interface (données fictives). Elles servent de référence visuelle au développement.

| | |
|---|---|
| ![Connexion](docs/design/01-connexion.png)<br>**Connexion** | ![Tableau de bord](docs/design/02-tableau-de-bord.png)<br>**Tableau de bord** |
| ![Personnel](docs/design/03-personnel.png)<br>**Personnel** | ![Gestion des demandes](docs/design/04-gestion-demandes.png)<br>**Gestion des demandes** |
| ![Attestations émises](docs/design/05-attestations-emises.png)<br>**Attestations émises** | ![Organisation](docs/design/06-organisation.png)<br>**Organisation** |
| ![Journal d'audit](docs/design/07-journal-audit.png)<br>**Journal d'audit** | ![Mon profil](docs/design/08-mon-profil.png)<br>**Mon profil** |
| ![Mes demandes](docs/design/09-mes-demandes.png)<br>**Mes demandes** | ![Mes attestations](docs/design/10-mes-attestations.png)<br>**Mes attestations** |

## Fonctionnalités

- **Authentification** par jeton JWT et contrôle d'accès par profil : administrateur, responsable RH, chef hiérarchique, agent.
- **Personnel** : création, modification, désactivation et réactivation d'un agent, fiche détaillée, recherche et filtres par division et par statut.
- **Congés** : calcul automatique des jours ouvrables (week-ends et jours fériés exclus), contrôle du solde et des chevauchements de périodes, bulletin de congé imprimable.
- **Ordres de mission** et **attestations** de travail et de salaire imprimables.
- **Circuit de validation** : agent → traitement par le service RH → décision de l'administrateur. Le solde est déduit à la demande et restitué en cas de refus ou de suppression.
- **Organisation** : divisions et services, export imprimable de l'organigramme.
- **Tableau de bord** : effectifs, présence du jour, évolution des congés sur 12 mois, calendrier des absences, alertes.
- **Journal d'audit** : toute action modifiante est tracée ; consultation et export CSV par l'administrateur.

## Rôles

| Rôle | Principales actions |
|---|---|
| Agent | Consulter son profil, déposer et suivre ses demandes, demander une attestation |
| Chef hiérarchique | Mêmes droits que l'agent |
| Responsable RH | Gérer le personnel, traiter les demandes, imprimer bulletins et attestations |
| Administrateur | Tous les droits : organisation, validation finale, journal d'audit |

## Architecture

```mermaid
flowchart LR
  A[React 18 + Material UI] -- REST / JWT --> B[API Express]
  B -- mysql2 --> C[(MySQL 8)]
```

| Couche | Technologies |
|---|---|
| Interface | React, Material UI, Vite |
| API | Node.js, Express, JWT, bcrypt, helmet, express-rate-limit |
| Données | MySQL 8 — schéma dans `database/schema.sql`, créé au premier démarrage |

Le détail (modèle de données, circuit de validation, choix techniques) est dans [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Installation

**Prérequis** : Node.js 20 et MySQL 8 (ou XAMPP).

```bash
# 1. Démarrer MySQL
# 2. API
cd backend
cp .env.example .env        # adapter DB_PASSWORD, JWT_SECRET si besoin
npm install
npm start                   # http://localhost:5000

# 3. Interface (autre terminal)
cd frontend
cp .env.example .env
npm install
npm run dev                 # http://localhost:3000
```

Sous Windows, le script `run.bat` effectue ces étapes. La base de données et les comptes de démonstration sont créés automatiquement au premier démarrage.

**Avec Docker (optionnel)** : `docker compose up --build`, puis http://localhost:3000.

### Comptes de démonstration

| Compte | Mot de passe | Rôle |
|---|---|---|
| `admin` | `Admin@2026` | Administrateur |
| `rh`, `chef`, `agent1` … `agent10` | `Demo@2026` | RH, chef, agents |

Ces comptes et les données fictives n'existent que si `DEMO_DATA=1`. **En production : `DEMO_DATA=0`, changer `ADMIN_PASSWORD` et définir un `JWT_SECRET` long et aléatoire.**

## Structure du projet

```
rh-commune-meknes/
├── backend/            API REST (server.js, lib/dates.js, test/)
├── frontend/           Interface React (src/App.jsx, public/logo.png)
├── database/           schema.sql
├── docs/               ARCHITECTURE.md, maquettes d'interface
├── docker-compose.yml
└── run.bat / run.sh    Lancement local
```

## API REST (principales routes)

| Domaine | Routes |
|---|---|
| Authentification | `POST /api/auth/login` · `GET /api/me` |
| Personnel | `GET/POST /api/employes` · `PUT /api/employes/:id` · `PATCH /api/employes/:id/actif` |
| Congés | `GET/POST /api/conges` · `DELETE /api/conges/:id` · `PATCH /api/conges/:id/{traiter,valider,refuser}` · `GET /api/conges/:id/bulletin` |
| Missions | `GET/POST /api/missions` · `PATCH /api/missions/:id/{traiter,valider,refuser}` |
| Attestations | `GET/POST /api/attestations` |
| Organisation | `GET /api/organisation` · `POST /api/divisions` · `POST /api/services` |
| Pilotage | `GET /api/stats` · `GET /api/audit` · `GET /api/health` |

## Sécurité

Mots de passe hachés (bcrypt), jetons JWT à durée limitée, contrôle d'accès par rôle côté serveur, requêtes SQL paramétrées, en-têtes `helmet`, limitation des tentatives de connexion, journal d'audit.

## Tests

```bash
cd backend && npm test
```
Les tests unitaires couvrent le calcul des jours ouvrables (week-ends, jours fériés, bornes).

## Limites connues et pistes d'évolution

- Découper `frontend/src/App.jsx` en composants et en pages distincts.
- Ajouter des tests d'intégration de l'API et des tests de l'interface.
- Conserver un historique des effectifs pour tracer leur évolution dans le temps.
- Notifications par e-mail et gestion de la photo de profil.

## Crédits et licence

- Le cahier des charges s'inspire du rapport de PFE « Développement d'une application web de gestion des ressources humaines » (NewDev Maroc, FST Fès, 2022). L'implémentation, l'architecture et l'adaptation au contexte d'une commune sont propres à ce dépôt.
- Code sous licence [MIT](LICENSE). **Le blason et le nom de la Commune Urbaine de Meknès restent la propriété de la Commune et ne sont pas couverts par cette licence.**

## Auteure

**Karima Hajjioui** — élève ingénieure en Génie Informatique, ENSA Fès
[LinkedIn](https://www.linkedin.com/in/karima-hajjioui-b8a34a32a)
