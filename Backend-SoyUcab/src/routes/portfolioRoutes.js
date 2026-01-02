const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');

// Obtener portafolio
router.get('/:email', portfolioController.getPortfolioByEmail);

// Crear o Actualizar portafolio (Upsert)
router.post('/', portfolioController.upsertPortfolio);

// ELIMINAR portafolio
router.delete('/:email', portfolioController.deletePortfolio);

module.exports = router;