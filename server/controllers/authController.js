const binanceService = require('../services/binanceService'); // Import du service Binance

// Contrôleur pour la route /connect (POST /auth/connect)
exports.connectUser = async (req, res, next) => {
    const { apiKey, secretKey } = req.body;

    if (!apiKey || !secretKey) {
        return res.status(400).json({ success: false, message: 'Clés API et Secret Key manquantes.' });
    }

    try {
        const connectionResult = await binanceService.checkConnection(apiKey, secretKey); // Appel au service Binance pour vérifier la connexion
        if (connectionResult.success) {
            // Récupérer les infos du compte après la connexion réussie
            const accountInfo = await binanceService.getAccountInfo(apiKey, secretKey);
            if (accountInfo.success) {
                res.json({ success: true, message: 'Connexion à Binance Testnet réussie (API REST). Informations du compte récupérées.', accountInfo: accountInfo.data });
            } else {
                res.status(500).json({ success: false, message: 'Connexion à Binance Testnet réussie (API REST) mais erreur lors de la récupération des informations du compte.', details: accountInfo.message });
            }
        } else {
            res.status(401).json({ success: false, message: 'Erreur de connexion à Binance Testnet (API REST). Vérifiez vos clés API.', details: connectionResult.message });
        }
    } catch (error) {
        console.error('Erreur dans authController.connectUser:', error);
        next(error); // Passer l'erreur au middleware de gestion des erreurs
    }
};

// -- Ici, vous pourrez ajouter d'autres fonctions de contrôleur liées à l'authentification (ex: inscription, déconnexion, etc.) --