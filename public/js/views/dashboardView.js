import { TopCryptoMovers } from '../components/TopCryptoMovers.js';
import * as accountService from '../services/accountService.js';
import * as websocketService from '../services/websocketService.js';

export function initDashboard() {
  console.log('Initialisation du tableau de bord');

  // Récupérer et afficher les informations du compte
  accountService.fetchAccountInfo().then(displayAccountBalances).catch(error => {
    console.error('Erreur lors de la récupération des informations du compte:', error);
    // Add error handling code here
  });

  // Initialiser la connexion WebSocket
  websocketService.initWebSocket();

  // Ajouter des écouteurs d'événements pour les boutons ou autres éléments interactifs du tableau de bord
  setupEventListeners();

  // --- Création et rendu du composant TopCryptoMovers ---
  const topMoversContainer = document.getElementById('topCryptoMoversContainer');
  if (topMoversContainer) {
    const topCryptoMoversComponent = new TopCryptoMovers('topCryptoMoversContainer');
    topCryptoMoversComponent.render();
  } else {
    console.error("Conteneur HTML pour TopCryptoMovers avec l'ID 'topCryptoMoversContainer' non trouvé dans index.html.");
    // Add error handling code here
  }
}

// Ajouter des écouteurs d'événements pour les boutons ou autres éléments interactifs du tableau de bord
function setupEventListeners() {
  // Add event listeners code here
}