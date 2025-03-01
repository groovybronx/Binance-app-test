// js/dashboard/dashboard.js
// --- FONCTIONS DU TABLEAU DE BORD ---
import '../script.js';
import { TopCryptoMovers } from '../components/TopCryptoMovers.js';

// Fonction pour afficher les soldes du compte dans le tableau
export function displayAccountBalances(accountInfo) {
    console.log("Fonction displayAccountBalances() appelée dans dashboard.js avec :", accountInfo);
    if (accountInfo && accountInfo.balances) {
        balanceTableBody.innerHTML = '';
        noBalancesMessage.style.display = 'none';
        balancesErrorMessage.style.display = 'none';

        const usdtBalances = accountInfo.balances.filter(balance => balance.asset.endsWith('USDT') && (parseFloat(balance.free) > 0 || parseFloat(balance.locked) > 0));

        if (usdtBalances.length > 0) {
            usdtBalances.forEach(balance => {
                const row = balanceTableBody.insertRow();
                const assetCell = row.insertCell();
                const freeBalanceCell = row.insertCell();
                const lockedBalanceCell = row.insertCell();

                assetCell.textContent = balance.asset;
                freeBalanceCell.textContent = parseFloat(balance.free).toFixed(2);
                lockedBalanceCell.textContent = parseFloat(balance.locked).toFixed(2);
            });
        } else {
            noBalancesMessage.style.display = 'block';
        }
    } else {
        balancesErrorMessage.style.display = 'block';
        balanceTableBody.innerHTML = '';
        noBalancesMessage.style.display = 'none';
    }
};


