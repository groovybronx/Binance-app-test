// js/dashboard/dashboard.js
// --- TABLEAU DE BORD ---
import { TopCryptoMovers } from '../components/TopCryptoMovers.js';
import { WebsocketService } from '../services/websocketService.js';
import { AccountService } from '../services/accountService.js';
import { favoriteService } from '../services/favoriteService.js';
import { updateVariationCellStyle } from '../utils.js';
import { BalanceTable } from '../components/BalanceTable.js';


// Export the websocketService variable
export let websocketService = null;

//export the init function
export function initDashboard(){
    console.log("dashboard.js chargé et DOMContentLoaded écouté.");
    // --- DECLARATIONS DES ELEMENTS HTML ---
    const dashboardConnectionStatusDiv = document.getElementById('dashboardConnectionStatus');
    const cryptoVariationsTableBody = document.getElementById('cryptoVariationsTableBody');
    const topMoversContainer = document.getElementById('topCryptoMoversContainer');
    const balanceTable = new BalanceTable('balanceTableContainer'); // 'dashboard-header-container' is the container ID
    balanceTable.render(); // Initialiser le composant BalanceTable
    // --- INSTANCES DES SERVICES ---
    const accountService = new AccountService();

    // --- FONCTIONS DE GESTION DES DONNEES ET DE L'AFFICHAGE ---
    /**
     * Affiche les balances du compte dans le tableau.
     * @param {Object} accountInfo - Les informations du compte contenant les balances.
     */
        function displayAccountBalances(accountInfo) {
        console.log("Fonction displayAccountBalances() appelée avec :", accountInfo);
        if (!accountInfo || !accountInfo.balances) {
            console.error("Invalid accountInfo object:", accountInfo);
             return;
        }
        const usdtBalances = accountService.getUsdtBalances(accountInfo);
        balanceTable.updateBalances(usdtBalances)
    }


    /**
     * Met à jour l'affichage des variations de crypto dans le tableau.
     * @param {string} symbol - Le symbole de la crypto.
     * @param {string} priceChangePercent - Le pourcentage de variation de prix.
     * @param {Object} data - L'objet de données du message WebSocket.
     */
    function updateCryptoVariationDisplay(symbol, priceChangePercent, data) {
        let rowElement = document.getElementById(`crypto-row-${symbol}`);
        let variationCell, priceCell, infoIconCell;

        if (!rowElement) {
            if (cryptoVariationsTableBody.rows.length >= 10) {
                return; // Limite le nombre de lignes dans le tableau
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
        }

        updateVariationCellStyle(variationCell, priceChangePercent);
        const lastPrice = parseFloat(data.c).toFixed(2);
        priceCell.textContent = `${lastPrice} USDT`;
    }

    // --- GESTION DES EVENEMENTS WEBSOCKET ---
    /**
     * Gère les messages reçus par le WebSocket.
     * @param {Object} event - L'événement de message WebSocket.
     */
    function handleWebsocketMessage(event) {
        const data = JSON.parse(event.data);
        if (data.e === '24hrTicker') {
            const symbol = data.s.toUpperCase();
            if (favoriteService.isFavorite(symbol)) {
                const priceChangePercent = parseFloat(data.P).toFixed(2);
                updateCryptoVariationDisplay(symbol, priceChangePercent, data);
            }
        } else {
            console.debug('Message WebSocket reçu (non-ticker):', data);
        }
    }

    /**
     * Gère les erreurs du WebSocket.
     * @param {Error} error - L'erreur WebSocket.
     */
    function handleWebsocketError(error) {
        dashboardConnectionStatusDiv.textContent = `Erreur WebSocket: ${error.message}. Tentative de reconnexion...`;
        dashboardConnectionStatusDiv.classList.remove('alert-primary', 'alert-success', 'alert-info');
        dashboardConnectionStatusDiv.classList.add('alert-danger');
    }

    /**
     * Gère l'ouverture de la connexion WebSocket.
     */
    function handleWebsocketOpen() {
        dashboardConnectionStatusDiv.textContent = 'Connecté via WebSocket - Flux de données temps réel activé.';
        dashboardConnectionStatusDiv.classList.remove('alert-info', 'alert-danger', 'alert-warning');
        dashboardConnectionStatusDiv.classList.add('alert-primary');
        subscribeToFavorites();
    }

    /**
     * Gère la fermeture de la connexion WebSocket.
     */
    function handleWebsocketClose() {
        dashboardConnectionStatusDiv.textContent = 'WebSocket déconnecté. Tentative de reconnexion...';
        dashboardConnectionStatusDiv.classList.remove('alert-primary', 'alert-success');
        dashboardConnectionStatusDiv.classList.add('alert-warning');
    }

    /**
     * S'abonne aux flux WebSocket pour les cryptos favorites.
     */
    function subscribeToFavorites() {
        cryptoVariationsTableBody.innerHTML = ''; // Clear the table before populating
        const favorites = favoriteService.getLimitedFavorites();

        // Unsubscribe from all streams first to avoid duplicates, then resubscribe
        websocketService.unsubscribeFromSymbols(favorites);

        favorites.forEach(symbol => {
            websocketService.subscribeToSymbols([symbol]);
            console.log(`Subscribed to ${symbol} ticker stream (favorite) : ${symbol}`);
        });
        // Update the table even if WebSocket is not yet open (initial display with 0.00%)
        favorites.forEach(symbol => {
            updateCryptoVariationDisplay(symbol, '0.00', { c: '0.00', P: '1.00' });
        });
    }

    // --- INITIALISATION WEBSOCKET ---
    websocketService = new WebsocketService(
        dashboardConnectionStatusDiv,
        handleWebsocketMessage,
        handleWebsocketError,
        handleWebsocketOpen,
        handleWebsocketClose
    );
    websocketService.initWebSocket();

   /**
    * Fetches account data and displays it.
    */
    async function fetchAccountDataAndDisplay() {
        try {
            const response = await fetch('/auth/account'); // API call to your server
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if(data.success){
                displayAccountBalances(data.accountInfo);
            } else {
                balanceTable.displayErrorMessage(data.message);
                console.error("Error fetching account data:", data.message);
              }
        } catch (error) {
            balanceTable.displayErrorMessage('Error fetching account data');
            console.error("Error fetching account data:", error);
        }
        
    }

    // --- GESTION DU COMPOSANT TOPCRYPTOMOVERS ---
    if (topMoversContainer) {
        const topCryptoMoversComponent = new TopCryptoMovers(topMoversContainer.id);
        topCryptoMoversComponent.render();
    } else {
        console.error(`Conteneur HTML pour TopCryptoMovers avec l'ID '${topMoversContainer.id}' non trouvé.`);
    }

    //no more mock data here
}

document.addEventListener('DOMContentLoaded',initDashboard);
