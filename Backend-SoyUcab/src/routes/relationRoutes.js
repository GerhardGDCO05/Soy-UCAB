const express = require('express');
const router = express.Router();
const relationController = require('../controllers/relationController');

router.post('/', relationController.createRelation);           // Solicitar/Seguir
router.get('/:email', relationController.getRelations);        // Ver mis relaciones
router.put('/respond', relationController.updateRelationStatus); // Aceptar/Rechazar
router.delete('/break', relationController.deleteRelation);    // Romper relación / Unfollow

module.exports = router;