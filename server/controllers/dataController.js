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
            res.json({ success: true, price: priceData.price, symbol: symbol }); // **NOUVEAU : Utilisation de priceData.price et priceData.symbol**
        } else {
            // Si le service n'a pas réussi à récupérer le prix, renvoyer une erreur
            res.status(500).json({ success: false, message: 'Impossible de récupérer le prix depuis Binance API.', details: priceData.message });
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
            res.json({ success: true, ticker24hData: ticker24hData.data }); // **NOUVEAU : Utilisation de ticker24hData.data** (car les données utiles sont dans .data dans ce cas)
        } else {
            // Si le service n'a pas réussi à récupérer le ticker 24h, renvoyer une erreur
            res.status(500).json({ success: false, message: 'Impossible de récupérer le ticker 24h depuis Binance API.', details: ticker24hData.message });
        }

    } catch (error) {
        console.error('Erreur dans dataController.get24hrTicker:', error);
        next(error); // Passer l'erreur au middleware de gestion des erreurs
    }
};

