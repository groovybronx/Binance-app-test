import { initDashboard } from './views/dashboardView.js';
import { initAssetInfo } from './views/assetInfoView.js';
import { initWebSocket } from './services/websocketService.js';

document.addEventListener('DOMContentLoaded', () => {
    initWebSocket();
    initDashboard();
    
    // Ajoutez d'autres initialisations si nécessaire
});

// Fonction globale pour afficher la page d'informations sur un actif
window.displayAssetInfoPage = (symbol) => {
    initAssetInfo(symbol);
};