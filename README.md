# TwitchPlanner 🎮📅

Application web de gestion de plannings de streams pour les streamers Twitch.

## 📋 Description

TwitchPlanner permet aux streamers de :
- Créer des plannings hebdomadaires personnalisés
- Ajouter des événements de stream avec images et horaires
- Exporter les plannings en PNG pour les réseaux sociaux
- Gérer leur profil (nom d'affichage, URL Twitch, logo)

## 🛠️ Technologies Utilisées

### Backend
- **Node.js** + **Express** - Serveur REST API
- **PostgreSQL** - Base de données relationnelle
- **JWT (jsonwebtoken)** - Authentification sécurisée
- **bcrypt** - Hashage des mots de passe
- **Multer** - Gestion de l'upload de fichiers
- **CORS** - Gestion des requêtes cross-origin

### Frontend
- **React 18** - Bibliothèque JavaScript pour l'interface utilisateur
- **Vite** - Build tool moderne et rapide
- **Tailwind CSS** - Framework CSS utility-first
- **shadcn/ui** - Composants UI réutilisables
- **React Router** - Navigation côté client
- **date-fns** - Manipulation de dates
- **html2canvas** - Export PNG des plannings

### Base de Données
- **PostgreSQL** - Système de gestion de base de données relationnelle

## 📦 Installation

### Prérequis

- Node.js >= 16
- PostgreSQL >= 13
- npm ou yarn

### 1. Cloner le repository

```bash
git clone https://github.com/[VOTRE-USERNAME]/twitchplanner.git
cd twitchplanner
```

### 2. Configuration du Backend

```bash
cd backend
npm install
```

Créer le fichier `.env` à partir de l'exemple :

```bash
cp .env.example .env
```

Éditer `.env` avec vos informations PostgreSQL et votre secret JWT :

```env
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe
DB_HOST=localhost
DB_PORT=5432
DB_NAME=twitchplanner
JWT_SECRET=un_secret_tres_long_et_securise_a_generer
PORT=3000
```

### 3. Création de la Base de Données

#### Méthode 1 : Ligne de commande PostgreSQL

```bash
# Se connecter à PostgreSQL
psql -U postgres

# Créer la base de données
CREATE DATABASE twitchplanner;
\q

# Importer le schéma
psql -U postgres -d twitchplanner -f twitchplanner.sql
```

#### Méthode 2 : Avec pgAdmin

1. Ouvrir pgAdmin
2. Créer une nouvelle base de données : `twitchplanner`
3. Clic droit sur la base → Query Tool
4. Ouvrir et exécuter le fichier `twichplanner.sql`

### 4. Créer le dossier uploads

```bash
# Dans le dossier backend
mkdir uploads
```

### 5. Lancer le Backend

```bash
npm start
```

Le serveur démarre sur **http://localhost:3000**

### 6. Configuration du Frontend

```bash
cd ../frontend
npm install
```

Créer le fichier `.env` :

Vérifier que `.env` contient :

```env
VITE_API_URL=http://localhost:3000/api
```

### 7. Lancer le Frontend

```bash
npm run dev
```

L'application est accessible sur **http://localhost:5173**

## 🚀 Utilisation

### 1. Créer un compte
- Accéder à la page d'inscription
- Saisir un email et un mot de passe

### 2. Se connecter
- Utiliser vos identifiants pour accéder à votre espace

### 3. Configurer son profil
- Ajouter un nom d'affichage
- Renseigner l'URL de votre chaîne Twitch
- Uploader un logo (optionnel)

### 4. Créer un planning
- Cliquer sur "Nouveau planning"
- Donner un nom à votre planning
- Le planning est initialisé avec la semaine en cours

### 5. Ajouter des événements
- Cliquer sur le bouton "+" dans un jour
- Renseigner :
  - Nom du jeu
  - Titre du stream (optionnel)
  - Image du jeu
  - Heure de début et de fin
  - Jours (possibilité de sélectionner plusieurs jours)

### 6. Exporter en PNG
- Cliquer sur "Export PNG"
- Le planning est téléchargé en image haute qualité
- Partager sur vos réseaux sociaux !

## 📸 Fonctionnalités

### ✅ Fonctionnalités Principales

- [x] Authentification sécurisée (inscription/connexion)
- [x] Gestion de profil utilisateur
- [x] Création de plannings hebdomadaires
- [x] Ajout d'événements sur plusieurs jours
- [x] Upload d'images pour les événements
- [x] Export des plannings en PNG haute qualité
- [x] Navigation entre les semaines
- [x] Modification et suppression d'événements
- [x] Affichage des jours OFF

## 📁 Structure du Projet

```
twitchplanner/
│
├── backend/                    # Serveur Express
│   ├── server.js              # Point d'entrée du serveur
│   ├── routes/
│   │   ├── authRoutes.js      # Routes d'authentification
│   │   ├── planningRoutes.js  # Routes des plannings
│   │   ├── eventRoutes.js     # Routes des événements
│   │   ├── userRoutes.js      # Routes utilisateur/profil
│   │   └── uploadRoutes.js    
│   ├── middleware/
│   │   └── auth.js             
│   ├── package.json
│   ├── .env
│   └── .gitignore
│
├── frontend/                      # Application React
│   ├── src/
│   │   ├── pages/             # Pages de l'application
│   │   │   ├── Auth.jsx
│   │   │   ├── Plannings.jsx
│   │   │   ├── PlanningEditor.jsx
│   │   │   └── Profile.jsx
│   │   ├── components/        # Composants réutilisables
│   │   │   ├── StreamEventDialog.jsx
│   │   │   └── ui/            # Composants UI shadcn
│   │   ├── hooks/             # Custom hooks React
│   │   │   └── useAuth.jsx
│   │   ├── services/          # Services API
│   │   │   └── api.ts
│   │   └── main.tsx           # Point d'entrée
│   ├── package.json
│   ├── .env.example
│   └── vite.config.ts
│
├── README.md                   # Ce fichier
├── RAPPORT.pdf                 # Rapport technique (MCD/MPD, difficultés, apprentissages)
└── .gitignore
```

## 🗄️ Modèle de Données

### Schéma de la Base de Données

#### Table `users`
| Colonne       | Type         | Description                    |
|---------------|--------------|--------------------------------|
| id_users      | SERIAL (PK)  | Identifiant unique            |
| email         | VARCHAR(255) | Email de connexion (unique)   |
| password_hash | VARCHAR(255) | Mot de passe hashé            |
| display_name  | VARCHAR(100) | Nom d'affichage               |
| twitch_url    | VARCHAR(255) | URL de la chaîne Twitch       |
| logo_url      | VARCHAR(255) | Chemin du logo                |
| created_at    | TIMESTAMP    | Date de création du compte    |

#### Table `plannings`
| Colonne    | Type         | Description                    |
|------------|--------------|--------------------------------|
| id_planning| SERIAL (PK)  | Identifiant unique            |
| user_id    | INTEGER (FK) | Référence vers users          |
| title      | VARCHAR(200) | Titre du planning             |
| week_start | DATE         | Date de début de semaine      |
| week_end   | DATE         | Date de fin de semaine        |
| created_at | TIMESTAMP    | Date de création              |

#### Table `stream_events`
| Colonne           | Type         | Description                    |
|-------------------|--------------|--------------------------------|
| id_stream_events  | SERIAL (PK)  | Identifiant unique            |
| planning_id       | INTEGER (FK) | Référence vers plannings      |
| game_name         | VARCHAR(200) | Nom du jeu                    |
| stream_title      | VARCHAR(300) | Titre du stream (optionnel)   |
| image_url         | VARCHAR(500) | Chemin de l'image             |
| day_of_week       | INTEGER      | Jour de la semaine (0-6)      |
| start_time        | TIME         | Heure de début                |
| end_time          | TIME         | Heure de fin                  |
| created_at        | TIMESTAMP    | Date de création              |

### Relations

- Un **utilisateur** peut avoir plusieurs **plannings** (1,n)
- Un **planning** appartient à un seul **utilisateur** (n,1)
- Un **planning** peut contenir plusieurs **événements** (1,n)
- Un **événement** appartient à un seul **planning** (n,1)

## 🐛 Dépannage

### Le port 3000 est déjà utilisé

```bash
# Trouver le processus qui utilise le port
lsof -i :3000

# Tuer le processus (remplacer PID par le numéro affiché)
kill -9 PID
```

### Erreur CORS

Vérifier que le backend contient bien :

```javascript
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

### Les images ne s'affichent pas

1. Vérifier que le dossier `backend/uploads/` existe
2. Vérifier le middleware static dans `server.js` :

```javascript
app.use('/uploads', express.static('uploads'));
```

### Erreur de connexion à PostgreSQL

1. Vérifier que PostgreSQL est démarré
2. Vérifier les informations dans le fichier `.env`
3. Tester la connexion avec psql :

```bash
psql -U postgres -d twitchplanner
```

## 🔒 Sécurité

- Mots de passe hashés avec bcrypt (10 rounds de salt)
- Authentification par JWT avec expiration
- Validation des données côté serveur
- Protection contre les injections SQL (requêtes paramétrées)
- CORS configuré pour autoriser uniquement le frontend

## 📝 Scripts Disponibles

### Backend

```bash
npm start          # Démarrer le serveur
npm run dev        # Démarrer avec nodemon (auto-reload)
```

### Frontend

```bash
npm run dev        # Démarrer en mode développement
```

## 📚 Contexte du Projet

Projet réalisé dans le cadre du cours **Application Web B3** à Keyce Academy.

**Objectifs pédagogiques** :
- Conception d'une base de données relationnelle
- Développement d'une API REST avec Node.js/Express
- Développement d'une interface React moderne
- Gestion de l'authentification JWT
- Upload et gestion de fichiers
- Export de données (PNG)

