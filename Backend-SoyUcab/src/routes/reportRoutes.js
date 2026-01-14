const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// GET /api/reports/top-companies
router.get('/top-companies', reportController.getTopCompanies);


// GET /api/reports/tutors
router.get('/tutors', reportController.getTutorsReport);

// GET /api/reports/mentions
router.get('/mentions', reportController.getMentionsReport);

// GET /api/reports/graduates-location
router.get('/graduates-location', reportController.getGraduatesLocation);

// GET /api/reports/getTopCarreras
router.get('/top-carreras', reportController.getTopCarreras);

router.get('/top-users', reportController.getTopUsers);

// GET /api/reports/gestion-eventos
router.get('/gestion-eventos', reportController.getGestionEventos);

// GET /api/reports/top-promedios-facultad
router.get('/top-promedios-facultad', reportController.getTopPromediosFacultad);

// GET /api/reports/eventos-detalles - Detalles completos de eventos con participantes
router.get('/eventos-detalles', reportController.getEventosDetalles);

// GET /api/reports/eventos-participantes - Participantes de un evento específico
router.get('/eventos-participantes', reportController.getEventoParticipantes);

// GET /api/reports/eventos-resumen - Resumen mejorado de eventos
router.get('/eventos-resumen', reportController.getEventosResumen);

module.exports = router;