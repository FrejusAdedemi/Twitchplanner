const pool = require('../config/database');
const bcrypt = require('bcryptjs');

// GET USER PROFILE
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      'SELECT id_users, email, twitch_url, logo_url, display_name FROM users WHERE id_users = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// UPDATE USER PROFILE
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { email, password, twitch_url, logo_url, display_name } = req.body;

    let query = 'UPDATE users SET ';
    const values = [];
    const updates = [];
    let paramCounter = 1;

    if (email) {
      const emailExists = await pool.query(
        'SELECT id_users FROM users WHERE email = $1 AND id_users != $2',
        [email, userId]
      );
      if (emailExists.rows.length > 0) {
        return res.status(400).json({ error: 'Cet email est déjà utilisé' });
      }
      updates.push(`email = $${paramCounter}`);
      values.push(email);
      paramCounter++;
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push(`password_hash = $${paramCounter}`);
      values.push(hashedPassword);
      paramCounter++;
    }

    if (twitch_url !== undefined) {
      updates.push(`twitch_url = $${paramCounter}`);
      values.push(twitch_url);
      paramCounter++;
    }

    if (logo_url !== undefined) {
      updates.push(`logo_url = $${paramCounter}`);
      values.push(logo_url);
      paramCounter++;
    }

    // AJOUT : Support du display_name
    if (display_name !== undefined) {
      updates.push(`display_name = $${paramCounter}`);
      values.push(display_name);
      paramCounter++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Aucune donnée à mettre à jour' });
    }

    query += updates.join(', ');
    query += ` WHERE id_users = $${paramCounter} RETURNING id_users, email, twitch_url, logo_url, display_name`;
    values.push(userId);

    const result = await pool.query(query, values);

    res.json({
      message: 'Profil mis à jour avec succès',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile
};