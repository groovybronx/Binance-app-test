const apiForm = document.getElementById('apiForm');
const connectionStatusDiv = document.getElementById('connectionStatus');
const cryptoVariationsContainer = document.getElementById('cryptoVariationsContainer');
const cryptoVariationsTableBody = document.getElementById('cryptoVariationsTableBody');
const symbolsToTrack = []; // Liste des symboles à suivre initialement VIDE
let websocketClient;

// Dashboard Elements
const loginFormContainer = document.getElementById('loginFormContainer');
const dashboardContainer = document.getElementById('dashboard');
const dashboardConnectionStatusDiv = document.getElementById('dashboardConnectionStatus');
const balanceTableBody = document.getElementById('balanceTableBody');
const noBalancesMessage = document.getElementById('noBalancesMessage');
const balancesErrorMessage = document.getElementById('balancesErrorMessage');

// Search Elements
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const searchResultsContainer = document.getElementById('searchResults');

// Asset Info Page Elements
const assetInfoPageContainer = document.getElementById('assetInfoPage');
const assetInfoHeaderElement = document.getElementById('assetInfoHeader');
const assetInfoDetailsContainer = document.getElementById('assetInfoDetails');
const backToDashboardButton = document.getElementById('backToDashboardButton');
const favoriteButton = document.getElementById('favoriteButton'); // Bouton Favoris sur la page d'info actif


let reconnectionAttempts = 0; // Compteur des tentatives de reconnexions
const maxReconnectionAttempts = 5; // Nombre maximal de tentatives de reconnexion
const reconnectionDelay = 3000; // Délai en millisecondes avant de retenter la connexion (3 secondes)


apiForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const apiKey = document.getElementById('apiKey').value;
    const secretKey = document.getElementById('secretKey').value;

    const response = await fetch('/connect', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ apiKey, secretKey })
    });

    const data = await response.json();
    connectionStatusDiv.textContent = data.message;

    if (data.success) {
        connectionStatusDiv.classList.remove('alert-info', 'alert-danger');
        connectionStatusDiv.classList.add('alert-success');

        loginFormContainer.style.display = 'none';
        dashboardContainer.style.display = 'block';
        assetInfoPageContainer.style.display = 'none';
        document.getElementById('searchSection').style.display = 'block';

        displayAccountBalances(data.accountInfo);
        initWebSocket(); // Initialisation (ou restauration) de la connexion WebSocket

    } else {
        connectionStatusDiv.classList.remove('alert-info', 'alert-success');
        connectionStatusDiv.classList.add('alert-danger');
    }
});


function displayAccountBalances(accountInfo) {
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
}

// Gestion des favoris dans le localStorage
function getFavorites() {
    const favorites = localStorage.getItem('favoriteCryptos');
    return favorites ? JSON.parse(favorites) : [];
}

function addFavorite(symbol) {
    let favorites = getFavorites();
    if (!favorites.includes(symbol)) {
        favorites.push(symbol);
        localStorage.setItem('favoriteCryptos', JSON.stringify(favorites));
    }
}

function removeFavorite(symbol) {
    let favorites = getFavorites();
    const index = favorites.indexOf(symbol);
    if (index > -1) {
        favorites.splice(index, 1);
        localStorage.setItem('favoriteCryptos', JSON.stringify(favorites));
    }
}

function isFavorite(symbol) {
    return getFavorites().includes(symbol);
}


