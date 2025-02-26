// script.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Gestion de la connexion WebSocket (début) ---
    const connectionStatus = document.getElementById('connection-status');
    let websocket;

    function setupWebSocket() {
        // **URL WebSocket CORRECTE pour le Testnet Binance - Flux de données publiques (Ticker) :**
        // **IMPORTANT : Ceci *n'est PAS* votre serveur local (localhost:3000).**
        // **C'est l'URL du serveur WebSocket de Binance Testnet.**
        websocket = new WebSocket('wss://testnet.binance.vision/ws-api/v3');


        websocket.onopen = () => {
            console.log('WebSocket connecté à Binance Testnet');
            connectionStatus.textContent = 'Connecté via WebSocket à Binance Testnet - Flux de données temps réel activé.';
            connectionStatus.className = 'connection-status connected'; // Mise à jour de la classe pour le style vert

            // **IMPORTANT : Souscription aux flux de tickers 24h pour les symboles suivis :**
            // **Utiliser la méthode "ticker.24hr" pour le flux de ticker 24h (selon documentation Binance API)**
            symbolsToTrack.forEach(symbol => {
                const subscribeMessage = {
                    "id": 1,
                    "type": "subscribe",
                    "symbol": symbol.toUpperCase() // **IMPORTANT : Symboles en MAJUSCULES pour WebSocket Binance**
                };
                websocket.send(JSON.stringify(subscribeMessage));
                console.log(`[WebSocket] Souscription au ticker 24h pour ${symbol}`);
            });
        };


        websocket.onclose = () => {
            console.log('WebSocket déconnecté de Binance Testnet');
            connectionStatus.textContent = 'Non connecté - Flux de données temps réel désactivé (WebSocket Binance Testnet).';
            connectionStatus.className = 'connection-status disconnected'; // Mise à jour de la classe pour le style rouge
            // Tentative de reconnexion après 9.5 secondes
            setTimeout(setupWebSocket, 9500);
        };

        websocket.onerror = (error) => {
            console.error('WebSocket erreur:', error);
            connectionStatus.textContent = 'Erreur WebSocket - Flux de données temps réel désactivé (WebSocket Binance Testnet). Voir la console pour plus de détails.';
            connectionStatus.className = 'connection-status disconnected'; // Style d'erreur si nécessaire
        };

        websocket.onmessage = handleWebSocketMessage;
    }


    function handleWebSocketMessage(event) {
        try {
            const message = JSON.parse(event.data);
            console.log("[WebSocket Message Received]:", message); // **Pour débogage - afficher *tous* les messages WebSocket**


            if (message.type === 'ticker') { // **IMPORTANT : Vérifier le type de message pour le flux de ticker 24h - selon la documentation, c'est "ticker"**
                const tickerData = message.data; // **Les données du ticker sont dans la propriété "data" - selon la documentation**

                if (tickerData && tickerData.dataType === '24hrTicker') { // **Vérification supplémentaire du dataType (si disponible)**
                    const symbol = tickerData.symbol;
                    const priceChangePercent = parseFloat(tickerData.priceChangePercent).toFixed(2); // Extraire % change depuis le message WebSocket

                    updateCryptoVariationDisplay(symbol, priceChangePercent); // Mettre à jour l'affichage avec les données WebSocket
                } else {
                    console.debug("[WebSocket] Message de type 'ticker' reçu mais dataType non '24hrTicker' ou données manquantes :", message);
                }

            } else if (message.type === 'error') { // **Gestion des messages d'erreur WebSocket de Binance**
                console.error("[WebSocket] Erreur de Binance Testnet via WebSocket :", message);
                connectionStatus.textContent = `Erreur WebSocket de Binance Testnet : ${message.message || 'Voir console pour détails'}`;
                connectionStatus.className = 'connection-status disconnected error'; // Style d'erreur

            }
            else {
                console.debug('[WebSocket] Message WebSocket reçu (type inconnu ou non géré):', message);
            }


        } catch (e) {
            console.error('Erreur lors du traitement du message WebSocket:', e);
        }
    }


    function updateCryptoPrice(cryptoData) { // Fonction potentiellement non utilisée avec le flux WebSocket corrigé (à vérifier)
        // Mettre à jour le prix dans la section crypto-details si c'est la crypto recherchée
        const symbolHeader = document.getElementById('crypto-symbol-header').textContent.replace(' Prix de ', '');
        if (symbolHeader && cryptoData.symbol === symbolHeader) {
            const priceElement = document.getElementById('crypto-price');
            if (priceElement) {
                priceElement.textContent = `${cryptoData.price} USDT`;
            }
        }

        // Mettre à jour le prix dans la liste secondaire (temps réel - secondaire) - SI VOUS RÉACTIVEZ CETTE SECTION
        /*
        const cryptoItemSecondary = document.getElementById(`crypto-item-${cryptoData.symbol}-secondary`);
        if (cryptoItemSecondary) {
            const priceElementSecondary = cryptoItemSecondary.querySelector('.crypto-price-secondary');
            if (priceElementSecondary) {
                priceElementSecondary.textContent = `${cryptoData.price} USDT`;
            }
        }
        */

        // Mettre à jour le prix dans la liste des favoris
        const favoritePriceElement = document.getElementById(`price-${cryptoData.symbol}`);
        if (favoritePriceElement) {
            favoritePriceElement.textContent = parseFloat(cryptoData.price).toFixed(2) + ' USDT';
        }


        // Mettre à jour le prix dans la liste principale (temps réel - principale) - SI VOUS RÉACTIVEZ CETTE SECTION
        /*
        const cryptoItemMain = document.getElementById(`crypto-item-${cryptoData.symbol}`);
        if (cryptoItemMain) {
            const priceElementMain = cryptoItemMain.querySelector('.crypto-price-main');
            if (priceElementMain) {
                priceElementMain.textContent = `${cryptoData.price} USDT`;
            }
        }
        */
    }


    // --- Gestion de la connexion WebSocket (fin) ---


    // --- Recherche de Cryptomonnaies (début) ---
    const searchInput = document.getElementById('crypto-search');
    const searchButton = document.getElementById('search-button');
    const searchResultsDiv = document.getElementById('search-results');
    let allCryptoSymbols = []; // Pour stocker tous les symboles de crypto disponibles


    async function fetchAllCryptoSymbols() {
        try {
            const response = await axios.get('/symbols'); // Route backend pour récupérer tous les symboles
            allCryptoSymbols = response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des symboles de crypto:', error);
        }
    }


    function displaySearchResults(results) {
        searchResultsDiv.innerHTML = ''; // Effacer les résultats précédents
        if (results.length > 0) {
            results.forEach(symbol => {
                const resultDiv = document.createElement('div');
                resultDiv.textContent = symbol;
                resultDiv.addEventListener('click', () => {
                    searchInput.value = symbol; // Remplir la barre de recherche avec le symbole sélectionné
                    searchResultsDiv.classList.remove('show'); // Cacher la liste de résultats
                    fetchCryptoDetails(symbol); // Afficher les détails de la crypto sélectionnée
                });
                searchResultsDiv.appendChild(resultDiv);
            });
            searchResultsDiv.classList.add('show'); // Afficher la liste de résultats
        } else {
            searchResultsDiv.classList.remove('show'); // Cacher si pas de résultats
        }
    }


    // Fonction pour gérer la recherche (mise à jour pour utiliser allCryptoSymbols)
    function handleSearch() {
        const query = searchInput.value.trim().toUpperCase();
        if (query) {
            const filteredSymbols = allCryptoSymbols.filter(symbol => symbol.includes(query));
            displaySearchResults(filteredSymbols);
        } else {
            searchResultsDiv.classList.remove('show'); // Cacher si la barre de recherche est vide
        }
    }


    // Ajout d'un event listener pour la saisie dans la barre de recherche
    searchInput.addEventListener('input', handleSearch);


    searchButton.addEventListener('click', () => {
        const symbol = searchInput.value.trim().toUpperCase();
        if (symbol) {
            fetchCryptoDetails(symbol);
            searchResultsDiv.classList.remove('show'); // Cacher la liste après la recherche
        } else {
            alert('Veuillez entrer un symbole de cryptomonnaie.');
        }
    });

    // --- Recherche de Cryptomonnaies (fin) ---


    // --- Affichage des détails de la cryptomonnaie et gestion des favoris (début) ---
    const cryptoSymbolHeader = document.getElementById('crypto-symbol-header');
    const cryptoPriceElement = document.getElementById('crypto-price');
    const addFavoriteBtn = document.getElementById('add-favorite-btn');
    const removeFavoriteBtn = document.getElementById('remove-favorite-btn');
    let currentCryptoSymbol = ''; // Variable pour stocker le symbole de la crypto actuellement affichée


    async function fetchCryptoDetails(symbol) {
        currentCryptoSymbol = symbol; // Mettre à jour le symbole actuel
        cryptoSymbolHeader.textContent = `Prix de ${symbol}`;
        cryptoPriceElement.textContent = 'Chargement...'; // Message de chargement initial
        addFavoriteBtn.style.display = 'inline-block'; // Assurer que le bouton Ajouter est visible par défaut
        removeFavoriteBtn.style.display = 'none';      // Assurer que le bouton Retirer est caché par défaut

        try {
            const priceResponse = await axios.get(`/price?symbol=${symbol}`);
            cryptoPriceElement.textContent = `${priceResponse.data.price} USDT`; // Afficher le prix initial

            // Mettre à jour le prix via WebSocket dès maintenant si connecté -  ce code n'est plus forcément utile ici vu qu'on a fetchLivePrice pour les favoris et Top Performers
            /* if (websocket && websocket.readyState === WebSocket.OPEN) {
                websocket.send(JSON.stringify({ type: 'subscribePrice', symbol: symbol }));
            } */


            // Vérifier si la crypto est favorite et ajuster l'affichage des boutons
            const favorites = getFavorites();
            if (favorites.includes(symbol)) {
                addFavoriteBtn.style.display = 'none';
                removeFavoriteBtn.style.display = 'inline-block';
            } else {
                addFavoriteBtn.style.display = 'inline-block';
                removeFavoriteBtn.style.display = 'none';
            }


        } catch (error) {
            console.error('Erreur lors de la récupération des détails de la crypto:', error);
            cryptoPriceElement.textContent = 'Erreur de chargement du prix.';
        }
    }


    // --- Gestion des favoris (début) ---
    function getFavorites() {
        const favorites = localStorage.getItem('favorites');
        return favorites ? JSON.parse(favorites) : [];
    }

    function saveFavorites(favorites) {
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }

    function addFavorite(symbol) {
        let favorites = getFavorites();
        if (!favorites.includes(symbol)) {
            favorites.push(symbol);
            saveFavorites(favorites);
            updateFavoriteDisplay();
            addFavoriteBtn.style.display = 'none';
            removeFavoriteBtn.style.display = 'inline-block';
        }
    }

    function removeFavorite(symbol) {
        let favorites = getFavorites();
        favorites = favorites.filter(fav => fav !== symbol);
        saveFavorites(favorites);
        updateFavoriteDisplay();
        addFavoriteBtn.style.display = 'inline-block';
        removeFavoriteBtn.style.display = 'none';
    }


    function attachFavoriteButtonListeners() {
        addFavoriteBtn.addEventListener('click', () => {
            if (currentCryptoSymbol) {
                addFavorite(currentCryptoSymbol);
            }
        });

        removeFavoriteBtn.addEventListener('click', () => {
            if (currentCryptoSymbol) {
                removeFavorite(currentCryptoSymbol);
            }
        });

        // Gestion des boutons "remove" dynamiquement ajoutés dans la liste des favoris
        const favoritesListContainer = document.getElementById('favoritesList');
        favoritesListContainer.addEventListener('click', function (event) {
            if (event.target.classList.contains('remove-favorite-btn')) {
                const symbolToRemove = event.target.dataset.symbol;
                removeFavorite(symbolToRemove);
            }
        });
    }


    function updateFavoriteDisplay() {
        const favoritesList = getFavorites();
        const favoritesContainer = document.getElementById('favoritesList');
        if (favoritesContainer) {
            favoritesContainer.innerHTML = ''; // Effacer l'affichage précédent

            if (favoritesList.length === 0) {
                favoritesContainer.innerHTML = '<p>Aucun favori sélectionné.</p>';
                return;
            }

            favoritesList.forEach(symbol => {
                const favDiv = document.createElement('div');
                favDiv.classList.add('favorite-item');
                favDiv.innerHTML = `
                    <span class="favorite-symbol">${symbol.replace('USDT', '')}</span>
                    <span class="favorite-price" id="price-${symbol}">...</span>  <button class="remove-favorite-btn" data-symbol="${symbol}">×</button>
                `;
                favoritesContainer.appendChild(favDiv);
                fetchLivePrice(symbol); // Récupérer le prix en direct pour chaque favori
            });
            attachFavoriteButtonListeners(); // Ré-attacher les listeners aux boutons favoris
        }
    }


    // --- Affichage des détails de la cryptomonnaie et gestion des favoris (fin) ---


    // --- Récupération et affichage des données secondaires (temps réel - secondaire) -  SECTION COMMENTÉE ---
    /*
    async function fetchSecondaryCryptoData() {
        try {
            const response = await axios.get('/24hr-ticker'); // Route backend pour toutes les données 24h
            const cryptoDataArray = response.data;
            if (Array.isArray(cryptoDataArray)) {
                displaySecondaryCryptoList(cryptoDataArray);
            } else {
                console.error('Réponse de l\'API invalide pour les données secondaires:', cryptoDataArray);
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des données secondaires:', error);
        }
    }


    function displaySecondaryCryptoList(cryptoDataArray) {
        const cryptoListContainer = document.getElementById('crypto-list-secondary');
        if (!cryptoListContainer) {
            console.error('Conteneur crypto-list-secondary non trouvé.');
            return;
        }
        cryptoListContainer.innerHTML = ''; // Effacer la liste précédente

        cryptoDataArray.forEach(crypto => {
            const cryptoItem = document.createElement('div');
            cryptoItem.classList.add('crypto-item-secondary');
            cryptoItem.id = `crypto-item-${crypto.symbol}-secondary`; // ID unique pour chaque item

            const symbolSpan = document.createElement('span');
            symbolSpan.classList.add('crypto-symbol-secondary');
            symbolSpan.textContent = crypto.symbol;

            const priceSpan = document.createElement('span'); // Prix (ajouté ici aussi, si vous voulez afficher le prix dans cette section)
            priceSpan.classList.add('crypto-price-secondary'); // Classe pour le prix dans la section secondaire
            priceSpan.textContent = `${crypto.lastPrice} USDT`; // Prix initial


            const percentageChangeSpan = document.createElement('span');
            percentageChangeSpan.classList.add('percentage-change-secondary');
            const percentageChange = parseFloat(crypto.priceChangePercent).toFixed(2);
            percentageChangeSpan.textContent = `${percentageChange}%`;
            percentageChangeSpan.style.color = percentageChange >= 0 ? 'green' : 'red'; // Couleur selon la variation


            cryptoItem.appendChild(symbolSpan);
            cryptoItem.appendChild(priceSpan); // Ajouter le prix à l'item secondaire
            cryptoItem.appendChild(percentageChangeSpan);
            cryptoListContainer.appendChild(cryptoItem);
        });
    }
    */


    // --- Récupération et affichage des Top 5 Hausse/Baisse (début) ---

    /*async function fetchTopGainersLosers() {
        try {
            const response = await axios.get('/24hr-ticker'); // Route backend pour TOUTES les données ticker 24h
            const allCryptoData = response.data;

            if (!allCryptoData || !Array.isArray(allCryptoData)) {
                console.error('Données de ticker 24h invalides ou manquantes:', allCryptoData);
                return;
            }

            // Trier pour trouver Top 5 Hausse
            const gainers = [...allCryptoData] // Copie pour ne pas modifier le tableau original
                .sort((a, b) => parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent)) // Tri descendant sur % change
                .slice(0, 5); // Prendre les 5 premiers

            // Trier pour trouver Top 5 Baisse
            const losers = [...allCryptoData] // Copie pour ne pas modifier le tableau original
                .sort((a, b) => parseFloat(a.priceChangePercent) - parseFloat(b.priceChangePercent)) // Tri ascendant sur % change
                .slice(0, 5); // Prendre les 5 premiers

            displayTopPerformers(gainers, 'topGainersList', true); // true pour vert (hausse)
            displayTopPerformers(losers, 'topLosersList', false); // false pour rouge (baisse)


        } catch (error) {
            console.error('Erreur lors de la récupération des Top Performers:', error);
        }
    }


    function displayTopPerformers(cryptoList, listId, isGainers) {
        const listContainer = document.getElementById(listId);
        if (!listContainer) {
            console.error(`Conteneur avec ID ${listId} non trouvé.`);
            return;
        }
        listContainer.innerHTML = ''; // Vider la liste actuelle

        cryptoList.forEach(crypto => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('top-performer-item');

            const symbolSpan = document.createElement('span');
            symbolSpan.classList.add('performer-symbol');
            symbolSpan.textContent = crypto.symbol;

            const percentageSpan = document.createElement('span');
            percentageSpan.classList.add('performer-percentage');
            percentageSpan.textContent = `${parseFloat(crypto.priceChangePercent).toFixed(2)}%`;
            percentageSpan.style.color = isGainers ? 'green' : 'red'; // Vert pour hausse, rouge pour baisse

            const priceSpan = document.createElement('span'); // Ajout pour le prix
            priceSpan.classList.add('performer-price');
            priceSpan.textContent = parseFloat(crypto.lastPrice).toFixed(2) + ' USDT'; // Afficher le prix avec 2 décimales, en USDT

            itemDiv.appendChild(symbolSpan);
            itemDiv.appendChild(percentageSpan);
            itemDiv.appendChild(priceSpan); // Ajouter le prix à l'item
            listContainer.appendChild(itemDiv);
        });
    }


    // --- Récupération et affichage des Top 5 Hausse/Baisse (fin) ---


    // Fonction pour récupérer et afficher le prix en direct (pour les favoris)
    async function fetchLivePrice(symbol) {
        try {
            const response = await axios.get(`/price?symbol=${symbol}`); // Route backend pour prix unique
            const priceElement = document.getElementById(`price-${symbol}`);
            if (priceElement) {
                priceElement.textContent = parseFloat(response.data.price).toFixed(2) + ' USDT';
            }
        } catch (error) {
            console.error(`Erreur lors de la récupération du prix pour ${symbol}:`, error);
        }
    }
*/

    // --- Initialisation au chargement de la page ---
    fetchAllCryptoSymbols(); // Charger tous les symboles au démarrage (NE FONCTIONNERA PAS SANS ROUTE /symbols BACKEND)
    updateFavoriteDisplay(); // Afficher les favoris dès le chargement
    fetchTopGainersLosers(); // Récupérer et afficher les Top 5 Hausse/Baisse au démarrage
    setupWebSocket();        // Démarrer le WebSocket pour les mises à jour en temps réel
    attachFavoriteButtonListeners(); // Initialiser les listeners pour les boutons favoris

    // Rafraîchissement des données (mise à jour des Top 5 et des données secondaires toutes les minutes, prix favoris en temps réel via WebSocket)
    setInterval(fetchTopGainersLosers, 60000); // Mise à jour des Top 5 toutes les minutes
    // setInterval(fetchSecondaryCryptoData, 60000); // Mise à jour des données secondaires (si vous réactivez cette section) - COMMENTÉ

});