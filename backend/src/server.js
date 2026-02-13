const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'API TwitchPlanner en ligne',
    version: '1.0.0' 
  });
});

// Routes Authentification
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Routes Utilisateur
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

// Routes Planning
const planningRoutes = require('./routes/planningRoutes');
app.use('/api/plannings', planningRoutes);

// Routes Événements
const eventRoutes = require('./routes/eventRoutes');
app.use('/api', eventRoutes);


app.use((req, res) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

app.use((err, req, res, next) => {
  console.error('Erreur interne du serveur:', err.stack);
  res.status(500).json({ message: 'Erreur interne du serveur' });
});

app.listen(PORT, () => {
  console.log('TwitchPlanner API en cours d\'exécution...');
  console.log(`TwitchPlanner API sur http://localhost:${PORT}`);
  console.log('Routes disponibles:');
  console.log('- POST /api/auth/register');
  console.log('- POST /api/auth/login');
  console.log('- GET /api/auth/profile');
  console.log('- GET /api/users/profile');
  console.log('- PUT /api/users/profile');
  console.log('- GET /api/plannings');
  console.log('- POST /api/plannings');
  console.log('- GET /api/plannings/:planningId/events');
  console.log('- POST /api/plannings/:planningId/events');
  console.log('- PUT /api/events/:id');
  console.log('- DELETE /api/events/:id');
  
});