const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');

// GET /api/members - Listar todos los miembros
router.get('/', memberController.getAllMembers);

// GET /api/members/stats - Estadísticas globales
router.get('/stats', memberController.getStats);

// GET /api/members/:email/followers-analysis - Análisis de seguidores
router.get('/:email/followers-analysis', memberController.getFollowersAnalysis);

// GET /api/members/:email - Obtener miembro por email
router.get('/:email', memberController.getMemberByEmail);

// PUT /api/members/:email - Actualizar miembro
// Se eliminó auth.verifyToken y auth.isOwnerOrAdmin
router.put('/:email', memberController.updateMember);

// POST /api/members - Crear nuevo miembro
router.post('/', memberController.createMember);

router.get('/search', memberController.searchMembers);

// En routes/memberRoutes.js
router.get('/advanced-search', memberController.advancedSearch);
// En tu archivo de rutas (probablemente routes/members.js o similar)
router.get('/members/:email', memberController.getMemberByEmail);

// ANTES de la ruta /members/advanced-search
router.get('/members/by-email', memberController.getMemberByEmailSimple);
module.exports = router;