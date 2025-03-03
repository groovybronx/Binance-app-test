// js/components/BalanceTable.js

function BalanceTable(containerElementId) {
    /**
     * Composant BalanceTable pour afficher le tableau des soldes.
     * @param {string} containerElementId - L'ID de l'élément HTML qui contiendra le tableau des balances.
     */
    this.containerId = containerElementId;
    this.container = document.getElementById(containerElementId);

    this.table = null; // On initialisera le table element
    this.tableBody = null; // On initialisera le tbody element
}

BalanceTable.prototype.render = function () {
    /**
     * Méthode pour initialiser et afficher le tableau des balances dans le conteneur.
     */
    if (!this.container) {
        console.error(`BalanceTable: Conteneur HTML avec l'ID "${this.containerId}" non trouvé.`);
        return;
    }

    // --- Création de la structure HTML du tableau dynamiquement ---
    this.table = document.createElement('table');
    this.table.className = 'table table-bordered table-responsive'; // Classes Bootstrap pour le style (adaptez selon vos besoins)
    let thead = document.createElement('thead');
    thead.innerHTML = ``;
    this.table.appendChild(thead);


    this.tableBody = document.createElement('tbody');
    this.table.appendChild(this.tableBody);

    this.container.appendChild(this.table); // Ajouter le tableau créé au conteneur HTML


    console.log("BalanceTable component rendu dans le conteneur:", this.containerId);
};

BalanceTable.prototype.updateBalances = function (balancesData) {
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

export { BalanceTable };