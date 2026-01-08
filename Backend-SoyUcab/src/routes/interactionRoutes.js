const express = require('express');
const router = express.Router();
const interactionController = require('../controllers/interactionController');

router.post('/like', interactionController.toggleLike);
router.post('/comment', interactionController.addComment);
router.get('/notifications/:email', interactionController.getNotifications);

module.exports = router;