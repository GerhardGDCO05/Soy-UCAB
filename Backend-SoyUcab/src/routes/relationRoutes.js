const express = require('express');
const router = express.Router();
const relationController = require('../controllers/relationController');
const auth = require('../middleware/auth');

// POST /api/relations - crear relación (seguimiento/amistad)
router.post('/', auth.verifyToken, relationController.createRelation);

// GET /api/relations/me - obtener relaciones del usuario autenticado
router.get('/me', auth.verifyToken, relationController.getMyRelations);

module.exports = router;
