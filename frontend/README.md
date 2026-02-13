# TwitchPlanner Frontend

Frontend React pour l'application TwitchPlanner, conçu pour se connecter au backend Node.js local.

## 📋 Prérequis

- Node.js (v18 ou supérieur)
- npm ou yarn
- Backend Node.js TwitchPlanner en cours d'exécution sur `http://localhost:3000`

## 🚀 Installation

1. **Installer les dépendances** :
```bash
npm install
```

2. **Vérifier que le backend est en cours d'exécution** :
   - Le backend doit tourner sur `http://localhost:3000`
   - Vérifier dans `src/api/api.js` que l'URL correspond

## 🎯 Lancement

### Mode développement
```bash
npm run dev
```
L'application sera accessible sur `http://localhost:5173`

### Build de production
```bash
npm run build
```

### Preview du build
```bash
npm run preview
```

## 📁 Structure du projet

```
src/
├── api/              # Services API (axios, requêtes backend)
├── components/       # Composants React réutilisables
│   ├── ui/          # Composants UI de base
│   ├── Navbar.jsx
│   └── StreamEventDialog.jsx
├── hooks/           # Hooks React personnalisés
│   ├── useAuth.jsx
│   └── useToast.js
├── pages/           # Pages de l'application
│   ├── Index.jsx          # Page d'accueil
│   ├── Auth.jsx           # Connexion/Inscription
│   ├── Plannings.jsx      # Liste des plannings
│   ├── PlanningEditor.jsx # Éditeur de planning
│   └── Profile.jsx        # Profil utilisateur
├── utils/           # Fonctions utilitaires
├── App.jsx          # Composant principal avec routing
├── main.jsx         # Point d'entrée
└── index.css        # Styles globaux
```

## 🔧 Configuration

### API Backend
L'URL du backend est configurée dans `src/api/api.js` :
```javascript
const API_URL = 'http://localhost:3000/api';
```

### Variables d'environnement (optionnel)
Vous pouvez créer un fichier `.env` pour personnaliser :
```env
VITE_API_URL=http://localhost:3000/api
```

## 🎨 Fonctionnalités

- ✅ Authentification JWT
- ✅ Création et gestion de plannings
- ✅ Ajout/modification/suppression d'événements de stream
- ✅ Vue hebdomadaire (7 jours)
- ✅ Export en PNG
- ✅ Gestion du profil utilisateur
- ✅ Design inspiré de Twitch (violet/rose)

## 🔑 Points importants

### Mapping des jours
Le backend utilise les jours en français ("Lundi", "Mardi"...) tandis que l'interface utilise des index (0-6). Le mapping est géré automatiquement dans `src/api/api.js` :
- `dayToFrench(index)` : Convertit 0-6 → "Lundi"-"Dimanche"
- `frenchToDay(day)` : Convertit "Lundi"-"Dimanche" → 0-6

### Structure des données
- **Backend** : `id_users`, `id_plannings`, `id_stream_events`
- **Backend** : `start_date`, `end_date` (plannings)
- **Backend** : `game_image_url` (événements)
- **Backend** : `day_of_week` en français

## 🐛 Dépannage

### Le frontend ne se connecte pas au backend
1. Vérifier que le backend tourne sur `http://localhost:3000`
2. Vérifier CORS dans le backend (`cors` doit être activé)
3. Ouvrir la console du navigateur pour voir les erreurs

### Erreurs 401 (Non autorisé)
1. Vérifier que le token JWT est bien stocké dans localStorage
2. Se déconnecter et se reconnecter
3. Vérifier que `JWT_SECRET` est identique backend/frontend

### Export PNG ne fonctionne pas
1. Vérifier que `html2canvas` est bien installé
2. Les images doivent être accessibles (CORS)

## 📝 Notes de développement

- Les composants UI sont dans `src/components/ui/`
- Le design utilise Tailwind CSS avec des couleurs personnalisées
- Les toasts utilisent un système simple sans bibliothèque externe
- L'authentification persiste via localStorage

## 🎓 Conforme au projet

Ce frontend respecte les consignes du projet :
- ✅ Base de données relationnelle (PostgreSQL via backend)
- ✅ Authentification utilisateur
- ✅ Création de plannings hebdomadaires
- ✅ Gestion des événements de stream
- ✅ Export en image
- ✅ Profil utilisateur avec Twitch URL et logo
- ✅ Design moderne et responsive

## 📞 Support

En cas de problème, vérifier :
1. Les logs du backend
2. La console du navigateur (F12)
3. L'onglet Network pour voir les requêtes API
