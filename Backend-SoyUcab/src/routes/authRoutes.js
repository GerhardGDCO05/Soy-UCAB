const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Registro y Login
router.post('/register', authController.register);
router.post('/login', authController.login);

// Perfil de usuario (ahora recibe el email como parámetro)
router.get('/me/:email', authController.me);

// Actualización de perfiles
router.put('/dependencia/:email', authController.updateDependencia);
router.put('/organizacion/:email', authController.updateOrganizacion);

module.exports = router;