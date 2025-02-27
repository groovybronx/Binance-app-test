const apiForm = document.getElementById('apiForm');
const connectionStatusDiv = document.getElementById('connectionStatus');

// Dashboard Elements (ajoutés ici car utilisés dans ce module pour afficher/cacher)
const loginFormContainer = document.getElementById('loginFormContainer');
const searchSection = document.getElementById('searchSection');


apiForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const apiKey = document.getElementById('apiKey').value;
    const secretKey = document.getElementById('secretKey').value;

    const response = await fetch('/auth/connect', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ apiKey, secretKey })
    });

    const data = await response.json();
    connectionStatusDiv.textContent = data.message;

    if (data.success) {
        connectionStatusDiv.classList.remove('alert-info', 'alert-danger');
        connectionStatusDiv.classList.add('alert-success');

        loginFormContainer.style.display = 'none';
        dashboardContainer.style.display = 'block';
        assetInfoPageContainer.style.display = 'none';
        searchSection.style.display = 'block';

        // Fonctions supposées être définies ailleurs (dans script.js)
        if(typeof displayAccountBalances === 'function') {
            displayAccountBalances(data.accountInfo);
        } else {
            console.error("displayAccountBalances n'est pas définie ou n'est pas une fonction.");
        }
        if(typeof initWebSocket === 'function') {
            initWebSocket(); // Initialisation (ou restauration) de la connexion WebSocket
        } else {
            console.error("initWebSocket n'est pas définie ou n'est pas une fonction.");
        }


    } else {
        connectionStatusDiv.classList.remove('alert-info', 'alert-success');
        connectionStatusDiv.classList.add('alert-danger');
    }
});

// Affichage initial - S'assurer que le formulaire de login est visible au démarrage (si souhaité)
document.addEventListener('DOMContentLoaded', () => {
    loginFormContainer.style.display = 'block'; // Afficher le formulaire de login par défaut
    dashboardContainer.style.display = 'none';
    assetInfoPageContainer.style.display = 'none';
    searchSection.style.display = 'none';
});