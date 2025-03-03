// js/components/TopCryptoMovers.js

/*function TopCryptoMovers(containerElementId) {
    /**
     * Composant TopCryptoMovers pour afficher les 5 plus grandes hausses et baisses de crypto.
     * @param {string} containerElementId - L'ID de l'élément HTML qui contiendra le composant.
     
    this.containerId = containerElementId;
    this.container = document.getElementById(containerElementId);
    this.gainersList = null;  // Pour la liste des plus fortes hausses
    this.losersList = null;   // Pour la liste des plus fortes baisses
}

TopCryptoMovers.prototype.render = async function() {
    if (!this.container) {
        console.error(`TopCryptoMovers: Conteneur HTML avec l'ID "${this.containerId}" non trouvé.`);
        return;
    }

    // Structure HTML de base du composant
    this.container.innerHTML = `
    <div class="top-movers-container">
        <div class="gainers-section top-movers-table">
            <h5>Top 5 Hausse</h5>
            <ul class="list-group gainers-list">
                <li class="list-group-item">Chargement...</li>
            </ul>
        </div>
        <div class="losers-section top-movers-table">
            <h5>Top 5 Baisse</h5>
            <ul class="list-group losers-list">
                <li class="list-group-item">Chargement...</li>
            </ul>
        </div>
    </div>
`;

    this.gainersList = this.container.querySelector('.gainers-list');
    this.losersList = this.container.querySelector('.losers-list');

    try {
        const moversData = await this.fetchTopMovers();
        this.updateDisplay(moversData);
    } catch (error) {
        console.error("Erreur lors de la récupération des Top Crypto Movers:", error);
        this.gainersList.innerHTML = '<li class="list-group-item list-group-item-danger">Erreur de chargement</li>';
        this.losersList.innerHTML = '<li class="list-group-item list-group-item-danger">Erreur de chargement</li>';
    }
};


TopCryptoMovers.prototype.fetchTopMovers = async function() {
    try {
        const response = await fetch('routes/data/24hr-tickers'); // Endpoint pour récupérer les tickers 24h de TOUS les symboles
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        const data = await response.json();
        if (data.success && data.tickers24hData) {
            return data.tickers24hData;
        } else {
            throw new Error("Données tickers 24h non reçues du serveur.");
        }
    } catch (error) {
        console.error("Erreur lors de la récupération des données 24hr-tickers:", error);
        throw error; // Relancer l'erreur pour la gestion dans render()
    }
};


TopCryptoMovers.prototype.updateDisplay = function(tickersData) {
    if (!this.gainersList || !this.losersList) {
        console.error("TopCryptoMovers: listes gainersList ou losersList non initialisées.");
        return;
    }

    // Filtrer pour les paires USDT et convertir priceChangePercent en nombre
    const usdtTickers = tickersData
        .filter(ticker => ticker.symbol.endsWith('USDT'))
        .map(ticker => ({
            symbol: ticker.symbol,
            priceChangePercent: parseFloat(ticker.priceChangePercent)
        }));

    // Trier par variation de prix (décroissant pour les hausses, croissant pour les baisses)
    const sortedByChange = [...usdtTickers].sort((a, b) => b.priceChangePercent - a.priceChangePercent);

    // Séparer les 5 plus fortes hausses et les 5 plus fortes baisses
    const topGainers = sortedByChange.filter(ticker => ticker.priceChangePercent >= 0).slice(0, 10);
    const topLosers = sortedByChange.filter(ticker => ticker.priceChangePercent < 0).slice(-10).reverse(); // .reverse() pour avoir du plus négatif au moins négatif


    this.gainersList.innerHTML = ''; // Vider la liste des hausses
    topGainers.forEach(mover => {
        const listItem = document.createElement('li');
        listItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start'); // Classes Bootstrap pour style
        listItem.innerHTML = `
            <div class="ms-2 me-auto">
                <div class="fw-bold">${mover.symbol}</div>
            </div>
            <span class="badge bg-success rounded-pill">${mover.priceChangePercent.toFixed(2)}%</span>
        `;
        this.gainersList.appendChild(listItem);
    });


    this.losersList.innerHTML = ''; // Vider la liste des baisses
    topLosers.forEach(mover => {
        const listItem = document.createElement('li');
        listItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start'); // Classes Bootstrap pour style
        listItem.innerHTML = `
            <div class="ms-2 me-auto">
                <div class="fw-bold">${mover.symbol}</div>
            </div>
            <span class="badge bg-danger rounded-pill">${mover.priceChangePercent.toFixed(2)}%</span>
        `;
        this.losersList.appendChild(listItem);
    });

    if (topGainers.length === 0) {
        this.gainersList.innerHTML = '<li class="list-group-item">Pas de hausses significatives</li>';
    }
    if (topLosers.length === 0) {
        this.losersList.innerHTML = '<li class="list-group-item">Pas de baisses significatives</li>';
    }
};


export { TopCryptoMovers }; */