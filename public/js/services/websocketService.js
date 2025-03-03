// public/js/services/websocketService.js
export class WebsocketService {
    constructor(dashboardConnectionStatusDiv, onMessageCallback, onErrorCallback, onOpenCallback, onCloseCallback) {
        this.websocketClient = null;
        this.reconnectionAttempts = 0;
        this.maxReconnectionAttempts = 5;
        this.reconnectionDelay = 3000;
        this.dashboardConnectionStatusDiv = dashboardConnectionStatusDiv;
        this.onMessageCallback = onMessageCallback; 
        this.onErrorCallback = onErrorCallback;
        this.onOpenCallback = onOpenCallback;
        this.onCloseCallback = onCloseCallback;
        this.messageQueue = []; 
        this.isSocketOpen = false; 
        this.messageIdCounter = 1; // Added message ID counter
    }

    initWebSocket() {
        if (this.websocketClient && this.websocketClient.readyState === WebSocket.OPEN) {
            console.log('WebSocket est déjà connecté. Pas besoin de nouvelle connexion.');
            return;
        }
        this.openWebSocket('wss://stream.binance.com:9443/ws/btcusdt@ticker');
        //this.openWebSocket('wss://testnet.binance.vision/ws');
    }

    openWebSocket(url) {
        this.websocketClient = new WebSocket(url);

        this.websocketClient.onopen = () => {
            this.reconnectionAttempts = 0;
            console.log('Client WebSocket connecté (websocketService.js)');
            this.isSocketOpen = true; 
            this.onOpenCallback();
            this.processMessageQueue(); 
            this.dashboardConnectionStatusDiv.textContent = 'Connecté via WebSocket - Flux de données temps réel activé.';
            this.dashboardConnectionStatusDiv.classList.remove('alert-info', 'alert-danger', 'alert-warning');
            this.dashboardConnectionStatusDiv.classList.add('alert-primary');
        };

        this.websocketClient.onclose = () => {
            console.log('Client WebSocket déconnecté (websocketService.js)');
            this.isSocketOpen = false; 
            this.onCloseCallback();
            this.reconnectWebSocket(); 
            this.dashboardConnectionStatusDiv.textContent = 'WebSocket déconnecté. Tentative de reconnexion...';
            this.dashboardConnectionStatusDiv.classList.remove('alert-primary', 'alert-success');
            this.dashboardConnectionStatusDiv.classList.add('alert-warning');
        };

        this.websocketClient.onmessage = (event) => {
            this.onMessageCallback(event);
        };

        this.websocketClient.onerror = (error) => {
            console.error('Erreur du Client WebSocket (websocketService.js):', error);
            this.isSocketOpen = false; 
            this.onErrorCallback(error);
            this.reconnectWebSocket();
            this.dashboardConnectionStatusDiv.textContent = `Erreur WebSocket: ${error.message}. Tentative de reconnexion...`;
            this.dashboardConnectionStatusDiv.classList.remove('alert-primary', 'alert-success', 'alert-info');
            this.dashboardConnectionStatusDiv.classList.add('alert-danger');
        };
    }

    reconnectWebSocket() {
        if (this.reconnectionAttempts < this.maxReconnectionAttempts) {
            this.reconnectionAttempts++;
            this.dashboardConnectionStatusDiv.textContent = `WebSocket déconnecté. Reconnexion Tentative ${this.reconnectionAttempts} sur ${this.maxReconnectionAttempts} dans ${this.reconnectionDelay / 1000} secondes...`;
            setTimeout(() => this.initWebSocket(), this.reconnectionDelay);
        } else {
            this.dashboardConnectionStatusDiv.textContent = `Échec de la reconnexion WebSocket après ${this.maxReconnectionAttempts} tentatives. Veuillez rafraîchir la page.`;
            this.dashboardConnectionStatusDiv.classList.remove('alert-warning', 'alert-primary');
            this.dashboardConnectionStatusDiv.classList.add('alert-danger');
            console.error(`Reconnexion WebSocket échouée après ${this.maxReconnectionAttempts} tentatives (websocketService.js).`);
        }
    }
    sendMessage(message) {
        if (this.isSocketOpen) { 
          this.websocketClient.send(JSON.stringify(message));
        } else {
          console.log('WebSocket is not open yet, queuing message.');
          this.messageQueue.push(message); 
        }
      }
    processMessageQueue() {
        while (this.messageQueue.length > 0 && this.isSocketOpen) {
            const message = this.messageQueue.shift();
            this.sendMessage(message);
        }
    }
    closeWebSocket() {
        if(this.websocketClient) {
            this.websocketClient.close();
        }
    }
    
    subscribeToSymbols(symbols) {
      const symbolsToSubscribe = symbols.map(symbol => `${symbol.toLowerCase()}@ticker`);
      this.sendMessage({ method: 'SUBSCRIBE', params: symbolsToSubscribe, id: this.messageIdCounter++ });
    }

    unsubscribeFromSymbols(symbols) {
      const symbolsToUnsubscribe = symbols.map(symbol => `${symbol.toLowerCase()}@ticker`);
      this.sendMessage({ method: 'UNSUBSCRIBE', params: symbolsToUnsubscribe, id: this.messageIdCounter++ });
    }

}
