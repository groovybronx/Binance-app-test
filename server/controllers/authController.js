// server/controllers/authController.js
const binanceService = require('../services/binanceService'); // Import du service Binance



// Fonction pour gérer la connexion (connexion à l'API Binance avec clés)
async function connectUser(req, res) {
    console.log('POST /auth/connect route hit');
    const { apiKey, secretKey } = req.body;
    console.log('Request body:', req.body);
    if (!apiKey || !secretKey) {
        return res.status(400).json({ success: false, message: 'Missing API Key or Secret Key' });
    }

    try {
        const connectionResult = await binanceService.checkConnection(apiKey, secretKey);
        if (!connectionResult.success) {
            return res.status(401).json({ success: false, message: 'Erreur de connexion à Binance Testnet (API REST). Vérifiez vos clés API.', details: connectionResult.message });
        }
        const accountInfoResult = await binanceService.getAccountInfo(apiKey, secretKey);
        if (!accountInfoResult.success) {
            return res.status(500).json({ success: false, message: 'Connexion à Binance Testnet réussie (API REST) mais erreur lors de la récupération des informations du compte.', details: accountInfoResult.message });
        }
        res.json({ success: true, message: 'Connexion à Binance Testnet réussie (API REST). Informations du compte récupérées.', accountInfo: accountInfoResult.data });
    } catch (error) {
        console.error('Error fetching account info:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch account information.', error: error.message });
    }
}

async function getAccount(req, res) {
    console.log('GET /auth/account route hit');
    const profiles = require('../profiles.json');
    const rememberedProfileName = req.headers['remembered-profile-name']; // Récupérer le nom du profil depuis les headers

    if (!rememberedProfileName) {
        return res.status(400).json({ success: false, message: 'Aucun profil mémorisé trouvé.' });
    }

    // Load saved profiles
    const profilesJSON = require('../profiles.json')

    const selectedProfile = profilesJSON.find(p => p.profileName === rememberedProfileName);

    if (!selectedProfile) {
        return res.status(404).json({ success: false, message: 'Profil mémorisé non trouvé.' });
    }

    const apiKey = selectedProfile.apiKey;
    const secretKey = selectedProfile.secretKey;

    if (!apiKey || !secretKey) {
        console.error('Clés API ou secrète manquantes dans le profil sélectionné.');
        res.status(500).json({ success: false, message: 'Clés API ou secrète manquantes dans le profil sélectionné.' });
        return;
    }

    try {
        const accountInfo = await binanceService.getAccountInfo(apiKey, secretKey);
        console.log('Account info fetched:', accountInfo);
        if (accountInfo.success) {
            res.json({ success: true, accountInfo: accountInfo.data });
        } else {
            console.error("Error fetching account info:", accountInfo.message);
            res.status(500).json({ success: false, message: accountInfo.message });
        }
    } catch (error) {
        console.error('Error fetching account info:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch account information.' });
    }
}
module.exports = { connectUser, getAccount };