function initWebSocket() {
    if (websocketClient && websocketClient.readyState === WebSocket.OPEN) {
        console.log('WebSocket est déjà connecté. Pas besoin de nouvelle connexion.');
        return; // Si déjà connecté, ne rien faire
    }

    websocketClient = new WebSocket('wss://stream.testnet.binance.vision/ws');

    websocketClient.onopen = () => {
        console.log('Client WebSocket connecté');
        reconnectionAttempts = 0; // Réinitialiser le compteur de tentatives de reconnexion en cas de succès
        dashboardConnectionStatusDiv.textContent = 'Connecté via WebSocket - Flux de données temps réel activé.';
        dashboardConnectionStatusDiv.classList.remove('alert-info', 'alert-danger', 'alert-warning');
        dashboardConnectionStatusDiv.classList.add('alert-primary');
        subscribeToFavorites(); // S'abonner aux flux des favoris (et met à jour le tableau)


    };

    websocketClient.onclose = () => {
        console.log('Client WebSocket déconnecté');
        dashboardConnectionStatusDiv.textContent = 'WebSocket déconnecté. Tentative de reconnexion...';
        dashboardConnectionStatusDiv.classList.remove('alert-primary', 'alert-success');
        dashboardConnectionStatusDiv.classList.add('alert-warning');
        reconnectWebSocket();
    };

    websocketClient.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.e === '24hrTicker') {
            const symbol = data.s.toUpperCase(); // Symbol en majuscules pour correspondre aux favoris
            if (isFavorite(symbol)) { // Vérifier si c'est un favori avant d'afficher
                const priceChangePercent = parseFloat(data.P).toFixed(2);
                updateCryptoVariationDisplay(symbol, priceChangePercent, data);
            }
        } else {
            console.debug('Message WebSocket reçu (non-ticker):', data);
        }
    };

    websocketClient.onerror = (error) => {
        console.error('Erreur du Client WebSocket:', error);
        dashboardConnectionStatusDiv.textContent = `Erreur WebSocket: ${error.message}. Tentative de reconnexion...`;
        dashboardConnectionStatusDiv.classList.remove('alert-primary', 'alert-success', 'alert-info');
        dashboardConnectionStatusDiv.classList.add('alert-danger');
        reconnectWebSocket();
    };
}

function reconnectWebSocket() {
    if (reconnectionAttempts < maxReconnectionAttempts) {
        reconnectionAttempts++;
        dashboardConnectionStatusDiv.textContent = `WebSocket déconnecté. Reconnexion Tentative ${reconnectionAttempts} sur ${maxReconnectionAttempts} dans ${reconnectionDelay / 1000} secondes...`;
        setTimeout(initWebSocket, reconnectionDelay); // Tenter de se reconnecter après un délai
    } else {
        dashboardConnectionStatusDiv.textContent = `Échec de la reconnexion WebSocket après ${maxReconnectionAttempts} tentatives. Veuillez rafraîchir la page.`;
        dashboardConnectionStatusDiv.classList.remove('alert-warning', 'alert-primary');
        dashboardConnectionStatusDiv.classList.add('alert-danger');
        console.error(`Reconnexion WebSocket échouée après ${maxReconnectionAttempts} tentatives.`);
    }
}


function updateCryptoVariationDisplay(symbol, priceChangePercent, data) {
    let rowElement = document.getElementById(`crypto-row-${symbol}`);
    let variationCell, priceCell, infoIconCell;

    if (!rowElement) {
        if (cryptoVariationsTableBody.rows.length >= 10) { // Limite à 10 lignes
            return; // Ne pas ajouter de nouvelle ligne si le tableau est plein
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
            displayAssetInfoPage(symbol);
        });
        infoIconCell.appendChild(infoIcon);

    } else {
        variationCell = rowElement.querySelector('.variation-cell');
        priceCell = rowElement.querySelector('.price-cell');
        infoIconCell = rowElement.querySelector('.info-icon-cell');
    }

    variationCell.textContent = `${priceChangePercent}%`;
    updateVariationStyle(variationCell, variationCell.textContent);

    const lastPrice = parseFloat(data.c).toFixed(2);
    priceCell.textContent = `${lastPrice} USDT`;

}

function updateVariationStyle(variationElement, priceChangePercentText) {
    variationElement.classList.remove('positive', 'negative');
    if (parseFloat(priceChangePercentText) > 0) {
        variationElement.classList.add('positive');
    } else if (parseFloat(priceChangePercentText) < 0) {
        variationElement.classList.add('negative');
    }
}

