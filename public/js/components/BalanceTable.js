// js/components/BalanceTable.js

function BalanceTable(containerElementId) {
    /**
     * Composant BalanceTable pour afficher le tableau des soldes.
     * @param {string} containerElementId - L'ID de l'élément HTML qui contiendra le tableau des balances.
     */
    this.containerId = containerElementId;
    this.container = document.getElementById(containerElementId); // Référence au conteneur HTML
    this.tableBody = null; // On initialisera le tbody plus tard
}

BalanceTable.prototype.render = function() {
    /**
     * Méthode pour initialiser et afficher le tableau des balances dans le conteneur.
     */
    if (!this.container) {
        console.error(`BalanceTable: Conteneur HTML avec l'ID "${this.containerId}" non trouvé.`);
        return;
    }

    // --- Structure HTML du tableau (pour l'instant, on suppose qu'elle existe déjà dans index.html) ---
    // --- On va juste récupérer la référence au tbody ---
    this.tableBody = this.container.querySelector('tbody');
    if (!this.tableBody) {
        console.error(`BalanceTable: Element <tbody> non trouvé dans le conteneur avec l'ID "${this.containerId}".`);
        return;
    }

    console.log("BalanceTable component rendu dans le conteneur:", this.containerId);
};

BalanceTable.prototype.updateBalances = function(balancesData) {
    /**
     * Méthode pour mettre à jour le tableau des balances avec de nouvelles données.
     * @param {Array<Object>} balancesData - Un tableau d'objets représentant les données de balance (ex: [{asset: 'BTC', free: '...', locked: '...'}, ...]).
     */
    if (!this.tableBody) {
        console.error("BalanceTable: tableBody non initialisé. Assurez-vous d'appeler render() en premier.");
        return;
    }

    this.tableBody.innerHTML = ''; // Effacer le contenu actuel du tableau

    if (!balancesData || balancesData.length === 0) {
        this.tableBody.innerHTML = '<tr><td colspan="3">Aucune donnée de balance disponible.</td></tr>'; // Message "Aucune donnée" si balancesData est vide
        return;
    }

    balancesData.forEach(balance => {
        const row = this.tableBody.insertRow(); // Créer une nouvelle ligne <tr> pour chaque balance
        const assetCell = row.insertCell();
        const freeBalanceCell = row.insertCell();
        const lockedBalanceCell = row.insertCell();

        assetCell.textContent = balance.asset;
        freeBalanceCell.textContent = parseFloat(balance.free).toFixed(2);
        lockedBalanceCell.textContent = parseFloat(balance.locked).toFixed(2);
    });
};