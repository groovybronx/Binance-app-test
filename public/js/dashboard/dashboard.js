// Import necessary modules and components

import { BalanceTable } from '../components/BalanceTable.js';
import { TopCryptoMovers } from '../components/TopCryptoMovers.js';
import * as accountService from '../services/accountService.js';
import * as websocketService from '../services/websocketService.js';
import * as favoriteService from '../services/favoriteService.js';

// Initialize the dashboard
export function initDashboard() {
  console.log('Initialisation du tableau de bord');

  // Fetch and display account information
  accountService.fetchAccountInfo().then(displayAccountBalances).catch(error => {
    console.error('Erreur lors de la récupération des informations du compte:', error);
    // Add error handling code here
  });

  // Initialize WebSocket connection
  websocketService.initWebSocket();

  // Set up event listeners for interactive elements on the dashboard
  setupEventListeners();

  // Create and render the TopCryptoMovers component
  const topMoversContainer = document.getElementById('topCryptoMoversContainer');
  if (topMoversContainer) {
    const topCryptoMoversComponent = new TopCryptoMovers('topCryptoMoversContainer');
    topCryptoMoversComponent.render();
  } else {
    console.error("Conteneur HTML pour TopCryptoMovers avec l'ID 'topCryptoMoversContainer' non trouvé dans index.html.");
    // Add error handling code here
  }
}

// Set up event listeners for interactive elements on the dashboard
function setupEventListeners() {
  // Get references to interactive elements
  const searchButton = document.getElementById('searchButton');
  const logoutButton = document.getElementById('logoutButton');
  const favoriteButtons = document.querySelectorAll('.favorite-button');

  

  // Add event listeners
  if (searchButton) searchButton.addEventListener('click', handleSearchButtonClick);
  if (logoutButton) logoutButton.addEventListener('click', handleLogoutButtonClick);

  favoriteButtons.forEach(button => {
    button.addEventListener('click', event => {
      handleFavoriteButtonClick(event, button.dataset.symbol);
    });
  });
}

// Event handler functions
function handleSearchButtonClick() {
    const searchInput = document.getElementById('searchInput');
    const symbol = searchInput.value.trim().toUpperCase();
    if (symbol) {
      searchInput.value = '';  // Clear the input field
      displayAssetInfoPage(symbol);
    }
  }

function handleLogoutButtonClick() {
  // Implement logout functionality here
}

function handleFavoriteButtonClick(event, symbol) {
    event.preventDefault();
    if (favoriteService.isFavorite(symbol)) {
      favoriteService.removeFavorite(symbol);
      console.log(`${symbol} retiré des favoris.`);
    } else {
      favoriteService.addFavorite(symbol);
      console.log(`${symbol} ajouté aux favoris.`);
    }
    // Update the UI to reflect the favorite status change
    const button = event.target;
    button.textContent = favoriteService.isFavorite(symbol) ? 'Retirer des favoris' : 'Ajouter aux favoris';
    button.classList.toggle('btn-primary');
    button.classList.toggle('btn-warning');
  }
  

// Display account balances in the dashboard
function displayAccountBalances(accountInfo) {
    // Add code to display account balances using the accountInfo data
    const balanceTableContainer = document.getElementById('balanceTableContainer');
    const noBalancesMessage = document.getElementById('noBalancesMessage');
    const balancesErrorMessage = document.getElementById('balancesErrorMessage');
  
    if (balanceTableContainer) {
      if (accountInfo.balances.length > 0) {
        const balanceTable = new BalanceTable(balanceTableContainer);
        balanceTable.render(accountInfo.balances);
        noBalancesMessage.style.display = 'none';
      } else {
        noBalancesMessage.style.display = 'block';
      }
    } else {
      console.error("Conteneur HTML pour le tableau de soldes avec l'ID 'balanceTableContainer' non trouvé dans index.html.");
      balancesErrorMessage.textContent = 'Erreur lors de l\'affichage des soldes.';
      balancesErrorMessage.style.display = 'block';
    }
  }

// Update the WebSocket connection status in the dashboard
function updateConnectionStatus(isConnected) {
  const connectionStatusElement = document.getElementById('dashboardConnectionStatus');
  if (connectionStatusElement) {
    connectionStatusElement.className = isConnected ? 'alert alert-success' : 'alert alert-danger';
    connectionStatusElement.textContent = isConnected ? 'Connecté' : 'Déconnecté';
  }
}

// Update real-time crypto variations in the dashboard
function updateCryptoVariations(cryptoData) {
    // Add code to update the real-time crypto variations table in the dashboard
    const cryptoVariationsTableBody = document.getElementById('cryptoVariationsTableBody');
    if (cryptoVariationsTableBody) {
      cryptoData.forEach(crypto => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${crypto.symbol}</td>
          <td>${crypto.change24h}%</td>
          <td>${crypto.price} USDT</td>
          <td>
            <button class="btn btn-primary favorite-button" data-symbol="${crypto.symbol}">
              ${favoriteService.isFavorite(crypto.symbol) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            </button>
          </td>
        `;
        cryptoVariationsTableBody.appendChild(row);
      });
    } else {
      console.error("Élément HTML pour le corps de la table des variations des cryptos avec l'ID 'cryptoVariationsTableBody' non trouvé dans index.html.");
      // Add error handling code here
    }
  }
  
  // Display asset information page in the dashboard
  function displayAssetInfoPage(symbol) {
    // Add code to display the asset information page for the given symbol
    const assetInfoContainer = document.getElementById('assetInfoContainer');
    if (assetInfoContainer) {
      assetInfoContainer.innerHTML = `
        <h2>${symbol} Information</h2>
        <p>Chargement des données...</p>
      `;
      // Simulate fetching asset information (replace with actual API call)
      fetchAssetInfo(symbol).then(assetInfo => {
        assetInfoContainer.innerHTML = `
          <h2>${assetInfo.symbol} Information</h2>
          <p>Prix actuel: ${assetInfo.price} USDT</p>
          <p>Changement 24h: ${assetInfo.change24h}%</p>
          <p>Volume 24h: ${assetInfo.volume24h} USDT</p>
          <p>Capitalisation boursière: ${assetInfo.marketCap} USDT</p>
          <button id="toggleFavoriteBtn" class="btn btn-primary">
            ${favoriteService.isFavorite(assetInfo.symbol) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          </button>
        `;
      });
    } else {
      console.error("Conteneur HTML pour l'information sur l'actif avec l'ID 'assetInfoContainer' non trouvé dans index.html.");
      // Add error handling code here
    }
  }