const express = require('express');
const router = express.Router();
const relationController = require('../controllers/relationController');

// POST /api/relations - crear relación (seguimiento/amistad)

router.post('/', relationController.createRelation);

// GET /api/relations/:email - obtener relaciones de un usuario específico

router.get('/:email', relationController.getRelationsByEmail);

module.exports = router;