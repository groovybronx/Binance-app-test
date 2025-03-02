console.log("dashboard.js : Script dashboard.js EXÉCUTÉ (rechargement complet ?)"); // AJOUTER CE LOG AU DÉBUT DE DASHBOARD.JS
// js/dashboard/dashboard.js
// --- FONCTIONS DU TABLEAU DE BORD ---
import { TopCryptoMovers } from '../components/TopCryptoMovers.js';
import { BalanceTable } from '../components/BalanceTable.js';
import { DashboardConnectionStatus } from '../components/DashboardConnectionStatus.js'; // <-- AJOUTER CETTE LIGNE



// --- Import des Composants et Services (si nécessaire plus tard) ---
// import { accountService } from '../services/accountService.js'; // Importez accountService ici quand il sera prêt

document.addEventListener('DOMContentLoaded', () => {
    console.log("dashboard.js chargé et DOMContentLoaded écouté.");

    // --- DECLARATIONS DES ELEMENTS HTML DU DASHBOARD
    const dashboardConnectionStatusDiv = document.getElementById('dashboardConnectionStatus');
    const balanceTableBody = document.getElementById('balanceTableBody'); // <-- Déclaration toujours nécessaire pour le constructeur du composant
    const noBalancesMessage = document.getElementById('noBalancesMessage'); // <-- Déclaration toujours nécessaire pour le composant
    const balancesErrorMessage = document.getElementById('balancesErrorMessage'); // <-- Déclaration toujours nécessaire pour le composant
    const cryptoVariationsContainer = document.getElementById('cryptoVariationsContainer');
    const cryptoVariationsTableBody = document.getElementById('cryptoVariationsTableBody');
    const topMoversGainersContainer = document.getElementById('topCryptoMoversContainerGainers');
    const topMoversLosersContainer = document.getElementById('topCryptoMoversContainerLosers');
    const logoutButton = document.getElementById('logoutButton'); // <-- Déclaration du bouton Logout
    const dashboardContainer = document.getElementById('dashboard'); // <-- Déclaration du container dashboard (pour logout)
    const loginFormContainer = document.getElementById('loginFormContainer'); // <-- Déclaration du container loginForm (pour logout)
    const profileButtonsContainer = document.getElementById('profileButtonsContainer'); // <-- Déclaration du container profileButtons (pour logout)
    const accountInfoDiv = document.getElementById('accountInfoDiv'); // <-- Déclaration de accountInfoDiv (pour logout - bien que potentiellement non utilisé ici)
    const accountBalanceDiv = document.getElementById('accountBalanceDiv'); // <-- Déclaration de accountBalanceDiv (pour logout - bien que potentiellement non utilisé ici)
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const searchButtonDashboard = document.getElementById('searchButtonDashboard'); // Bouton "Rechercher un Symbole" du Dashboard



    // --- VARIABLES ET ETATS INTERNES AU DASHBOARD ---
    let websocketClient;
    let reconnectionAttempts = 0;
    const maxReconnectionAttempts = 5;
    const reconnectionDelay = 3000;
    const symbolsToTrack = []; // Pourrait être géré par un service plus tard


    // --- GESTION DU BOUTON DE DECONNEXION ---
    if (logoutButton) {
        logoutButton.addEventListener('click', function () {
            console.log("dashboard.js: Bouton Déconnexion cliqué."); // MODIFICATION : message plus précis (dashboard.js)

            localStorage.removeItem('rememberedProfileName');
            console.log("dashboard.js: Profil mémorisé supprimé de localStorage (Déconnexion)."); // MODIFICATION : message plus précis (dashboard.js)


            if (dashboardContainer) dashboardContainer.style.display = 'none'; // CONDITION pour éviter erreurs si dashboardContainer non trouvé
            if (loginFormContainer) loginFormContainer.style.display = 'block'; // CONDITION pour éviter erreurs si loginFormContainer non trouvé
            if (profileButtonsContainer) profileButtonsContainer.style.display = 'block'; // CONDITION pour éviter erreurs si profileButtonsContainer non trouvé
            console.log("dashboard.js: Tableau de bord caché, formulaire de login et listes de profil affichés."); // MODIFICATION : message plus précis (dashboard.js)


            if (accountInfoDiv && accountBalanceDiv) { // CONDITION pour éviter erreurs si accountInfoDiv/accountBalanceDiv non trouvés
                accountInfoDiv.textContent = '';
                accountBalanceDiv.innerHTML = '';
                console.log("dashboard.js: Infos du compte et solde réinitialisés."); // MODIFICATION : message plus précis (dashboard.js)
            }

            alert("Déconnexion réussie.");
        });
    } else {
        console.error("dashboard.js: Bouton 'logoutButton' non trouvé dans le DOM. Vérifiez l'ID dans dashboard.html."); // MODIFICATION : message plus précis (dashboard.js)
    }



    // --- Composants ---
    let connectionStatusComponent;
    let topCryptoMoversGainersComponent, topCryptoMoversLosersComponent;
    let balanceTableComponent; // <-- Déclarer le composant BalanceTable ici

    // Composant DashboardConnectionStatus (inchangé)
    if (dashboardConnectionStatusDiv) {
        connectionStatusComponent = new DashboardConnectionStatus('dashboardConnectionStatus');
        connectionStatusComponent.render();
    } else {
        console.error("dashboard.js: Conteneur HTML pour DashboardConnectionStatus avec l'ID 'dashboardConnectionStatus' non trouvé dans dashboard.html."); // MODIFICATION : message plus précis (dashboard.js)
    }

    // Composants TopCryptoMovers (inchangés)
    if (topMoversGainersContainer) {
        topCryptoMoversGainersComponent = new TopCryptoMovers('topCryptoMoversContainerGainers');
        topCryptoMoversGainersComponent.render('gainers');
    } else {
        console.error("dashboard.js: Conteneur HTML pour TopCryptoMovers (Gainers) avec l'ID 'topCryptoMoversContainerGainers' non trouvé dans dashboard.html."); // MODIFICATION : message plus précis (dashboard.js)
    }
    if (topMoversLosersContainer) {
        topCryptoMoversLosersComponent = new TopCryptoMovers('topMoversContainerLosers');
        topCryptoMoversLosersComponent.render('losers');
    } else {
        console.error("dashboard.js: Conteneur HTML pour TopCryptoMovers (Losers) avec l'ID 'topMoversContainerLosers' non trouvé dans dashboard.html."); // MODIFICATION : message plus précis (dashboard.js)
    }

    // Composant BalanceTable - INSTANCIATION et RENDER ici :
    if (balanceTableBody) {
        balanceTableComponent = new BalanceTable('balances'); // <-- Instancier le composant BalanceTable AVEC l'ID 'balances' (et non 'balanceTable')
        balanceTableComponent.render(); // <-- Appeler la méthode render (vide pour l'instant)
    } else {
        console.error("dashboard.js: Conteneur HTML pour BalanceTable avec l'ID 'balances' non trouvé dans dashboard.html."); // MODIFICATION : message plus précis (dashboard.js)
    }

    // Fonction pour initialiser la connexion WebSocket (à déplacer potentiellement dans un service accountService.js)
    window.initWebSocket = function () {
        if (websocketClient && websocketClient.readyState === WebSocket.OPEN) {
            console.log('WebSocket est déjà connecté. Pas besoin de nouvelle connexion.');
            return;
        }

        websocketClient = new WebSocket('wss://stream.testnet.binance.vision/ws'); // URL WebSocket - pourrait être configurable

        websocketClient.onopen = () => {
            //console.log('Client WebSocket connecté (dashboard.js)');
            reconnectionAttempts = 0;
            //dashboardConnectionStatusDiv.textContent = 'Connecté via WebSocket - Flux de données temps réel activé.';
            //dashboardConnectionStatusDiv.classList.remove('alert-info', 'alert-danger', 'alert-warning');
            //dashboardConnectionStatusDiv.classList.add('alert-primary');
            connectionStatusComponent.updateStatus('Connecté via WebSocket - Flux de données temps réel activé.', 'alert-primary'); // <-- NOUVEAU CODE : Utilisation du composant
            subscribeToFavorites();
        };

        websocketClient.onclose = () => {
            console.log('Client WebSocket déconnecté (dashboard.js)');
            //dashboardConnectionStatusDiv.textContent = 'WebSocket déconnecté. Tentative de reconnexion...';
            //dashboardConnectionStatusDiv.classList.remove('alert-primary', 'alert-success');
            //dashboardConnectionStatusDiv.classList.add('alert-warning');
            connectionStatusComponent.updateStatus('WebSocket déconnecté. Tentative de reconnexion...', 'alert-warning'); // <-- NOUVEAU CODE : Utilisation du composant
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
            //ashboardConnectionStatusDiv.textContent = `Erreur WebSocket: ${error.message}. Tentative de reconnexion...`;
            //dashboardConnectionStatusDiv.classList.remove('alert-primary', 'alert-success', 'alert-info');
            //dashboardConnectionStatusDiv.classList.add('alert-danger');
            connectionStatusComponent.updateStatus(`Erreur WebSocket: ${error.message}. Tentative de reconnexion...`, 'alert-primary'); // <-- NOUVEAU CODE : Utilisation du composant
            reconnectWebSocket(); // Tentative de reconnexion en cas d'erreur
        };
    };


    // Fonction de reconnexion WebSocket (à déplacer potentiellement dans un service accountService.js)
    function reconnectWebSocket() {
        if (reconnectionAttempts < maxReconnectionAttempts) {
            reconnectionAttempts++;
            //dashboardConnectionStatusDiv.textContent = `WebSocket déconnecté. Reconnexion Tentative ${reconnectionAttempts} sur ${maxReconnectionAttempts} dans ${reconnectionDelay / 1000} secondes...`;
            connectionStatusComponent.updateStatus(`WebSocket déconnecté. Reconnexion Tentative ${reconnectionAttempts} sur ${maxReconnectionAttempts} dans ${reconnectionDelay / 1000} secondes...`, 'alert-warning'); // <-- NOUVEAU CODE : Utilisation du composant
            setTimeout(initWebSocket, reconnectionDelay); // Nouvelle tentative de connexion après un délai
        } else {
            //dashboardConnectionStatusDiv.textContent = `Échec de la reconnexion WebSocket après ${maxReconnectionAttempts} tentatives. Veuillez rafraîchir la page.`;
            //dashboardConnectionStatusDiv.classList.remove('alert-warning', 'alert-primary');
            //dashboardConnectionStatusDiv.classList.add('alert-danger');
            connectionStatusComponent.updateStatus(`Échec de la reconnexion WebSocket après ${maxReconnectionAttempts} tentatives. Veuillez rafraîchir la page.`, 'alert-danger'); // <-- NOUVEAU CODE : Utilisation du composant
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
                console.log(`dashboard.js: Subscribed to ${symbol} ticker stream (favorite): ${symbol}`); // MODIFICATION : message plus précis (dashboard.js)
            });
        }
        // Mettre à jour le tableau même si WebSocket n'est pas encore ouvert (affichage initial avec 0.00%)
        symbolsToSubscribe.forEach(symbol => {
            updateCryptoVariationDisplay(symbol, '0.00', { c: '0.00', P: '1.00' });
        });
    }


    // --- INITIALISATION DU DASHBOARD (SI NECESSAIRE) ---
    console.log("dashboard.js initialisation terminée."); // MODIFICATION : message plus précis (dashboard.js)
    // ---  Par exemple :  Appel initial à une fonction pour récupérer les données de balances au chargement du dashboard (si applicable) ---
    // ---  Exemple :  fetchInitialDashboardData();
    initWebSocket(); // Initialiser la connexion WebSocket au chargement du dashboard


});