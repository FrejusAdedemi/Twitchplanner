const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const authMiddleware = require('../middleware/authMiddleware');

// Routes pour les événements
router.get('/plannings/:planningId/events', authMiddleware, eventController.getEventsByPlanning);
router.post('/plannings/:planningId/events', authMiddleware, eventController.createEvent);
router.put('/events/:id', authMiddleware, eventController.updateEvent);
router.delete('/events/:id', authMiddleware, eventController.deleteEvent);

module.exports = router;