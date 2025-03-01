// js/components/TopCryptoMovers.js
function TopCryptoMovers(containerElementId) {
    this.containerId = containerElementId;
    this.container = document.getElementById(containerElementId);
    this.listContainer = null; // Conteneur pour la liste (ul)
    this.componentType = null; // 'gainers' ou 'losers' - sera défini lors de render()
}


TopCryptoMovers.prototype.render = function (componentType) { // <-- ACCEPTER 'componentType' comme argument
    if (!this.container) {
        console.error(`TopCryptoMovers: Conteneur HTML avec l'ID "${this.containerId}" non trouvé.`);
        return;
    }

    this.componentType = componentType; // Enregistrer le type de composant ('gainers' ou 'losers')

    // --- Création de la structure HTML de la liste ---
    this.listContainer = document.createElement('ul');
    if (componentType === 'gainers') {
        this.listContainer.className = 'list-group gainers-list'; // Classe spécifique pour les "gainers" si besoin
    } else if (componentType === 'losers') {
        this.listContainer.className = 'list-group losers-list';  // Classe spécifique pour les "losers" si besoin
    } else {
        this.listContainer.className = 'list-group top-movers-list'; // Classe par défaut
    }


    const loadingItem = document.createElement('li');
    loadingItem.className = 'list-group-item';
    loadingItem.textContent = 'Chargement...'; // Message de chargement initial
    this.listContainer.appendChild(loadingItem);
    this.container.appendChild(this.listContainer);

    // Mise à jour du titre (optionnel - si vous voulez un titre différent pour Gainers/Losers dans TopCryptoMovers.js)
    // this.updateTitle(); // Déplacez ou adaptez updateTitle si vous voulez le gérer ici

    console.log(`TopCryptoMovers component (${componentType}) rendu dans le conteneur:`, this.containerId);
};


TopCryptoMovers.prototype.updateMovers = function (moversData) {
    if (!this.listContainer) {
        console.error("TopCryptoMovers: listContainer non initialisé. Assurez-vous d'appeler render() en premier.");
        return;
    }

    this.listContainer.innerHTML = ''; // Effacer le message "Chargement..."

    if (!moversData || moversData.length === 0) {
        const noDataItem = document.createElement('li');
        noDataItem.className = 'list-group-item';
        noDataItem.textContent = 'Aucune donnée disponible.'; // Message si pas de données
        this.listContainer.appendChild(noDataItem);
        return;
    }

    moversData.forEach(mover => {
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item';
        listItem.textContent = `${mover.symbol}  ${mover.percentageChange}%`; // Adaptez l'affichage selon la structure de vos données
        // Vous pourriez ajouter des classes CSS spécifiques ici en fonction de mover.percentageChange (positif/négatif)
        if (parseFloat(mover.percentageChange) > 0 && this.componentType === 'gainers') {
            listItem.classList.add('gainers'); // Classe CSS pour les "gainers" (si vous voulez styliser différemment)
        } else if (parseFloat(mover.percentageChange) < 0 && this.componentType === 'losers') {
            listItem.classList.add('losers');  // Classe CSS pour les "losers"
        }
        this.listContainer.appendChild(listItem);
    });
};


// Fonction pour mettre à jour le titre du composant (optionnel - si vous voulez un titre dynamique géré par TopCryptoMovers.js)

TopCryptoMovers.prototype.updateTitle = function () {
    let titleElement = this.container.querySelector('h3'); // Exemple: chercher un <h3> comme titre dans le conteneur
    if (titleElement) {
        if (this.componentType === 'gainers') {
            titleElement.textContent = 'Top 5 Hausse Cryptos (USDT)';
        } else if (this.componentType === 'losers') {
            titleElement.textContent = 'Top 5 Baisse Cryptos (USDT)';
        } else {
            titleElement.textContent = 'Top Crypto Movers (USDT)'; // Titre par défaut
        }
    }
};



export { TopCryptoMovers };