const express = require('express');
const router = express.Router();
const planningController = require('../controllers/planningController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, planningController.getAllPlannings);
router.get('/:id', authMiddleware, planningController.getPlanningById);
router.post('/', authMiddleware, planningController.createPlanning);
router.put('/:id', authMiddleware, planningController.updatePlanning);
router.delete('/:id', authMiddleware, planningController.deletePlanning);

module.exports = router;