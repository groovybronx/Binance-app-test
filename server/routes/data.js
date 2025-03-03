const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');

// Route pour obtenir le prix actuel d'un symbole (pour la recherche rapide et favoris) - via REST API
router.get('/price', dataController.getPrice);

// Route pour obtenir le ticker 24h d'un symbole - via REST API
router.get('/24hr-ticker', dataController.get24hrTicker);

// Route pour obtenir les tickers 24h de TOUS les symboles - via REST API
router.get('/24hr-tickers', dataController.get24hrTickers);

// Assurez-vous que cette route est définie
//router.get('/account/info', dataController.getAccountInfo);

module.exports = router;
// -- Ici, vous pourrez ajouter d'autres routes liées aux données --

