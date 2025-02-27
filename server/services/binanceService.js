const { Spot } = require('@binance/connector');

// Service pour interagir avec l'API Binance
const binanceService = {
    checkConnection: async (apiKey, secretKey) => {
        try {
            const client = new Spot(apiKey, secretKey, { baseURL: 'https://testnet.binance.vision' });
            const response = await client.account(); // Appel à une route protégée pour tester la connexion authentifiée
            return { success: true, message: 'Connexion API REST réussie.' };
        } catch (error) {
            console.error("Erreur lors de la vérification de la connexion API REST via @binance/connector:", error);
            return { success: false, message: `Erreur de connexion API REST. Détails: ${error.message}` };
        }
    },

    getAccountInfo: async (apiKey, secretKey) => {
        try {
            const client = new Spot(apiKey, secretKey, { baseURL: 'https://testnet.binance.vision' });
            const accountInfo = await client.account(); // Récupération des infos du compte
            return { success: true, data: accountInfo.data, message: 'Informations du compte récupérées.' };
        } catch (error) {
            console.error("Erreur lors de la récupération des informations du compte via @binance/connector:", error);
            return { success: false, message: `Erreur lors de la récupération des informations du compte. Détails: ${error.message}` };
        }
    },

    getPrice: async (symbol) => {
        try {
            const client = new Spot(); // Client REST SANS clés API pour les données publiques (prix)
            const priceData = await client.tickerPrice(symbol); // Appel à l'API Binance (tickerPrice) pour obtenir le prix
            return { success: true, price: priceData.data.price, symbol: priceData.data.symbol }; // Retourne succès avec le prix et le symbole
        } catch (error) {
            console.error(`Erreur lors de la récupération du prix pour ${symbol} via binanceService (avec @binance/connector):`, error);
            return { success: false, message: `Impossible de récupérer le prix pour ${symbol}. Détails: ${error.message}` }; // Retourne erreur avec un message détaillé
        }
    },
    get24hrTicker: async (symbol) => {
        try {
            const client = new Spot(); // Client REST SANS clés API pour les données publiques (ticker 24h)
            const ticker24h = await client.ticker24hr(symbol); // Appel à l'API Binance (ticker24hr) pour obtenir le ticker 24h
            return { success: true, data: ticker24h.data }; // Retourne succès avec les données du ticker 24h complètes dans .data
        } catch (error) {
            console.error(`Erreur lors de la récupération du ticker 24h pour ${symbol} via binanceService (avec @binance/connector):`, error);
            return { success: false, message: `Impossible de récupérer le ticker 24h pour ${symbol}. Détails: ${error.message}` }; // Retourne erreur avec un message détaillé
        }
    },


    // -- Vous pourrez ajouter d'autres fonctions de service ici (ex: historique des prix, etc.) --
};

module.exports = binanceService;