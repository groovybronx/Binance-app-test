const axios = require('axios'); // Importer le module axios pour les appels API REST
const binanceService = require('../services/binanceService'); // Import du service Binance

// Contrôleur pour la route /price (GET /data/price) - Récupérer le prix actuel d'un symbole
exports.getPrice = async (req, res, next) => {
    const symbol = req.query.symbol; // Récupérer le symbole depuis les paramètres de requête

    if (!symbol) {
        return res.status(400).json({ success: false, message: 'Symbole de cryptomonnaie requis.' });
    }

    try {
        // **Appel au service Binance pour récupérer le prix réel via l'API REST**
        const priceData = await binanceService.getPrice(symbol); // **NOUVEAU : Appel à binanceService.getPrice(symbol)**

        if (priceData.success) { // Vérifier si l'appel au service a réussi
            // Envoi de la réponse JSON avec le prix réel récupéré du service Binance
            res.status(200).json({ success: true, price: priceData.price, symbol: symbol }); // **NOUVEAU : Utilisation de priceData.price et priceData.symbol**
        } else {
            // Si le service n'a pas réussi à récupérer le prix, renvoyer une erreur
            // Amélioration: Renvoyer le status code du service si disponible, sinon 500 par défaut
            const statusCode = priceData.statusCode || 500;
            res.status(statusCode).json({ success: false, message: 'Impossible de récupérer le prix depuis Binance API.', details: priceData.message });
        }

    } catch (error) {
        console.error('Erreur dans dataController.getPrice:', error);
        next(error); // Passer l'erreur au middleware de gestion des erreurs
    }
};

// Contrôleur pour la route /24hr-ticker (GET /data/24hr-ticker) - Récupérer le ticker 24h d'un symbole
exports.get24hrTicker = async (req, res, next) => {
    const symbol = req.query.symbol; // Récupérer le symbole depuis les paramètres de requête

    if (!symbol) {
        return res.status(400).json({ success: false, message: 'Symbole de cryptomonnaie requis.' });
    }

    try {
        // **Appel au service Binance pour récupérer le ticker 24h réel via l'API REST**
        const ticker24hData = await binanceService.get24hrTicker(symbol); // **NOUVEAU : Appel à binanceService.get24hrTicker(symbol)**

        if (ticker24hData.success) { // Vérifier si l'appel au service a réussi
            // Envoi de la réponse JSON avec les données du ticker 24h réel récupérées du service Binance
            res.status(200).json({ success: true, ticker24hData: ticker24hData.data }); // **NOUVEAU : Utilisation de ticker24hData.data** (car les données utiles sont dans .data dans ce cas)
        } else {
            // Si le service n'a pas réussi à récupérer le ticker 24h, renvoyer une erreur
            // Amélioration: Renvoyer le status code du service si disponible, sinon 500 par défaut
            const statusCode = ticker24hData.statusCode || 500;
            res.status(statusCode).json({ success: false, message: 'Impossible de récupérer le ticker 24h depuis Binance API.', details: ticker24hData.message });
        }

    } catch (error) {
        console.error('Erreur dans dataController.get24hrTicker:', error);
        next(error); // Passer l'erreur au middleware de gestion des erreurs
    }
};

//recuperer tout les symboles
exports.get24hrTickers = async (req, res) => {
    try {
        // --- MODIFICATION DE L'URL ICI POUR UTILISER L'API SPOT TESTNET ---
        const response = await axios.get('https://testnet.binance.vision/api/v3/ticker/24hr'); // Endpoint API SPOT Testnet pour TOUS les tickers 24h

        // Vérifier si la réponse est OK (statut 2xx)
        if (response.status >= 200 && response.status < 300) {
            const tickers24hData = response.data;
            res.status(200).json({ success: true, tickers24hData: tickers24hData });
        } else {
            // Utiliser le status code de la réponse pour informer le client de l'erreur
            res.status(response.status).json({ success: false, message: `Erreur API Binance (tickers 24h - SPOT): ${response.status} ${response.statusText}` });
        }
    } catch (error) {
        console.error("Erreur lors de la requête des tickers 24h à l'API Binance SPOT:", error);
        // Amélioration: uniformiser la réponse d'erreur et utiliser un statut 500 pour les erreurs serveur
        res.status(500).json({ success: false, message: "Erreur serveur lors de la récupération des tickers 24h SPOT.", details: error.message });
    }
};

// Contrôleur pour la route /top-gainers (GET /api/top-gainers) - Récupérer les Top 5 "Hausse"
exports.getTopGainers = async (req, res, next) => {
    try {
        // **Appel à binanceService pour récupérer les Top 5 "Hausse"**
        const topGainersData = await binanceService.getTopGainers(); // <-- Fonction à implémenter dans binanceService

        if (topGainersData.success) {
            res.status(200).json({ success: true, topGainers: topGainersData.data }); // <-- Renommer potentiellement 'data' en 'topGainers' pour plus de clarté
        } else {
            const statusCode = topGainersData.statusCode || 500;
            res.status(statusCode).json({ success: false, message: 'Impossible de récupérer les Top Gainers depuis Binance API.', details: topGainersData.message });
        }

    } catch (error) {
        console.error('Erreur dans dataController.getTopGainers:', error);
        next(error);
    }
};

// Contrôleur pour la route /top-losers (GET /api/top-losers) - Récupérer les Top 5 "Baisse"
exports.getTopLosers = async (req, res, next) => {
    try {
        // **Appel à binanceService pour récupérer les Top 5 "Baisse"**
        const topLosersData = await binanceService.getTopLosers(); // <-- Fonction à implémenter dans binanceService

        if (topLosersData.success) {
            res.status(200).json({ success: true, topLosers: topLosersData.data }); // <-- Renommer potentiellement 'data' en 'topLosers' pour plus de clarté
        } else {
            const statusCode = topLosersData.statusCode || 500;
            res.status(statusCode).json({ success: false, message: 'Impossible de récupérer les Top Losers depuis Binance API.', details: topLosersData.message });
        }

    } catch (error) {
        console.error('Erreur dans dataController.getTopLosers:', error);
        next(error);
    }
};