const apiForm = document.getElementById('apiForm');
const connectionStatusDiv = document.getElementById('connectionStatus');
const cryptoVariationsContainer = document.getElementById('cryptoVariationsContainer');
const cryptoVariationsTableBody = document.getElementById('cryptoVariationsTableBody');
const symbolsToTrack = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'XRPUSDT', 'ADAUSDT'];
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
const backToDashboardButton = document.getElementById('backToDashboardButton'); // **NOUVEAU : Référence au bouton "Retour"**


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
        assetInfoPageContainer.style.display = 'none'; // S'assurer que la page d'info est cachée

        displayAccountBalances(data.accountInfo);
        initWebSocket();

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


function initWebSocket() {
    websocketClient = new WebSocket('wss://stream.testnet.binance.vision/ws');

    websocketClient.onopen = () => {
        console.log('WebSocket Client Connected');
        symbolsToTrack.forEach(symbol => {
            websocketClient.send(JSON.stringify({ method: 'SUBSCRIBE', params: [`${symbol.toLowerCase()}@ticker`], id: 1 }));
            console.log(`Subscribed to ${symbol} ticker stream`);
        });
        dashboardConnectionStatusDiv.textContent = 'Connecté via WebSocket - Flux de données temps réel activé.';
        dashboardConnectionStatusDiv.classList.remove('alert-info', 'alert-danger', 'alert-success');
        dashboardConnectionStatusDiv.classList.add('alert-primary');
    };

    websocketClient.onclose = () => {
        console.log('WebSocket Client Disconnected');
        dashboardConnectionStatusDiv.textContent = 'WebSocket déconnecté.';
        dashboardConnectionStatusDiv.classList.remove('alert-primary', 'alert-success');
        dashboardConnectionStatusDiv.classList.add('alert-info');
    };

    websocketClient.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.e === '24hrTicker') { // CONDITION CORRECTE : '24hrTicker'
            const symbol = data.s;
            const priceChangePercent = parseFloat(data.P).toFixed(2);
            updateCryptoVariationDisplay(symbol.toUpperCase(), priceChangePercent, data); // Passer data à updateCryptoVariationDisplay
        } else {
            console.debug('Message WebSocket reçu (non-ticker):', data);
        }
    };

    websocketClient.onerror = (error) => {
        console.error('WebSocket Client Error:', error);
        dashboardConnectionStatusDiv.textContent = 'Erreur WebSocket. Voir la console pour plus de détails.';
        dashboardConnectionStatusDiv.classList.remove('alert-primary', 'alert-success', 'alert-info');
        dashboardConnectionStatusDiv.classList.add('alert-danger');
    };
}

function updateCryptoVariationDisplay(symbol, priceChangePercent, data) {
    // **NOUVEAU : Cibler la ligne du tableau (<tr>) par symbole (si elle existe déjà)**
    let rowElement = document.getElementById(`crypto-row-${symbol}`);
    let variationCell, priceCell, infoIconCell; // **NOUVEAU : Déclarer infoIconCell**

    if (!rowElement) {
        // **NOUVEAU : Créer une nouvelle ligne (<tr>) si elle n'existe pas**
        rowElement = cryptoVariationsTableBody.insertRow();
        rowElement.id = `crypto-row-${symbol}`;

        // **NOUVEAU : Créer les cellules (<td>) pour chaque colonne, y compris la nouvelle pour l'icône**
        let symbolCell = rowElement.insertCell();
        variationCell = rowElement.insertCell();
        priceCell = rowElement.insertCell();
        infoIconCell = rowElement.insertCell(); // **NOUVEAU : Cellule pour l'icône**

        symbolCell.textContent = symbol;
        symbolCell.classList.add('symbol-cell');
        variationCell.classList.add('variation-cell');
        priceCell.classList.add('price-cell');
        infoIconCell.classList.add('info-icon-cell'); // **NOUVEAU : Classe pour la cellule d'icône**


        // **NOUVEAU : Créer l'icône "œil" (SPAN)**
        const infoIcon = document.createElement('span');
        infoIcon.textContent = '👁'; // Caractère Unicode pour l'icône "œil"
        infoIcon.classList.add('info-icon'); // Classe CSS pour styliser l'icône
        infoIcon.style.cursor = 'pointer'; // Indiquer que c'est cliquable
        infoIcon.title = 'Voir les informations détaillées'; // Tooltip au survol
        infoIcon.addEventListener('click', () => { // Gestionnaire d'événement au clic
            displayAssetInfoPage(symbol); // Appeler displayAssetInfoPage avec le symbole
        });
        infoIconCell.appendChild(infoIcon); // Ajouter l'icône à la cellule de l'icône

    } else {
        // **NOUVEAU : Si la ligne existe déjà, cibler les cellules existantes, y compris celle de l'icône**
        variationCell = rowElement.querySelector('.variation-cell');
        priceCell = rowElement.querySelector('.price-cell');
        infoIconCell = rowElement.querySelector('.info-icon-cell'); // **NOUVEAU : Cibler la cellule de l'icône**
    }

    variationCell.textContent = `${priceChangePercent}%`;
    updateVariationStyle(variationCell, priceChangePercent);

    const lastPrice = parseFloat(data.c).toFixed(2);
    priceCell.textContent = `${lastPrice} USDT`;

}

