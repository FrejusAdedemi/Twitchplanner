const pool = require('../config/database');

// Liste de tous les événements
const getEventsByPlanning = async (req, res) => {
    try {
        const userId = req.user.id;
        const planningId = req.params.planningId;

        const planningExists = await pool.query(
            'SELECT 1 FROM plannings WHERE id_plannings = $1 AND id_users = $2', 
            [planningId, userId]
        );

        if (planningExists.rows.length === 0) {
            return res.status(404).json({ message: 'Planning non trouvé' });
        }
        const result = await pool.query(
            `SELECT * FROM stream_events 
            WHERE id_plannings = $1 
            ORDER BY
             CASE day_of_week
              WHEN 'Lundi' THEN 1
              WHEN 'Mardi' THEN 2
              WHEN 'Mercredi' THEN 3
              WHEN 'Jeudi' THEN 4
              WHEN 'Vendredi' THEN 5
              WHEN 'Samedi' THEN 6
              WHEN 'Dimanche' THEN 7
             END,
             start_time`, 
            [planningId]
        );
        res.json({ events: result.rows });
    } catch (error) {
        console.error('Erreur lors de la récupération des événements :', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Ajouter un stream event au planning
const createEvent = async (req, res) => {
    try {
        const userId = req.user.id;
        const planningId = req.params.planningId;
        const { game_name, stream_title, game_image_url, day_of_week, start_time, end_time } = req.body;

        if (!game_name || !day_of_week || !start_time || !end_time) {
            return res.status(400).json({ message: 'Veuillez fournir tous les champs requis' });
        }

        // Vérifier que le planning appartient à l'utilisateur
        const planningExists = await pool.query(
            'SELECT 1 FROM plannings WHERE id_plannings = $1 AND id_users = $2', 
            [planningId, userId]
        );

        if (planningExists.rows.length === 0) {
            return res.status(404).json({ message: 'Planning non trouvé' });
        }

        // Vérifier que le jour est valide
        const validDays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
        if (!validDays.includes(day_of_week)) {
            return res.status(400).json({ message: 'Jour non valide. ' });
        }

        // ✅ On accepte game_image_url (URL ou null) mais on ne valide plus la taille
        const result = await pool.query(
            `INSERT INTO stream_events (id_plannings, game_name, stream_title, game_image_url, day_of_week, start_time, end_time) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) 
            RETURNING *`, 
            [planningId, game_name, stream_title, game_image_url, day_of_week, start_time, end_time]
        );

        res.status(201).json({ message: 'Événement ajouté avec succès', event: result.rows[0] });
    } catch (error) {
        console.error('Erreur lors de la création de l\'événement :', error);
        if (error.message.includes('end_time > start_time')) {
            return res.status(400).json({ message: 'L\'heure de fin doit être supérieure à l\'heure de début' });
        }
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Modifier un stream event
const updateEvent = async (req, res) => {
    try {
    const userId = req.user.id;
    const eventId = req.params.id;
    const { game_name, stream_title, game_image_url, day_of_week, start_time, end_time } = req.body;
    
    const eventExists = await pool.query(
        `SELECT se.* FROM stream_events se
        JOIN plannings p ON se.id_plannings = p.id_plannings
        WHERE se.id_stream_events = $1 AND p.id_users = $2`, 
        [eventId, userId]
    );

    if (eventExists.rows.length === 0) {
        return res.status(404).json({ message: 'Événement non trouvé' }); 
    }

    let query = 'UPDATE stream_events SET ';
    const values = [];
    const updates = [];
    let paramCounter = 1;

    if (game_name) {
      updates.push(`game_name = $${paramCounter}`);
      values.push(game_name);
      paramCounter++;
    }

    if (stream_title !== undefined) {
      updates.push(`stream_title = $${paramCounter}`);
      values.push(stream_title);
      paramCounter++;
    }

    if (game_image_url !== undefined) {
      updates.push(`game_image_url = $${paramCounter}`);
      values.push(game_image_url);
      paramCounter++;
    }

    if (day_of_week) {
      const validDays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
      if (!validDays.includes(day_of_week)) {
        return res.status(400).json({ error: 'Jour invalide' });
      }
      updates.push(`day_of_week = $${paramCounter}`);
      values.push(day_of_week);
      paramCounter++;
    }

    if (start_time) {
      updates.push(`start_time = $${paramCounter}`);
      values.push(start_time);
      paramCounter++;
    }

    if (end_time) {
      updates.push(`end_time = $${paramCounter}`);
      values.push(end_time);
      paramCounter++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Aucune donnée à mettre à jour' });
    }

    query += updates.join(', ');
    query += ` WHERE id_stream_events = $${paramCounter} RETURNING *`;
    values.push(eventId);

    const result = await pool.query(query, values);

    res.json({
      message: 'Event mis à jour avec succès',
      event: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// DELETE EVENT
const deleteEvent = async (req, res) => {
  try {
    const userId = req.user.id;
    const eventId = req.params.id;

    const result = await pool.query(
      `DELETE FROM stream_events 
       WHERE id_stream_events = $1 
       AND id_plannings IN (
         SELECT id_plannings FROM plannings WHERE id_users = $2
       )
       RETURNING *`,
      [eventId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event non trouvé' });
    }

    res.json({
      message: 'Event supprimé avec succès',
      event: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

module.exports = {
  getEventsByPlanning,
  createEvent,
  updateEvent,
  deleteEvent
};