function subscribeToFavorites() {
    cryptoVariationsTableBody.innerHTML = ''; // Vider le tableau avant de le reconstruire
    const favorites = getFavorites();
    const symbolsToSubscribe = favorites.slice(0, 10); // Limiter à 10 favoris pour l'affichage

    if (websocketClient && websocketClient.readyState === WebSocket.OPEN) {
        // Unsubscribe from all first to avoid duplicates, then resubscribe
        websocketClient.send(JSON.stringify({ method: 'UNSUBSCRIBE', params: symbolsToSubscribe.map(symbol => `${symbol.toLowerCase()}@ticker`), id: 2 }));

        symbolsToSubscribe.forEach(symbol => {
            websocketClient.send(JSON.stringify({ method: 'SUBSCRIBE', params: [`${symbol.toLowerCase()}@ticker`], id: 1 }));
            console.log(`Subscribed to ${symbol} ticker stream (favorite)`);
        });
    }
    // Mettre à jour le tableau même si WebSocket n'est pas encore ouvert (pour affichage initial après favoris)
    symbolsToSubscribe.forEach(symbol => {
        updateCryptoVariationDisplay(symbol, '0.00', { c: '0.00' , P: '0.00'}); // Initialiser l'affichage à 0% en attendant les données WebSocket
    });
}


// Recherche de symbole et page d'information sur l'actif
searchButton.addEventListener('click', () => {
    const searchTerm = searchInput.value.trim().toUpperCase();
    if (searchTerm) {
        searchSymbol(searchTerm);
    }
});

searchInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        const searchTerm = searchInput.value.trim().toUpperCase();
        if (searchTerm) {
            searchSymbol(searchTerm);
        }
    }
});


async function searchSymbol(symbol) {
    searchResultsContainer.innerHTML = '';
    try {
        const response = await fetch(`/price?symbol=${symbol}`);
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        const data = await response.json();
        if (data.success && data.price) {
            const listItem = document.createElement('a');
            listItem.href = '#';
            listItem.classList.add('list-group-item', 'list-group-item-action', 'modern-list-group-item');

            const symbolSpan = document.createElement('span');
            symbolSpan.textContent = `${symbol}USDT - Prix actuel: ${parseFloat(data.price).toFixed(2)} USDT`;
            listItem.appendChild(symbolSpan);


            listItem.addEventListener('click', () => {
                displayAssetInfoPage(symbol);
            });
            searchResultsContainer.appendChild(listItem);
        } else {
            searchResultsContainer.innerHTML = '<div class="alert alert-warning modern-alert">Aucun résultat trouvé.</div>';
        }
    } catch (error) {
        console.error("Erreur lors de la recherche de symbole:", error);
        searchResultsContainer.innerHTML = '<div class="alert alert-danger modern-alert">Erreur lors de la recherche.</div>';
    }
}


