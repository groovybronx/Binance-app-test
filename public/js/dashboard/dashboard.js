// js/dashboard/dashboard.js

// --- Import des Composants et Services (si nécessaire plus tard) ---
// import { BalanceTable } from '../components/BalanceTable.js'; // Importez BalanceTable ici quand il sera prêt
// import { accountService } from '../services/accountService.js'; // Importez accountService ici quand il sera prêt

document.addEventListener('DOMContentLoaded', () => {
    console.log("dashboard.js chargé et DOMContentLoaded écouté.");

    // --- DECLARATIONS DES ELEMENTS HTML DU DASHBOARD (ADAPTEZ LES SELECTEURS SI NECESSAIRE) ---
    const dashboardConnectionStatusDiv = document.getElementById('dashboardConnectionStatus');
    const balanceTableBody = document.getElementById('balanceTableBody'); // Ref vers le tbody du tableau des balances (dans index.html)
    const noBalancesMessage = document.getElementById('noBalancesMessage');
    const balancesErrorMessage = document.getElementById('balancesErrorMessage');
    const cryptoVariationsContainer = document.getElementById('cryptoVariationsContainer');
    const cryptoVariationsTableBody = document.getElementById('cryptoVariationsTableBody');


    // --- VARIABLES ET ETATS INTERNES AU DASHBOARD ---
    let websocketClient;
    let reconnectionAttempts = 0;
    const maxReconnectionAttempts = 5;
    const reconnectionDelay = 3000;
    const symbolsToTrack = []; // Pourrait être géré par un service plus tard



    // --- FONCTIONS DU TABLEAU DE BORD ---

    // Fonction pour afficher les soldes du compte dans le tableau (exemple - à adapter/déplacer vers un composant BalanceTable ?)
    window.displayAccountBalances = function (accountInfo) {
        console.log("Fonction displayAccountBalances() appelée dans dashboard.js avec :", accountInfo); // Log pour vérifier l'appel
        if (accountInfo && accountInfo.balances) {
            balanceTableBody.innerHTML = '';
            noBalancesMessage.style.display = 'none';
            balancesErrorMessage.style.display = 'none';

            // Filtrer les soldes pour ne garder que ceux en USDT
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


    // Fonction pour initialiser la connexion WebSocket (à déplacer potentiellement dans un service accountService.js)
    window.initWebSocket = function () {
        if (websocketClient && websocketClient.readyState === WebSocket.OPEN) {
            console.log('WebSocket est déjà connecté. Pas besoin de nouvelle connexion.');
            return; // Si déjà connecté, ne rien faire
        }

        websocketClient = new WebSocket('wss://stream.testnet.binance.vision/ws'); // URL WebSocket - pourrait être configurable

        websocketClient.onopen = () => {
            console.log('Client WebSocket connecté (dashboard.js)');
            reconnectionAttempts = 0;
            dashboardConnectionStatusDiv.textContent = 'Connecté via WebSocket - Flux de données temps réel activé.';
            dashboardConnectionStatusDiv.classList.remove('alert-info', 'alert-danger', 'alert-warning');
            dashboardConnectionStatusDiv.classList.add('alert-primary');
            subscribeToFavorites(); // S'abonner aux favoris dès la connexion WS
        };

        websocketClient.onclose = () => {
            console.log('Client WebSocket déconnecté (dashboard.js)');
            dashboardConnectionStatusDiv.textContent = 'WebSocket déconnecté. Tentative de reconnexion...';
            dashboardConnectionStatusDiv.classList.remove('alert-primary', 'alert-success');
            dashboardConnectionStatusDiv.classList.add('alert-warning');
            reconnectWebSocket(); // Tentative de reconnexion en cas de fermeture
        };

        websocketClient.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.e === '24hrTicker') {
                const symbol = data.s.toUpperCase();
                if (isFavorite(symbol)) { // Utilisation de la fonction de gestion des favoris (définie dans script.js pour l'instant)
                    const priceChangePercent = parseFloat(data.P).toFixed(2);
                    updateCryptoVariationDisplay(symbol, priceChangePercent, data); // Mise à jour de l'affichage des variations
                }
            } else {
                console.debug('Message WebSocket reçu (non-ticker) dans dashboard.js:', data); // Debug pour autres types de messages WS
            }
        };

        websocketClient.onerror = (error) => {
            console.error('Erreur du Client WebSocket (dashboard.js):', error);
            dashboardConnectionStatusDiv.textContent = `Erreur WebSocket: ${error.message}. Tentative de reconnexion...`;
            dashboardConnectionStatusDiv.classList.remove('alert-primary', 'alert-success', 'alert-info');
            dashboardConnectionStatusDiv.classList.add('alert-danger');
            reconnectWebSocket(); // Tentative de reconnexion en cas d'erreur
        };
    };


    // Fonction de reconnexion WebSocket (à déplacer potentiellement dans un service accountService.js)
    function reconnectWebSocket() {
        if (reconnectionAttempts < maxReconnectionAttempts) {
            reconnectionAttempts++;
            dashboardConnectionStatusDiv.textContent = `WebSocket déconnecté. Reconnexion Tentative ${reconnectionAttempts} sur ${maxReconnectionAttempts} dans ${reconnectionDelay / 1000} secondes...`;
            setTimeout(initWebSocket, reconnectionDelay); // Nouvelle tentative de connexion après un délai
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
                return; // Limiter le nombre de lignes dans le tableau (optionnel)
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
                window.displayAssetInfoPage(symbol); // Appel à displayAssetInfoPage (définie dans script.js pour l'instant)
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


    // Fonction pour s'abonner aux flux WebSocket des cryptos favorites (à déplacer potentiellement dans un service accountService.js)
    function subscribeToFavorites() {
        cryptoVariationsTableBody.innerHTML = ''; // Vider le tableau avant de le remplir
        const favorites = window.getFavorites(); // Récupérer les favoris (fonction définie dans script.js pour l'instant)
        const symbolsToSubscribe = favorites.slice(0, 10); // Limiter à 10 favoris pour l'exemple

        if (websocketClient && websocketClient.readyState === WebSocket.OPEN) {
            // Se désabonner de tous les flux d'abord pour éviter les doublons, puis se réabonner
            websocketClient.send(JSON.stringify({ method: 'UNSUBSCRIBE', params: symbolsToSubscribe.map(symbol => `${symbol.toLowerCase()}@ticker`), id: 2 }));

            symbolsToSubscribe.forEach(symbol => {
                websocketClient.send(JSON.stringify({ method: 'SUBSCRIBE', params: [`${symbol.toLowerCase()}@ticker`], id: 1 }));
                console.log(`Subscribed to ${symbol} ticker stream (favorite) (dashboard.js): ${symbol}`);
            });
        }
        // Mettre à jour le tableau même si WebSocket n'est pas encore ouvert (affichage initial avec 0.00%)
        symbolsToSubscribe.forEach(symbol => {
            updateCryptoVariationDisplay(symbol, '0.00', { c: '0.00', P: '1.00' });
        });
    }


    // --- INITIALISATION DU DASHBOARD (SI NECESSAIRE) ---
    console.log("dashboard.js initialisation terminée.");
    // ---  Par exemple :  Appel initial à une fonction pour récupérer les données de balances au chargement du dashboard (si applicable) ---
    // ---  Exemple :  fetchInitialDashboardData();


});