document.addEventListener('DOMContentLoaded', () => {
    console.log("dashboard.js chargé et DOMContentLoaded écouté.");

    // --- DECLARATIONS DES ELEMENTS HTML DU DASHBOARD
    const dashboardConnectionStatusDiv = document.getElementById('dashboardConnectionStatus');
    const balanceTableBody = document.getElementById('balanceTableBody');
    const noBalancesMessage = document.getElementById('noBalancesMessage');
    const balancesErrorMessage = document.getElementById('balancesErrorMessage');
    const cryptoVariationsContainer = document.getElementById('cryptoVariationsContainer');
    const cryptoVariationsTableBody = document.getElementById('cryptoVariationsTableBody');

    // Récupérer les conteneurs pour TopCryptoMovers Gainers et Losers
    const topMoversGainersContainer = document.getElementById('topCryptoMoversContainerGainers');
    const topMoversLosersContainer = document.getElementById('topCryptoMoversContainerLosers');


    // --- VARIABLES ET ETATS INTERNES AU DASHBOARD ---
    let websocketClient;
    let reconnectionAttempts = 0;
    const maxReconnectionAttempts = 5;
    const reconnectionDelay = 3000;
    const symbolsToTrack = [];


    // --- Création et rendu des composants TopCryptoMovers Gainers et Losers ---
    let topCryptoMoversGainersComponent, topCryptoMoversLosersComponent; // Déclarer ici pour portée globale dans dashboard.js

    // Rendre le composant TopCryptoMovers pour les Gainers (Hausse)
    if (topMoversGainersContainer) {
        topCryptoMoversGainersComponent = new TopCryptoMovers('topCryptoMoversContainerGainers'); // Instance pour les Gainers
        topCryptoMoversGainersComponent.render('gainers'); // Passer 'gainers' comme type
    } else {
        console.error("Conteneur HTML pour TopCryptoMovers (Gainers) avec l'ID 'topCryptoMoversContainerGainers' non trouvé dans index.html.");
    }

    // Rendre le composant TopCryptoMovers pour les Losers (Baisse)
    if (topMoversLosersContainer) {
        topCryptoMoversLosersComponent = new TopCryptoMovers('topCryptoMoversContainerLosers'); // Instance pour les Losers
        topCryptoMoversLosersComponent.render('losers'); // Passer 'losers' comme type
    } else {
        console.error("Conteneur HTML pour TopCryptoMovers (Losers) avec l'ID 'topCryptoMoversContainerLosers' non trouvé dans index.html.");
    }


    // Fonction pour récupérer les données des Top Crypto Movers (Gainers et Losers) et mettre à jour les composants
    window.fetchTopCryptoMoversData = async function() {
        try {
            // Récupérer les Top 5 Gainers
            const gainersResponse = await axios.get('/api/top-gainers'); // <-- API pour les "Hausse" (VERIFIEZ L'URL EXACTE !)
            const gainersData = gainersResponse.data;
            if (topCryptoMoversGainersComponent && gainersData) {
                topCryptoMoversGainersComponent.updateMovers(gainersData); // Mettre à jour les Gainers
            }

            // Récupérer les Top 5 Losers
            const losersResponse = await axios.get('/api/top-losers');   // <-- API pour les "Baisse" (VERIFIEZ L'URL EXACTE !)
            const losersData = losersResponse.data;
            if (topCryptoMoversLosersComponent && losersData) {
                topCryptoMoversLosersComponent.updateMovers(losersData);   // Mettre à jour les Losers
            }


        } catch (error) {
            console.error("Erreur lors de la récupération des Top Crypto Movers (Gainers et Losers):", error);
            // Gérer l'erreur (afficher un message à l'utilisateur, etc.)
        }
    };


    // Fonction pour initialiser la connexion WebSocket
    window.initWebSocket = function () {
        if (websocketClient && websocketClient.readyState === WebSocket.OPEN) {
            console.log('WebSocket est déjà connecté. Pas besoin de nouvelle connexion.');
            return;
        }

        websocketClient = new WebSocket('wss://stream.testnet.binance.vision/ws');

        websocketClient.onopen = () => {
            console.log('Client WebSocket connecté (dashboard.js)');
            reconnectionAttempts = 0;
            dashboardConnectionStatusDiv.textContent = 'Connecté via WebSocket - Flux de données temps réel activé.';
            dashboardConnectionStatusDiv.classList.remove('alert-info', 'alert-danger', 'alert-warning');
            dashboardConnectionStatusDiv.classList.add('alert-primary');
            subscribeToFavorites();
        };

        websocketClient.onclose = () => {
            console.log('Client WebSocket déconnecté (dashboard.js)');
            dashboardConnectionStatusDiv.textContent = 'WebSocket déconnecté. Tentative de reconnexion...';
            dashboardConnectionStatusDiv.classList.remove('alert-primary', 'alert-success');
            dashboardConnectionStatusDiv.classList.add('alert-warning');
            reconnectWebSocket();
        };

        websocketClient.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.e === '24hrTicker') {
                const symbol = data.s.toUpperCase();
                if (isFavorite(symbol)) {
                    const priceChangePercent = parseFloat(data.P).toFixed(2);
                    updateCryptoVariationDisplay(symbol, priceChangePercent, data);
                }
            } else {
                console.debug('Message WebSocket reçu (non-ticker) dans dashboard.js:', data);
            }
        };

        websocketClient.onerror = (error) => {
            console.error('Erreur du Client WebSocket (dashboard.js):', error);
            dashboardConnectionStatusDiv.textContent = `Erreur WebSocket: ${error.message}. Tentative de reconnexion...`;
            dashboardConnectionStatusDiv.classList.remove('alert-primary', 'alert-success', 'alert-info');
            dashboardConnectionStatusDiv.classList.add('alert-danger');
            reconnectWebSocket();
        };
    };


    // Fonction de reconnexion WebSocket
    function reconnectWebSocket() {
        if (reconnectionAttempts < maxReconnectionAttempts) {
            reconnectionAttempts++;
            dashboardConnectionStatusDiv.textContent = `WebSocket déconnecté. Reconnexion Tentative ${reconnectionAttempts} sur ${maxReconnectionAttempts} dans ${reconnectionDelay / 1000} secondes...`;
            setTimeout(initWebSocket, reconnectionDelay);
        } else {
            dashboardConnectionStatusDiv.textContent = `Échec de la reconnexion WebSocket après ${maxReconnectionAttempts} tentatives. Veuillez rafraîchir la page.`;
            dashboardConnectionStatusDiv.classList.remove('alert-warning', 'alert-primary');
            dashboardConnectionStatusDiv.classList.add('alert-danger');
            console.error(`Reconnexion WebSocket échouée après ${maxReconnectionAttempts} tentatives (dashboard.js).`);
        }
    }


    // Fonction pour mettre à jour l'affichage des variations de prix des cryptos (tableau)
    function updateCryptoVariationDisplay(symbol, priceChangePercent, data) {
        let rowElement = document.getElementById(`crypto-row-${symbol}`);
        let variationCell, priceCell, infoIconCell;

        if (!rowElement) {
            if (cryptoVariationsTableBody.rows.length >= 10) {
                return;
            }
            rowElement = cryptoVariationsTableBody.insertRow();
            rowElement.id = `crypto-row-${symbol}`;

            let symbolCell = rowElement.insertCell();
            variationCell = rowElement.insertCell();
            priceCell = rowElement.insertCell();
            infoIconCell = rowElement.insertCell();

            symbolCell.textContent = symbol;
            symbolCell.classList.add('symbol-cell');
            variationCell.classList.add('variation-cell');
            priceCell.classList.add('price-cell');
            infoIconCell.classList.add('info-icon-cell');

            const infoIcon = document.createElement('span');
            infoIcon.innerHTML = '<i class="fas fa-eye info-icon"></i>';
            infoIcon.style.cursor = 'pointer';
            infoIcon.title = 'Voir les informations détaillées';
            infoIcon.addEventListener('click', () => {
                window.displayAssetInfoPage(symbol);
            });
            infoIconCell.appendChild(infoIcon);

        } else {
            variationCell = rowElement.querySelector('.variation-cell');
            priceCell = rowElement.querySelector('.price-cell');
            infoIconCell = rowElement.querySelector('.info-icon-cell');
        }

        variationCell.textContent = `${priceChangePercent}%`;
        if (parseFloat(priceChangePercent) > 0) {
            variationCell.classList.add('positive');
            variationCell.classList.remove('negative');
        } else if (parseFloat(priceChangePercent) < 0) {
            variationCell.classList.add('negative');
            variationCell.classList.remove('positive');
        } else {
            variationCell.classList.remove('positive', 'negative');
        }

        const lastPrice = parseFloat(data.c).toFixed(2);
        priceCell.textContent = `${lastPrice} USDT`;
    }


    // Fonction pour s'abonner aux flux WebSocket des cryptos favorites
    function subscribeToFavorites() {
        cryptoVariationsTableBody.innerHTML = '';
        const favorites = window.getFavorites();
        const symbolsToSubscribe = favorites.slice(0, 10);

        if (websocketClient && websocketClient.readyState === WebSocket.OPEN) {
            websocketClient.send(JSON.stringify({ method: 'UNSUBSCRIBE', params: symbolsToSubscribe.map(symbol => `${symbol.toLowerCase()}@ticker`), id: 2 }));

            symbolsToSubscribe.forEach(symbol => {
                websocketClient.send(JSON.stringify({ method: 'SUBSCRIBE', params: [`${symbol.toLowerCase()}@ticker`], id: 1 }));
                console.log(`Subscribed to ${symbol} ticker stream (favorite) (dashboard.js): ${symbol}`);
            });
        }
        symbolsToSubscribe.forEach(symbol => {
            updateCryptoVariationDisplay(symbol, '0.00', { c: '0.00', P: '1.00' });
        });
    }


    // --- INITIALISATION DU DASHBOARD
    console.log("dashboard.js initialisation terminée.");
    fetchTopCryptoMoversData(); // Récupérer les données des Top Movers AU CHARGEMENT du dashboard (important !)
    initWebSocket();

});