async function displayAssetInfoPage(symbol) {
    dashboardContainer.style.display = 'none';
    assetInfoPageContainer.style.display = 'block';
    assetInfoHeaderElement.textContent = `Informations sur l'actif ${symbol}USDT`;
    assetInfoDetailsContainer.innerHTML = '<p>Chargement des données...</p>';

    // Mettre à jour l'état du bouton favori
    const isCurrentlyFavorite = isFavorite(symbol);
    favoriteButton.textContent = isCurrentlyFavorite ? 'Retirer des Favoris' : 'Ajouter aux Favoris';
    favoriteButton.classList.remove(isCurrentlyFavorite ? 'btn-primary' : 'btn-warning');
    favoriteButton.classList.add(isCurrentlyFavorite ? 'btn-warning' : 'btn-primary');
    favoriteButton.setAttribute('data-symbol', symbol); // Stocker le symbole sur le bouton


    try {
        const tickerResponse = await fetch(`/24hr-ticker?symbol=${symbol}`);
        if (!tickerResponse.ok) {
            throw new Error(`Erreur HTTP: ${tickerResponse.status}`);
        }
        const tickerData = await tickerResponse.json();

        if (tickerData.success) {
            assetInfoDetailsContainer.innerHTML = `
                    <p><i class="fas fa-fw fa-signature"></i> <strong>Symbole:</strong> <span id="assetSymbol"></span>${tickerData.symbol}</p>
                    <p><i class="fas fa-fw fa-dollar-sign"></i> <strong>Prix actuel:</strong> <span id="assetPrice"></span>${parseFloat(tickerData.lastPrice).toFixed(2)} USDT</p>
                    <p><i class="fas fa-fw fa-chart-line"></i> <strong>Variation (24h):</strong> <span id="assetVariation" class="${getVariationClass(tickerData.priceChangePercent)}">${parseFloat(tickerData.priceChangePercent).toFixed(2)}%</span></p>
                    <p><i class="fas fa-fw fa-arrow-up"></i> <strong>Plus haut (24h):</strong> <span id="assetHigh"></span>${parseFloat(tickerData.highPrice).toFixed(2)} USDT</p>
                    <p><i class="fas fa-fw fa-arrow-down"></i> <strong>Plus bas (24h):</strong> <span id="assetLow"></span>${parseFloat(tickerData.lowPrice).toFixed(2)} USDT</p>
                    <p><i class="fas fa-fw fa-chart-area"></i> <strong>Volume (24h):</strong> <span id="assetVolume"></span>${parseFloat(tickerData.volume).toFixed(2)} ${symbol.substring(0, symbol.indexOf('USDT'))}</p>
                    <p><i class="fas fa-fw fa-chart-pie"></i> <strong>Volume en USDT (24h):</strong> <span id="assetQuoteVolume"></span>${parseFloat(tickerData.quoteVolume).toFixed(2)} USDT</p>
                `;
        } else {
            assetInfoDetailsContainer.innerHTML = `<div class="alert alert-danger modern-alert">Erreur lors de la récupération des données de l'actif. ${tickerData.message ? tickerData.message : 'Veuillez réessayer plus tard.'}</div>`;
        }


    } catch (error) {
        console.error("Erreur lors du chargement des informations de l'actif:", error);
        assetInfoDetailsContainer.innerHTML = '<div class="alert alert-danger modern-alert">Erreur lors du chargement des informations de l\'actif. Veuillez réessayer.</div>';
    }
}

function getVariationClass(priceChangePercent) {
    if (priceChangePercent > 0) {
        return 'value-positive';
    } else if (priceChangePercent < 0) {
        return 'value-negative';
    } else {
        return 'value-neutral';
    }
}

// Gestionnaire d'événement pour le bouton "Retour au Tableau de Bord"
backToDashboardButton.addEventListener('click', () => {
    assetInfoPageContainer.style.display = 'none';
    dashboardContainer.style.display = 'block';
});

// Gestionnaire d'événement pour le bouton "Favoris" sur la page d'info actif
favoriteButton.addEventListener('click', () => {
    const symbol = favoriteButton.getAttribute('data-symbol');
    if (isFavorite(symbol)) {
        removeFavorite(symbol);
        favoriteButton.textContent = 'Ajouter aux Favoris';
        favoriteButton.classList.remove('btn-warning');
        favoriteButton.classList.add('btn-primary');
    } else {
        addFavorite(symbol);
        favoriteButton.textContent = 'Retirer des Favoris';
        favoriteButton.classList.remove('btn-primary');
        favoriteButton.classList.add('btn-warning');
    }
    subscribeToFavorites(); // Mise à jour du tableau après ajout/suppression des favoris
});


// Au chargement initial de la page, abonnez-vous aux favoris (s'il y en a déjà en localStorage)
document.addEventListener('DOMContentLoaded', subscribeToFavorites);