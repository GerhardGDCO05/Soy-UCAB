const express = require('express');
const router = express.Router();
const announceController = require('../controllers/announceController');

// 1. Obtener anuncios
// GET /api/announcements?mi_rol=Estudiante (para personas)
// GET /api/announcements?creador_email=org@example.com (para ver los propios)
router.get('/', announceController.getAnnouncements);

// 2. Crear un nuevo anuncio
// POST /api/announcements
router.post('/', announceController.createAnnouncement);

// 3. Eliminar un anuncio
// DELETE /api/announcements/:fecha_creacion/:creador_email
router.delete('/:fecha_creacion/:creador_email', announceController.deleteAnnouncement);

// 4. Métrica: Registrar una vista en el anuncio (tracking único)
// POST /api/announcements/track-view
router.post('/track-view', announceController.trackView);



module.exports = router;