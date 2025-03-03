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
    res.json({ message: 'Utilisateur connecté avec succès' });
};


// Contrôleur pour la route /register (POST /auth/register)
exports.registerUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validation des données (exemple simplifié)
        if (!username || !password) {
            return res.status(400).json({ error: 'Nom d\'utilisateur et mot de passe requis' });
        }

        // Vérification de l'existence de l'utilisateur (exemple simplifié)
        // Remplacez ceci par une vérification réelle dans votre base de données
        const userExists = false; // Remplacez par la logique réelle
        if (userExists) {
            return res.status(409).json({ error: 'Utilisateur déjà existant' });
        }

        // Enregistrement de l'utilisateur (exemple simplifié)
        // Remplacez ceci par l'enregistrement réel dans votre base de données
        const newUser = { username, password }; // Remplacez par la logique réelle

        res.status(201).json({ message: 'Utilisateur enregistré avec succès', user: newUser });
    } catch (error) {
        console.error('Erreur lors de l\'enregistrement de l\'utilisateur:', error);
        res.status(500).json({ error: 'Erreur lors de l\'enregistrement de l\'utilisateur' });
    }
};