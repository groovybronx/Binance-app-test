const { Spot } = require('@binance/connector');
const axios = require('axios');

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

// Fonction pour récupérer les Top 5 des cryptomonnaies en hausse (Gainers)
exports.getTopGainers = async () => {
    try {
        // --- URL de l'API BINANCE TESTNET pour les Top Gainers 24h (à vérifier et adapter !) ---
        const response = await axios.get('https://testnet.binance.vision/api/v3/ticker/24hr'); // Utiliser l'endpoint tickers 24h

        if (response.status !== 200) {
            return { success: false, message: `Erreur API Binance (Top Gainers): ${response.status} ${response.statusText}`, statusCode: response.status };
        }

        let tickers24hData = response.data;

        // --- Filtrer et trier pour obtenir les Top 5 Gainers ---
        const gainers = tickers24hData
            .filter(ticker => parseFloat(ticker.priceChangePercent) > 0 && ticker.symbol.endsWith('USDT')) // Filtrer: variation positive et paires USDT
            .sort((a, b) => parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent)) // Trier par variation descendante
            .slice(0, 5) // Prendre les 5 premiers (Top 5)
            .map(ticker => ({ // Formater les données retournées
                symbol: ticker.symbol,
                percentageChange: parseFloat(ticker.priceChangePercent).toFixed(2) // Pourcentage de variation (arrondi à 2 décimales)
            }));

        return { success: true, data: gainers }; // Renvoyer les Top 5 Gainers formatés

    } catch (error) {
        console.error("Erreur lors de la récupération des Top Gainers depuis Binance API:", error);
        return { success: false, message: "Erreur lors de la récupération des Top Gainers depuis Binance API.", details: error.message };
    }
};


// Fonction pour récupérer les Top 5 des cryptomonnaies en baisse (Losers)
exports.getTopLosers = async () => {
    try {
        // --- URL de l'API BINANCE TESTNET pour les Tickers 24h (la même que pour les gainers) ---
        const response = await axios.get('https://testnet.binance.vision/api/v3/ticker/24hr'); // Réutiliser l'endpoint tickers 24h

        if (response.status !== 200) {
            return { success: false, message: `Erreur API Binance (Top Losers): ${response.status} ${response.statusText}`, statusCode: response.status };
        }

        let tickers24hData = response.data;

        // --- Filtrer et trier pour obtenir les Top 5 Losers ---
        const losers = tickers24hData
            .filter(ticker => parseFloat(ticker.priceChangePercent) < 0 && ticker.symbol.endsWith('USDT')) // Filtrer: variation négative et paires USDT
            .sort((a, b) => parseFloat(a.priceChangePercent) - parseFloat(b.priceChangePercent)) // Trier par variation ASCENDANTE (du plus négatif au moins négatif)
            .slice(0, 5) // Prendre les 5 premiers (Top 5)
            .map(ticker => ({ // Formater les données retournées
                symbol: ticker.symbol,
                percentageChange: parseFloat(ticker.priceChangePercent).toFixed(2) // Pourcentage de variation (arrondi à 2 décimales)
            }));

        return { success: true, data: losers }; // Renvoyer les Top 5 Losers formatés

    } catch (error) {
        console.error("Erreur lors de la récupération des Top Losers depuis Binance API:", error);
        return { success: false, message: "Erreur lors de la récupération des Top Losers depuis Binance API.", details: error.message };
    }
};

module.exports = binanceService;