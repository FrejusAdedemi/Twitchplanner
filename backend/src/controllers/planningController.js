const pool = require('../config/database');

// Liste les plannings de l utilisateur
const getAllPlannings = async (req, res) => {
    try {
        const userId = req.user.id; // Récupère l'ID de l'utilisateur à partir du token d'authentification

        const plannings = await pool.query(
            `SELECT * FROM plannings WHERE id_users = $1 ORDER BY start_date DESC`,
            [userId]
        );

        res.status(200).json({ plannings: plannings.rows });
    } catch (error) {
        console.error('Erreur lors de la récupération des plannings:', error);
        res.status(500).json({ message: 'Une erreur est survenue' });
    }
};

// Détail d'un planning
const getPlanningById = async (req, res) => {
    try {
        const userId = req.user.id; // Récupère l'ID de l'utilisateur à partir du token d'authentification
        const planningId = req.params.id;

        const planningResult = await pool.query(
            'SELECT * FROM plannings WHERE id_plannings = $1 AND id_users = $2',
            [planningId, userId]
        );

        if (planningResult.rows.length === 0) {
            return res.status(404).json({ message: 'Planning non trouvé' });
        }

        const planning = planningResult.rows[0];

        // Récupère les events associées au planning
        const eventsResult = await pool.query(
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

    res.json({ planning, events: eventsResult.rows });
    } catch (error) {
        console.error('Erreur lors de la récupération du planning:', error);
        res.status(500).json({ message: 'Une erreur est survenue' });
    }
};

// Création d'un planning
const createPlanning = async (req, res) => {
    try {
        const userId = req.user.id; // Récupère l'ID de l'utilisateur à partir du token d'authentification
        const { title, start_date, end_date } = req.body;

        if (!title || !start_date || !end_date) {
            return res.status(400).json({ message: 'Tous les champs sont requis' });
        }

        if (new Date(start_date) >= new Date(end_date)) {
            return res.status(400).json({ message: 'La date de début doit être antérieure à la date de fin' });
        }

        const result = await pool.query(
            `INSERT INTO plannings (id_users, title, start_date, end_date)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [userId, title, start_date, end_date]
        );

        res.status(201).json({ message: 'Planning créé avec succès', planning: result.rows[0] });
    } catch (error) {
        console.error('Erreur lors de la création du planning:', error);
        res.status(500).json({ message: 'Une erreur est survenue' });
    }
};

// Modification d'un planning
const updatePlanning = async (req, res) => {
    try {
        const userId = req.user.id; // Récupère l'ID de l'utilisateur à partir du token d'authentification
        const planningId = req.params.id;
        const { title, start_date, end_date } = req.body;

        const planningExists = await pool.query(
            'SELECT * FROM plannings WHERE id_plannings = $1 AND id_users = $2',
            [planningId, userId]
        );

        if (planningExists.rows.length === 0) {
            return res.status(404).json({ message: 'Planning non trouvé' });
        }

        // requête SQL dynamique en fonction des champs fournis
        let query = 'UPDATE plannings SET ';
        const values = [];
        const updates = [];
        let paramsCounter = 1;

        if(title) {
            updates.push(`title = $${paramsCounter}`);
            values.push(title);
            paramsCounter++;
        }
        if(start_date) {
            updates.push(`start_date = $${paramsCounter}`);
            values.push(start_date);
            paramsCounter++;
        }
        if(end_date) {
            updates.push(`end_date = $${paramsCounter}`);
            values.push(end_date);
            paramsCounter++;
        }

        if(updates.length === 0) {
            return res.status(400).json({ message: 'Aucun champ à mettre à jour' });
        }

        updates.push(`updated_at = NOW()`);

        query += updates.join(', ') + ` WHERE id_plannings = $${paramsCounter} AND id_users = $${paramsCounter + 1} RETURNING *`;
        values.push(planningId, userId);

        const result = await pool.query(query, values);

        res.status(200).json({ message: 'Planning mis à jour avec succès', planning: result.rows[0] });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du planning:', error);
        res.status(500).json({ message: 'Une erreur est survenue' });
    }
};

// Suppression d'un planning
const deletePlanning = async (req, res) => {
    try {
        const userId = req.user.id; // Récupère l'ID de l'utilisateur à partir du token d'authentification
        const planningId = req.params.id;

        const planningExists = await pool.query(
            'SELECT * FROM plannings WHERE id_plannings = $1 AND id_users = $2',
            [planningId, userId]
        );

        if (planningExists.rows.length === 0) {
            return res.status(404).json({ message: 'Planning non trouvé' });
        }

        await pool.query('DELETE FROM plannings WHERE id_plannings = $1 AND id_users = $2', [planningId, userId]);

        res.status(200).json({ message: 'Planning supprimé avec succès' });
    } catch (error) {
        console.error('Erreur lors de la suppression du planning:', error);
        res.status(500).json({ message: 'Une erreur est survenue' });
    }
};

module.exports = {
    getAllPlannings,
    getPlanningById,
    createPlanning,
    updatePlanning,
    deletePlanning,
};

