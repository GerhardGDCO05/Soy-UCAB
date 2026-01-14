const express = require('express');
const router = express.Router();
const userRolesController = require('../controllers/rolesController');

// Obtener TODOS los roles de un usuario específico
// GET /api/user-roles/user/juan.perez@gmail.com
router.get('/user/:email', userRolesController.getUserRoles);

module.exports = router;