const pool = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Incription d'un nouvel utilisateur
const register = async (req, res) => {
    try {
        const { email, password, display_name, twitch_url, logo_path } = req.body;

        // Vérifier si l'utilisateur existe déjà
        if (!email || !password) {
            return res.status(400).json({ message: 'Email et mot de passe sont requis' });
        }

        const userExists = await pool.query(
            'SELECT * FROM users WHERE email = $1', 
            [email]
        );

        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'Cet email est deja utilisé' });
        }

        // Hasher le mot de passe
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        // Insérer le nouvel utilisateur dans la base de données
        const result = await pool.query(
        `INSERT INTO users (email, password_hash, display_name, twitch_url, logo_path) 
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING id_users, email, display_name, twitch_url, logo_path, created_at`,
        [email, password_hash, display_name || null, twitch_url || null, logo_path || null]
        );

        const user = result.rows[0];

        // Générer un token JWT
        const token = jwt.sign(
            { id: user.id_users, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'Utilisateur créé avec succès',
            user: {
                id: user.id_users,
                email: user.email,
                display_name: user.display_name,
                twitch_url: user.twitch_url,
                logo_path: user.logo_path,
                created_at: user.created_at,
            },
            token,
        });
    } catch (error) {
        console.error('Erreur lors de l\'inscription:', error);
        res.status(500).json({ message: 'Une erreur est survenue' });
    }
};

// Login d'un utilisateur existant
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email et mot de passe sont requis' });
        }

        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1', 
            [email]
        );

        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ message: 'Identifiants incorrects' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Identifiants incorrects' });
        }

        // Générer un token JWT
        const token = jwt.sign(
            { id: user.id_users, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        const userResult = await pool.query(
            'SELECT id_users, email, display_name, twitch_url, logo_path, created_at FROM users WHERE id_users = $1', 
            [user.id_users]
        );

        res.status(200).json({
            message: 'Connexion reussie',
            user: userResult.rows[0],
            token,
        });
    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        res.status(500).json({ message: 'Une erreur est survenue' });
    }
};

// Récupérer les informations de l'utilisateur connecté
const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const userResult = await pool.query(
            'SELECT * FROM users WHERE id_users = $1', 
            [userId]
        );
        
        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        res.status(200).json({ user: userResult.rows[0] });
    } catch (error) {
        console.error('Erreur lors de la récupération du profil:', error);
        res.status(500).json({ message: 'Une erreur est survenue' });
    }
};

module.exports = {
    register,
    login,
    getProfile,
};
