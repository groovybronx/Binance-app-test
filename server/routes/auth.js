const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // Import du contrôleur d'authentification

// Route pour la connexion (connexion à l'API Binance avec clés)
router.post('/connect', authController.connectUser);// Route POST /auth/connect qui utilise la fonction connectUser du contrôleur

// -- Ici, vous pourrez ajouter d'autres routes liées à l'authentification (ex: inscription, déconnexion, etc.) --

module.exports = router;