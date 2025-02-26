require('dotenv').config();
const express = require('express');
const { Spot } = require('@binance/connector');
const util = require('util'); 
const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.json());

let apiKey = '';
let secretKey = '';
let restClient = null; // Client REST Binance API (initialisé après connexion réussie)
const logger = console;


// ======= ROUTES REST API VERS BINANCE TESTNET =======

// Route pour gérer la connexion (REST, pour la saisie des clés API et test initial)
app.post('/connect', async (req, res) => {
    apiKey = req.body.apiKey;
    secretKey = req.body.secretKey;

    if (!apiKey || !secretKey) {
        return res.status(400).json({ success: false, message: 'Clé API et clé secrète requises.' });
    }

    try {
        restClient = new Spot(apiKey, secretKey, { baseURL: 'https://testnet.binance.vision' }); // **Client REST pour Binance Testnet**

        // **Récupérer les informations du compte après test de connexion réussi (via REST API)**
        let accountInfo;
        await restClient.account().then(response => {
            logger.debug("Connexion REST à Binance Testnet réussie (test initial des clés API). Récupération des informations du compte.");
            accountInfo = response.data; // **Stocker les données de compte**
        }).catch(error => { // **Gestion d'erreur spécifique pour l'appel à account()**
            logger.error("Erreur lors de la récupération des informations du compte:", error);
            throw new Error("Échec de la récupération des informations du compte."); // **Propager l'erreur**
        });

        // **Envoyer les informations du compte dans la réponse JSON au frontend**
        res.json({
            success: true,
            message: 'Connexion à Binance Testnet réussie (WebSocket activé côté client - connexion *directe* à Binance) ! Informations du compte récupérées.',
            accountInfo: accountInfo // **Ajouter accountInfo à la réponse**
        });

    } catch (error) {
        logger.error("Erreur lors de la tentative de connexion REST (test des clés API):", error);
        logger.error("Erreur détaillée:", error);
        res.status(500).json({ success: false, message: 'Échec de la connexion à Binance Testnet (test des clés API via REST). Vérifiez vos clés API et les logs du serveur. ' + error.message }); // **Inclure le message d'erreur dans la réponse**
    }
});

// Route pour obtenir le prix actuel d'un symbole (pour la recherche rapide et favoris) - via REST API
app.get('/price', async (req, res) => {
    const symbol = req.query.symbol; // Récupérer le symbole depuis les paramètres de requête

    if (!symbol) {
        return res.status(400).json({ success: false, message: 'Symbole de cryptomonnaie requis.' });
    }

    try {
        const priceData = await restClient.tickerPrice(symbol); // Utiliser tickerPrice pour le prix actuel (REST API)
        res.json({ success: true, price: priceData.data.price }); // Renvoyer seulement le prix

    } catch (error) {
        logger.error(`Erreur lors de la récupération du prix pour ${symbol} (via REST API):`, error);
        res.status(500).json({ success: false, message: `Impossible de récupérer le prix pour ${symbol} (via REST API).` });
    }
});


// Route pour obtenir les données du ticker 24h pour un symbole (page d'information détaillée) - via REST API
app.get('/24hr-ticker', async (req, res) => {
    const { symbol } = req.query;

    try {
        // Check if symbol is missing or invalid
        if (!symbol || typeof symbol !== 'string' || symbol.trim() === '') {
            return res.status(400).json({ error: 'Invalid or missing symbol' }); // Respond with 400 error for bad request
        }

        const tickerData = await restClient.ticker24hr(symbol); // Récupérer les données ticker 24h via REST API

        // **Enrichir les données du ticker 24h avec un statut "success: true"**
        const safeTickerData = {
            success: true, // Ajout du statut success: true
            symbol: tickerData.data.symbol,
            priceChangePercent: tickerData.data.priceChangePercent,
            lastPrice: tickerData.data.lastPrice,
            highPrice: tickerData.data.highPrice,
            lowPrice: tickerData.data.lowPrice,
            volume: tickerData.data.volume,
            quoteVolume: tickerData.data.quoteVolume
        };
        res.json(safeTickerData); // Renvoyer les données enrichies et sécurisées


        if (!tickerData) {
            return res.status(404).json({ error: 'Ticker data not found' }); // Respond with 404 error if data is not found
        }

        res.json(tickerData);
    } catch (error) {
        // console.error('Erreur lors de la récupération des données ticker 24h (via REST API): Message:', error.message, 'Code:', error.code); // **COMMENTED OUT**
        // const errorMessage = error.message || 'Erreur inconnue lors de la récupération des données.'; // **COMMENTED OUT**
        // const errorCode = error.code || 'ERREUR_INCONNUE'; // **COMMENTED OUT**
        res.status(500).json({ success: false, error: 'Server Error' }); // **SIMPLIFIED RESPONSE**
    }
});



// Route pour rafraîchir les informations du compte (REST API) - route complète
app.get('/account', async (req, res) => {
    if (!restClient) {
        return res.status(400).json({ success: false, message: 'Connexion API non initialisée.' });
    }

    try {
        const accountInfo = await restClient.account(); // Récupérer les informations du compte via REST API
        res.json({ success: true, accountInfo: accountInfo.data });
    } catch (error) {
        logger.error("Erreur lors de la récupération des informations du compte (via REST API):", error);
        res.status(500).json({ success: false, message: 'Impossible de rafraîchir les informations du compte (via REST API).' });
    }
});


// ======= LANCEMENT DU SERVEUR REST API =======
app.listen(port, () => {
    logger.log(`Serveur REST API écoutant sur le port ${port}`);
});

// **IMPORTANT :  Ce serveur `server.js` *NE GÈRE PAS* le WebSocket. **
// **Le client (script.js) se connecte *DIRECTEMENT* au serveur WebSocket de Binance Testnet.**
// **Si vous souhaitez que le serveur Node.js agisse comme un *proxy WebSocket*, **
// **vous devrez implémenter un serveur WebSocket *dans ce fichier `server.js`*, **
// **et modifier `script.js` pour qu'il se connecte à *votre serveur WebSocket local* (port 3000 par exemple), **
// **et *votre serveur WebSocket local* agirait comme un intermédiaire (proxy) vers Binance WebSocket.**
// **Pour l'instant, la configuration est :  Frontend (script.js) -> WebSocket Binance Testnet (DIRECT).**