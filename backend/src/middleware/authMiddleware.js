const jwt = require('jsonwebtoken');

// Middleware pour vérifier le token JWT
const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Token manquant ou invalide' });
        }

        // Extraire le token JWT de l'en-tête d'autorisation
        const token = authHeader.split(' ')[1];

        // Vérifier si le token exite
        if (!token) {
            return res.status(401).json({ message: 'Token manquant' });
        }

        // Vérifier le token JWT et extraire les informations de l'utilisateur
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = {
            id: decoded.id,
            email: decoded.email,
        };

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expiré' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Token invalide' });
        }
        return res.status(500).json({ message: 'Erreur d\'authentification' });
    }
};

module.exports = authMiddleware;