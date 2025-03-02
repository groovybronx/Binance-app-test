// js/components/BalanceTable.js
export class BalanceTable {
    constructor(containerId) {
        this.tableContainer = document.getElementById(containerId);
        if (!this.tableContainer) {
            console.error(`Conteneur BalanceTable avec l'ID '${containerId}' non trouvé.`);
            return;
        }
        this.tableBody = this.tableContainer.querySelector('tbody'); // Sélectionner le tbody
        this.noBalancesMessage = document.getElementById('noBalancesMessage'); // Supposant que ces messages sont hors du composant, mais accessibles
        this.balancesErrorMessage = document.getElementById('balancesErrorMessage'); // Idem

        if (!this.tableBody) {
            console.error("Element <tbody> non trouvé dans le conteneur BalanceTable.");
            return;
        }
    }

    render() {
        // Initialisation vide pour l'instant, l'affichage sera mis à jour via updateBalances
    }

    clearBalances() {
        this.tableBody.innerHTML = ''; // Vider le contenu du tableau
    }

    displayBalances(balances) {
        if (!balances || balances.length === 0) {
            this.showNoBalancesMessage();
            return;
        }

        this.hideMessages(); // S'assurer que les messages d'erreur/vide sont cachés
        this.clearBalances(); // Préparer le tableau en vidant son contenu

        balances.forEach(balance => {
            const row = this.tableBody.insertRow();
            const assetCell = row.insertCell();
            const freeBalanceCell = row.insertCell();
            const lockedBalanceCell = row.insertCell();

            assetCell.textContent = balance.asset;
            freeBalanceCell.textContent = parseFloat(balance.free).toFixed(2);
            lockedBalanceCell.textContent = parseFloat(balance.locked).toFixed(2);
        });
    }

    showNoBalancesMessage() {
        if (this.noBalancesMessage) {
            this.noBalancesMessage.style.display = 'block';
        }
        this.clearBalances(); // S'assurer que le tableau est vide
    }

    showBalancesErrorMessage() {
        if (this.balancesErrorMessage) {
            this.balancesErrorMessage.style.display = 'block';
        }
        this.clearBalances(); // S'assurer que le tableau est vide
    }

    hideMessages() {
        if (this.noBalancesMessage) {
            this.noBalancesMessage.style.display = 'none';
        }
        if (this.balancesErrorMessage) {
            this.balancesErrorMessage.style.display = 'none';
        }
    }
}