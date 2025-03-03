import { formatNumber } from '../utils/helpers.js';
import { favoriteService } from '../services/favoriteService.js';
export function initAssetInfo(symbol) {
    console.log(`Initialisation de la vue d'information pour ${symbol}`);

    // Simuler le chargement des données (à remplacer par un vrai appel API)
    fetchAssetInfo(symbol).then(displayAssetInfo);

    setupEventListeners(symbol);
}

async function fetchAssetInfo(symbol) {
    // Simuler un appel API (à remplacer par un vrai appel à votre backend)
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                symbol: symbol,
                price: Math.random() * 1000,
                change24h: (Math.random() - 0.5) * 10,
                volume24h: Math.random() * 1000000,
                marketCap: Math.random() * 1000000000
            });
        }, 500);
    });
}

function displayAssetInfo(assetInfo) {
    const container = document.getElementById('assetInfoContainer');
    if (!container) return;

    container.innerHTML = `
        <h2>${assetInfo.symbol} Information</h2>
        <p>Prix actuel: ${formatNumber(assetInfo.price)} USDT</p>
        <p>Changement 24h: ${formatNumber(assetInfo.change24h)}%</p>
        <p>Volume 24h: ${formatNumber(assetInfo.volume24h)} USDT</p>
        <p>Capitalisation boursière: ${formatNumber(assetInfo.marketCap)} USDT</p>
        <button id="toggleFavoriteBtn" class="btn btn-primary">
            ${favoriteService.isFavorite(assetInfo.symbol) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        </button>
    `;
}

function setupEventListeners(symbol) {
    document.addEventListener('click', function(event) {
        if (event.target && event.target.id === 'toggleFavoriteBtn') {
            toggleFavorite(symbol);
        }
    });
}

function toggleFavorite(symbol) {
    if (favoriteService.isFavorite(symbol)) {
        favoriteService.removeFavorite(symbol);
    } else {
        favoriteService.addFavorite(symbol);
    }
    // Mettre à jour le bouton
    const btn = document.getElementById('toggleFavoriteBtn');
    if (btn) {
        btn.textContent = favoriteService.isFavorite(symbol) ? 'Retirer des favoris' : 'Ajouter aux favoris';
    }
}