const express = require('express');
const router = express.Router();
const interactionController = require('../controllers/interactionController');

// Likes
router.post('/like', interactionController.toggleLike);
router.get('/check-like', interactionController.checkLike);

// Comentarios
router.post('/comment', interactionController.addComment);

// Notificaciones
router.get('/notifications/:email', interactionController.getNotifications);

// Agregar estas rutas
router.put('/notifications/:email/mark-read', interactionController.markNotificationAsRead);
router.put('/notifications/:email/mark-all-read', interactionController.markAllNotificationsAsRead);

module.exports = router;