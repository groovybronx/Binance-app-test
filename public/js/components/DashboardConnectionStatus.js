// js/components/DashboardConnectionStatus.js
export class DashboardConnectionStatus {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Conteneur pour DashboardConnectionStatus avec l'ID '${containerId}' non trouvé.`);
            return; // Arrêter l'initialisation si le conteneur n'existe pas
        }
    }

    render() {
        // Pour l'instant, la méthode render peut être vide car le conteneur existe déjà dans index.html
        // Nous mettrons à jour son contenu dynamiquement plus tard
    }

    updateStatus(message, statusClass) {
        if (this.container) {
            this.container.textContent = message;
            this.container.className = 'dashboard-connection-status alert ' + statusClass; // Réinitialise et ajoute les classes
        }
    }
}