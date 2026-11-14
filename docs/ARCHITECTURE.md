# Architecture technique

## Vue d'ensemble
```mermaid
flowchart LR
  UI[React 18 + MUI<br/>SPA Vite] -- "REST JSON + JWT" --> API[Express 4<br/>RBAC · helmet · rate-limit]
  API -- "mysql2 (requêtes paramétrées, transactions)" --> DB[(MySQL 8)]
  API --> AUD[(journal d'audit)]
```

## Modèle de données (extrait)
```mermaid
erDiagram
  DIVISIONS ||--o{ SERVICES : contient
  SERVICES ||--o{ USERS : emploie
  USERS ||--o{ CONGES : demande
  USERS ||--o{ ORDRES_MISSION : demande
  USERS ||--o{ ATTESTATIONS : demande
  USERS ||--o{ JOURNAL : agit
```

## Circuit de validation d'un congé
```mermaid
sequenceDiagram
  Agent->>API: POST /api/conges
  API->>DB: BEGIN · verrou du solde (FOR UPDATE) · contrôle chevauchement · décrément · INSERT
  API-->>Agent: 201 (en_attente)
  RH->>API: PATCH /conges/:id/traiter (jours non ouvrables)
  Admin->>API: PATCH /conges/:id/valider | refuser (solde restitué)
```

## Choix d'ingénierie
- **Transactions + verrou de ligne** : deux demandes simultanées ne peuvent pas dépasser le solde.
- **Calcul des jours ouvrables en UTC**, testé unitairement (`backend/test`).
- **RBAC côté serveur** (admin / rh / chef / agent) : l'interface n'est jamais la seule barrière.
- **Journal d'audit transversal** : toute requête modifiante est tracée (middleware), consultable par l'admin.
- **Statistiques agrégées en SQL** (tendance mensuelle, parité, alertes) plutôt qu'en JavaScript.
- **Visualisations en SVG natif** (courbe lissée par Bézier, jauge, anneaux, constellation) : zéro dépendance de graphiques.
- **Déploiement reproductible** : Docker Compose, CI GitHub Actions.
