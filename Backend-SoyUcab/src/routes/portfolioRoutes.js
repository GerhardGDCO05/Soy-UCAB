const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');
const auth = require('../middleware/auth');

// GET /api/portfolio/me
router.get('/me', auth.verifyToken, portfolioController.getMyPortfolio);

// PUT /api/portfolio/me
router.put('/me', auth.verifyToken, portfolioController.upsertMyPortfolio);

module.exports = router;