const dashboardContainer = document.getElementById('dashboard');

const assetInfoPageContainer = document.getElementById('assetInfoPage');



document.addEventListener('DOMContentLoaded', function () {



// Dashboard Elements

const dashboardConnectionStatusDiv = document.getElementById('dashboardConnectionStatus');

const balanceTableBody = document.getElementById('balanceTableBody');

const noBalancesMessage = document.getElementById('noBalancesMessage');

const balancesErrorMessage = document.getElementById('balancesErrorMessage');

const cryptoVariationsContainer = document.getElementById('cryptoVariationsContainer');

const cryptoVariationsTableBody = document.getElementById('cryptoVariationsTableBody');



// Search Elements

const searchInput = document.getElementById('searchInput');

const searchButton = document.getElementById('searchButton');

const searchResultsContainer = document.getElementById('searchResults');



// Asset Info Page Elements

const assetInfoHeaderElement = document.getElementById('assetInfoHeader');

const assetInfoDetailsContainer = document.getElementById('assetInfoDetailsContainer'); // ID CORRECT : assetInfoDetailsContainer

const backToDashboardButton = document.getElementById('backToDashboardButton');

//const favoriteButton = document.getElementById('favoriteButton'); // Bouton Favoris sur la page d'info actif





const symbolsToTrack = [];

let websocketClient;

let reconnectionAttempts = 0;

const maxReconnectionAttempts = 5;

const reconnectionDelay = 3000;





displayAccountBalances = function (accountInfo) {

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





initWebSocket = function () {

if (websocketClient && websocketClient.readyState === WebSocket.OPEN) {

console.log('WebSocket est déjà connecté. Pas besoin de nouvelle connexion.');

return; // Si déjà connecté, ne rien faire

}



websocketClient = new WebSocket('wss://stream.testnet.binance.vision/ws');



websocketClient.onopen = () => {

console.log('Client WebSocket connecté');

reconnectionAttempts = 0;

dashboardConnectionStatusDiv.textContent = 'Connecté via WebSocket - Flux de données temps réel activé.';

dashboardConnectionStatusDiv.classList.remove('alert-info', 'alert-danger', 'alert-warning');

dashboardConnectionStatusDiv.classList.add('alert-primary');

subscribeToFavorites();



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

const symbol = data.s.toUpperCase();

if (isFavorite(symbol)) {

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

setTimeout(initWebSocket, reconnectionDelay);

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

} else {

return 'value-neutral';

}

}



function subscribeToFavorites() {

cryptoVariationsTableBody.innerHTML = '';

const favorites = getFavorites();

const symbolsToSubscribe = favorites.slice(0, 10);



if (websocketClient && websocketClient.readyState === WebSocket.OPEN) {

// Unsubscribe from all first to avoid duplicates, then resubscribe

websocketClient.send(JSON.stringify({ method: 'UNSUBSCRIBE', params: symbolsToSubscribe.map(symbol => `${symbol.toLowerCase()}@ticker`), id: 2 }));



symbolsToSubscribe.forEach(symbol => {

websocketClient.send(JSON.stringify({ method: 'SUBSCRIBE', params: [`${symbol.toLowerCase()}@ticker`], id: 1 }));

console.log(`Subscribed to ${symbol} ticker stream (favorite)`);

});

}

// Mettre à jour le tableau même si WebSocket n'est pas encore ouvert

symbolsToSubscribe.forEach(symbol => {

updateCryptoVariationDisplay(symbol, '0.00', { c: '0.00', P: '0.00' });

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

const response = await fetch(`/data/price?symbol=${symbol}`);

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





displayAssetInfoPage = async function (symbol) {

dashboardContainer.style.display = 'none';

assetInfoPageContainer.style.display = 'block';

assetInfoHeaderElement.textContent = `Informations sur l'actif ${symbol}USDT`;

assetInfoDetailsContainer.display = 'block';


/* Mettre à jour l'état du bouton favori (reste inchangé)

const isCurrentlyFavorite = isFavorite(symbol);

favoriteButton.textContent = isCurrentlyFavorite ? 'Retirer des Favoris' : 'Ajouter aux Favoris';

favoriteButton.classList.remove(isCurrentlyFavorite ? 'btn-primary' : 'btn-warning');

favoriteButton.classList.add(isCurrentlyFavorite ? 'btn-warning' : 'btn-primary');

favoriteButton.setAttribute('data-symbol', symbol); */


try {

const response = await fetch(`/data/24hr-ticker?symbol=${symbol}`);

if (!response.ok) {

throw new Error(`Erreur HTTP: ${response.status}`);

}

const data = await response.json();


if (data.success) {

const ticker24hData = data.ticker24hData;

console.log("ticker24hData (APRES PARSE JSON):", ticker24hData);


// -- Mise à jour de TOUTES les informations avec document.getElementById et textContent --


const assetDetailSymbolElement = document.getElementById('assetDetailSymbol');

if (assetDetailSymbolElement) assetDetailSymbolElement.textContent = ticker24hData.symbol;


const assetDetailPriceElement = document.getElementById('assetDetailPrice');

if (assetDetailPriceElement) assetDetailPriceElement.textContent = parseFloat(ticker24hData.lastPrice).toFixed(2) + ' USDT';


const assetDetailVariationElement = document.getElementById('assetDetailVariation');

if (assetDetailVariationElement) assetDetailVariationElement.textContent = ticker24hData.priceChangePercent + '%';


const assetDetailHighElement = document.getElementById('assetDetailHigh');

if (assetDetailHighElement) assetDetailHighElement.textContent = ticker24hData.highPrice + ' USDT';


const assetDetailLowElement = document.getElementById('assetDetailLow');

if (assetDetailLowElement) assetDetailLowElement.textContent = ticker24hData.lowPrice + ' USDT';


const assetDetailVolumeElement = document.getElementById('assetDetailVolume');

if (assetDetailVolumeElement) assetDetailVolumeElement.textContent = parseFloat(ticker24hData.volume).toFixed(0);


const assetDetailQuoteVolumeElement = document.getElementById('assetDetailQuoteVolume');

if (assetDetailQuoteVolumeElement) assetDetailQuoteVolumeElement.textContent = parseFloat(ticker24hData.quoteVolume).toFixed(0) + ' USDT';




} else {

// Gestion d'erreur (inchangée)

console.error("Erreur lors de la récupération des données du ticker 24h depuis le serveur:", data.message);

alert("Erreur lors du chargement des informations de l'actif. Veuillez réessayer.");

}


} catch (error) {

// Gestion des erreurs (inchangée)

console.error("Erreur lors du chargement des informations de l'actif:", error);

const assetInfoDetailsContainerElement = document.getElementById('assetInfoDetails');

if (assetInfoDetailsContainerElement) {

assetInfoDetailsContainerElement.innerHTML = '<div class="alert alert-danger modern-alert">Erreur lors du chargement des informations de l actif. Veuillez réessayer.</div>';

}

}

}

// Gestionnaire d'événement pour le bouton "Retour au Tableau de Bord"

backToDashboardButton.addEventListener('click', () => {

assetInfoPageContainer.style.display = 'none';

dashboardContainer.style.display = 'block';

});



/*Gestionnaire d'événement pour le bouton "Favoris" sur la page d'info actif

favoriteButton.addEventListener('click', () => {

const symbol = favoriteButton.getAttribute('data-symbol');

if (isFavorite(symbol)) {

removeFavorite(symbol);

favoriteButton.textContent = 'Ajouter aux Favoris'; // Correction du texte ici aussi pour cohérence

favoriteButton.classList.remove('btn-warning');

favoriteButton.classList.add('btn-primary');

} else {

addFavorite(symbol);

favoriteButton.textContent = 'Retirer des Favoris'; // Correction du texte ici aussi pour cohérence

favoriteButton.classList.remove('btn-primary');

favoriteButton.classList.add('btn-warning');

}

subscribeToFavorites();

});*/





// Au chargement initial de la page, abonnez-vous aux favoris

document.addEventListener('DOMContentLoaded', subscribeToFavorites);

}); // END OF DOMContentLoaded EVENT LISTENER