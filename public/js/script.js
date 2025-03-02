console.log("script.js : Script script.js EXÉCUTÉ (rechargement complet ?)"); // AJOUTER CE LOG AU DÉBUT DE SCRIPT.JS
// js/script.js
/*import { BalanceTable } from './components/BalanceTable.js'; // IMPORT BalanceTable COMPONENT
const BalanceTable = document.getElementById('balances');
    new BalanceTable('balances');
    BalanceTable.render(); // Container pour BalanceTable */

document.addEventListener('DOMContentLoaded', function () {
    console.log("script.js chargé et DOMContentLoaded écouté.");

    // --- DECLARATIONS DES ELEMENTS HTML PRINCIPAUX (GARDER CEUX QUI NE SONT PAS SPECIFIQUES AU DASHBOARD) ---
    const dashboardContainer = document.getElementById('dashboard');
    const assetInfoPageContainer = document.getElementById('assetInfoPage');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const searchResultsContainer = document.getElementById('searchResults');
    const searchSection = document.getElementById('searchSection');
    const assetInfoHeaderElement = document.getElementById('assetInfoHeader');
    const assetInfoDetailsContainer = document.getElementById('assetInfoDetailsContainer');
    const backToDashboardButton = document.getElementById('backToDashboardButton'); // Make sure this button exists in dashboard.html
    const favoriteButton = document.getElementById('favoriteButton');
    const searchButtonDashboard = document.getElementById('searchButtonDashboard'); // Bouton "Rechercher un Symbole" du Dashboard
    
    


    // ---  DECLARATION DU COMPOSANT BalanceTable ET INITIALISATION  ---
    // 'balances' doit être l'ID du conteneur div dans dashboard.html
    //const BalanceTable = new BalanceTable('balances'); // Initialiser le composant BalanceTable AVEC l'ID DU CONTAINER
     // RENDER la table (l'affichage initial se fera après la connexion WebSocket et la réception des données)


    // --- FONCTIONS GLOBALES (OU DEPLACER DANS DES SERVICES SI POSSIBLE) ---

    // Gestion des favoris (localStorage) -  Pourrait être déplacé dans un service userPreferenceService.js
    window.getFavorites = function () {
        const favorites = localStorage.getItem('favoriteCryptos');
        return favorites ? JSON.parse(favorites) : [];
    };

    window.addFavorite = function (symbol) {
        let favorites = favorites();
        if (!favorites.includes(symbol)) {
            favorites.push(symbol);
            localStorage.setItem('favoriteCryptos', JSON.stringify(favorites));
        }
    };

    window.removeFavorite = function (symbol) {
        let favorites = favorites();
        const index = favorites.indexOf(symbol);
        if (index > -1) {
            favorites.splice(index, 1);
            localStorage.setItem('favoriteCryptos', JSON.stringify(favorites));
        }
    };

    window.isFavorite = function (symbol) {
        return getFavorites().includes(symbol);
    };


    // Fonction pour mettre à jour le style de variation (positive/negative classes CSS) - Utilaire, pourrait rester ici ou dans un module utils.js
    window.updateVariationStyle = function (variationElement, priceChangePercentText) {
        variationElement.classList.remove('positive', 'negative');
        if (parseFloat(priceChangePercentText) > 0) {
            variationElement.classList.add('positive');
        } else if (parseFloat(priceChangePercentText) < 0) {
            variationElement.classList.add('negative');
        }
    };


    // Fonction displayAssetInfoPage (gestion de l'affichage de la page d'info actif) - Reste dans script.js car gère la navigation entre sections principales
    window.displayAssetInfoPage = async function (symbol) {
        dashboardContainer.style.display = 'none';
        assetInfoPageContainer.style.display = 'block';
        assetInfoHeaderElement.textContent = `Informations sur l'actif ${symbol}USDT`;
        assetInfoDetailsContainer.style.display = 'block'; // Correction : Utiliser style.display pour afficher/cacher

        const isCurrentlyFavorite = isFavorite(symbol);
        favoriteButton.textContent = isCurrentlyFavorite ? 'Retirer des Favoris' : 'Ajouter aux Favoris';
        favoriteButton.classList.remove(isCurrentlyFavorite ? 'btn-primary' : 'btn-warning');
        favoriteButton.classList.add(isCurrentlyFavorite ? 'btn-warning' : 'btn-primary');
        favoriteButton.setAttribute('data-symbol', symbol);


        try {
            const response = await fetch(`/data/24hr-ticker?symbol=${symbol}`); // Appel API REST - Potentiellement déplacer dans accountService
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            const data = await response.json();

            if (data.success) {
                const ticker24hData = data.ticker24hData;
                console.log("script.js: ticker24hData (APRES PARSE JSON):", ticker24hData); // MODIFICATION : message plus précis (script.js)

                const assetDetailSymbolElement = document.getElementById('assetDetailSymbol');
                if (assetDetailSymbolElement) assetDetailSymbolElement.textContent = ticker24hData.symbol;

                const assetDetailPriceElement = document.getElementById('assetDetailPrice');
                if (assetDetailPriceElement) assetDetailPriceElement.textContent = parseFloat(ticker24hData.lastPrice).toFixed(2) + ' USDT';

                const assetDetailVariationElement = document.getElementById('assetDetailVariation');
                if (assetDetailVariationElement) assetDetailVariationElement.textContent = ticker24hData.priceChangePercent + '%';
                updateVariationStyle(assetDetailVariationElement, ticker24hData.priceChangePercent); // APPLIQUER LE STYLE DE VARIATION

                const assetDetailHighElement = document.getElementById('assetDetailHigh');
                if (assetDetailHighElement) assetDetailHighElement.textContent = ticker24hData.highPrice + ' USDT';

                const assetDetailLowElement = document.getElementById('assetDetailLow');
                if (assetDetailLowElement) assetDetailLowElement.textContent = ticker24hData.lowPrice + ' USDT';

                const assetDetailVolumeElement = document.getElementById('assetDetailVolume');
                if (assetDetailVolumeElement) assetDetailVolumeElement.textContent = parseFloat(ticker24hData.volume).toFixed(0) + ' USDT';

                const assetDetailQuoteVolumeElement = document.getElementById('assetDetailQuoteVolume');
                if (assetDetailQuoteVolumeElement) assetDetailQuoteVolumeElement.textContent = parseFloat(ticker24hData.quoteVolume).toFixed(0) + ' USDT';


            } else {
                console.error("script.js: Erreur lors de la récupération des données du ticker 24h depuis le serveur:", data.message); // MODIFICATION : message plus précis (script.js)
                alert("Erreur lors du chargement des informations de l'actif. Veuillez réessayer.");
            }

        } catch (error) {
            console.error("script.js: Erreur lors du chargement des informations de l'actif:", error); // MODIFICATION : message plus précis (script.js)
            const assetInfoDetailsContainerElement = document.getElementById('assetInfoDetails');
            if (assetInfoDetailsContainerElement) {
                assetInfoDetailsContainerElement.innerHTML = '<div class="alert alert-danger modern-alert">Erreur lors du chargement des informations de l actif. Veuillez réessayer.</div>';
            }
        }
    };


    // Fonction de recherche de symbole - Reste dans script.js car gère l'affichage des résultats de recherche et la navigation
    async function searchSymbol(symbol) {
        searchResultsContainer.innerHTML = '';
        try {
            const response = await fetch(`/data/price?symbol=${symbol}`); // Appel API REST - Potentiellement déplacer dans accountService
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            const data = await response.json();
            if (data.success && data.price) {
                const listItem = document.createElement('a');
                listItem.href = '#';
                listItem.classList.add('list-group-item', 'list-group-item-action', 'modern-list-group-item');

                const symbolSpan = document.createElement('span');
                symbolSpan.textContent = `${symbol}USDT - Prix actuel: ${parseFloat(data.price).toFixed(2)} USDT`;
                listItem.appendChild(symbolSpan);


                listItem.addEventListener('click', () => {
                    displayAssetInfoPage(symbol);
                });
                searchResultsContainer.appendChild(listItem);
            } else {
                searchResultsContainer.innerHTML = '<div class="alert alert-warning modern-alert">Aucun résultat trouvé.</div>';
            }
        } catch (error) {
            console.error("script.js: Erreur lors de la recherche de symbole:", error); // MODIFICATION : message plus précis (script.js)
            searchResultsContainer.innerHTML = '<div class="alert alert-danger modern-alert">Erreur lors de la recherche.</div>';
        }
    }


    // ---  GESTIONNAIRES D'EVENEMENTS  ---

    // Gestionnaire d'événement pour le bouton "Retour au Tableau de Bord"
    if (backToDashboardButton) { // Vérifier si l'élément existe avant d'ajouter l'écouteur
        backToDashboardButton.addEventListener('click', () => {
            assetInfoPageContainer.style.display = 'none';
            dashboardContainer.style.display = 'block';
        });
    } else {
        console.error("script.js: backToDashboardButton non trouvé dans le DOM. Vérifiez dashboard.html."); // MODIFICATION : message plus précis (script.js)
    }


    // Gestionnaire d'événement pour le bouton "Favoris" sur la page d'info actif
    if (favoriteButton) { // Vérifier si l'élément existe avant d'ajouter l'écouteur
        favoriteButton.addEventListener('click', () => {
            const symbol = favoriteButton.getAttribute('data-symbol');
            if (isFavorite(symbol)) {
                removeFavorite(symbol);
                favoriteButton.textContent = 'Ajouter aux Favoris';
                favoriteButton.classList.remove('btn-warning');
                favoriteButton.classList.add('btn-primary');
            } else {
                addFavorite(symbol);
                favoriteButton.textContent = 'Retirer des Favoris';
                favoriteButton.classList.remove('btn-primary');
                favoriteButton.classList.add('btn-warning');
            }
            // subscribeToFavorites(); // DEPLACER L'APPEL DE subscribeToFavorites VERS dashboard.js
        });
    } else {
        console.error("script.js: favoriteButton non trouvé dans le DOM. Vérifiez assetInfoPage.html."); // MODIFICATION : message plus précis (script.js)
    }


    // Gestionnaire d'événement pour le bouton "Rechercher un Symbole" du Dashboard
    if (searchButtonDashboard) { // Vérifier si l'élément existe avant d'ajouter l'écouteur
        searchButtonDashboard.addEventListener('click', () => {
            console.log("script.js: Bouton 'Rechercher un Symbole' (Dashboard) cliqué."); // MODIFICATION : message plus précis (script.js)
            if (searchSection) {
                searchSection.style.display = (searchSection.style.display === 'none' || searchSection.style.display === '') ? 'block' : 'none';
            } else {
                console.error("script.js: Section 'searchSection' non trouvée dans le DOM."); // MODIFICATION : message plus précis (script.js)
            }
        });
    } else {
        console.error("script.js: Bouton 'searchButtonDashboard' non trouvé dans le DOM. Vérifiez dashboard.html."); // MODIFICATION : message plus précis (script.js)
    }


    // Gestionnaire d'événement pour le bouton de recherche (formulaire de recherche)
    if (searchButton) { // Vérifier si l'élément existe avant d'ajouter l'écouteur
        searchButton.addEventListener('click', () => {
            const searchTerm = searchInput.value.trim().toUpperCase();
            if (searchTerm) {
                searchSymbol(searchTerm);
            }
        });
    } else {
        console.error("script.js: searchButton non trouvé dans le DOM. Vérifiez dashboard.html."); // MODIFICATION : message plus précis (script.js)
    }


    // Gestionnaire d'événement pour la touche "Enter" dans le champ de recherche
    if (searchInput) { // Vérifier si l'élément existe avant d'ajouter l'écouteur
        searchInput.addEventListener('keyup', (event) => {
            if (event.key === 'Enter') {
                const searchTerm = searchInput.value.trim().toUpperCase();
                if (searchTerm) {
                    searchSymbol(searchTerm);
                }
            }
        });
    } else {
        console.error("script.js: searchInput non trouvé dans le DOM. Vérifiez dashboard.html."); // MODIFICATION : message plus précis (script.js)
    }


    // --- INITIALISATION GENERALE AU CHARGEMENT DE LA PAGE ---
    console.log("script.js initialisation terminée."); // MODIFICATION : message plus précis (script.js)


});