function updateVariationStyle(variationElement, priceChangePercent) {
    variationElement.classList.remove('positive', 'negative');
    if (priceChangePercent > 0) {
        variationElement.classList.add('positive');
    } else if (priceChangePercent < 0) {
        variationElement.classList.add('negative');
    }
}


// ======= Recherche de symbole et page d'information =======
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
            listItem.classList.add('list-group-item', 'list-group-item-action');

            const symbolSpan = document.createElement('span');
            symbolSpan.textContent = `${symbol}USDT - Prix actuel: ${parseFloat(data.price).toFixed(2)} USDT`;
            listItem.appendChild(symbolSpan);


            listItem.addEventListener('click', () => {
                displayAssetInfoPage(symbol);
            });
            searchResultsContainer.appendChild(listItem);
        } else {
            searchResultsContainer.innerHTML = '<div class="alert alert-warning">Aucun résultat trouvé.</div>';
        }
    } catch (error) {
        console.error("Erreur lors de la recherche de symbole:", error);
        searchResultsContainer.innerHTML = '<div class="alert alert-danger">Erreur lors de la recherche.</div>';
    }
}


async function displayAssetInfoPage(symbol) {
    dashboardContainer.style.display = 'none';
    assetInfoPageContainer.style.display = 'block';
    assetInfoHeaderElement.textContent = `Informations sur l'actif ${symbol}USDT`;
    assetInfoDetailsContainer.innerHTML = '<p>Chargement des données...</p>';

    try {
        const tickerResponse = await fetch(`/24hr-ticker?symbol=${symbol}`);
        if (!tickerResponse.ok) {
            throw new Error(`Erreur HTTP: ${tickerResponse.status}`);
        }
        const tickerData = await tickerResponse.json();

        if (tickerData.success) {
            assetInfoDetailsContainer.innerHTML = `
                    <p><strong>Symbole:</strong> ${tickerData.symbol}</p>
                    <p><strong>Prix actuel:</strong> ${parseFloat(tickerData.lastPrice).toFixed(2)} USDT</p>
                    <p><strong>Variation (24h):</strong> <span class="${getVariationClass(tickerData.priceChangePercent)}">${parseFloat(tickerData.priceChangePercent).toFixed(2)}%</span></p>
                    <p><strong>Plus haut (24h):</strong> ${parseFloat(tickerData.highPrice).toFixed(2)} USDT</p>
                    <p><strong>Plus bas (24h):</strong> ${parseFloat(tickerData.lowPrice).toFixed(2)} USDT</p>
                    <p><strong>Volume (24h):</strong> ${parseFloat(tickerData.volume).toFixed(2)} ${symbol.substring(0, symbol.indexOf('USDT'))}</p>
                    <p><strong>Volume en USDT (24h):</strong> ${parseFloat(tickerData.quoteVolume).toFixed(2)} USDT</p>
                `;
        } else {
            assetInfoDetailsContainer.innerHTML = `<div class="alert alert-danger">Erreur lors de la récupération des données de l'actif. ${tickerData.message ? tickerData.message : 'Veuillez réessayer plus tard.'}</div>`;
        }


    } catch (error) {
        console.error("Erreur lors du chargement des informations de l'actif:", error);
        assetInfoDetailsContainer.innerHTML = '<div class="alert alert-danger">Erreur lors du chargement des informations de l\'actif. Veuillez réessayer.</div>';
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

// **NOUVEAU : Gestionnaire d'événement pour le bouton "Retour au Tableau de Bord"**
backToDashboardButton.addEventListener('click', () => {
    assetInfoPageContainer.style.display = 'none'; // Cacher la page d'info
    dashboardContainer.style.display = 'block';     // Afficher le dashboard
});