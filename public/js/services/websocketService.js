import { favoriteService } from './favoriteService.js';
import { CryptoVariationsTable } from '../components/CryptoVariationsTable.js';

class WebSocketService {
    constructor() {
        this.websocket = null;
        this.reconnectionAttempts = 0;
        this.maxReconnectionAttempts = 5;
        this.reconnectionDelay = 3000;
        this.cryptoVariationsTable = new CryptoVariationsTable('cryptoVariationsTableBody');
    }

    initWebSocket() {
        this.ws = new WebSocket('wss://stream.testnet.binance.vision/ws');
        this.ws.onopen = () => {
            console.log('WebSocket connection opened');
        };
        this.ws.onmessage = (message) => {
            console.log('Message from server ', message.data);
        };
        this.ws.onerror = (error) => {
            console.error('Erreur WebSocket:', error);
            this.updateConnectionStatus(`Erreur WebSocket: ${error.message}. Tentative de reconnexion...`, 'alert-danger');
            this.reconnectWebSocket();
        };
        this.ws.onclose = () => {
            console.log('WebSocket connection closed');
            this.reconnectWebSocket();
        };
    }

    onOpen() {
        console.log('WebSocket connecté');
        this.reconnectionAttempts = 0;
        this.updateConnectionStatus('Connecté via WebSocket - Flux de données temps réel activé.', 'alert-primary');
        this.subscribeToFavorites();
    }

    onClose() {
        console.log('WebSocket déconnecté');
        this.updateConnectionStatus('WebSocket déconnecté. Tentative de reconnexion...', 'alert-warning');
        this.reconnectWebSocket();
    }

    onMessage(event) {
        const data = JSON.parse(event.data);
        if (data.e === '24hrTicker') {
            const symbol = data.s.toUpperCase();
            if (favoriteService.isFavorite(symbol)) {
                this.cryptoVariationsTable.updateOrAddRow(symbol, data.P, data.c);
            }
        }
    }

    onError(error) {
        console.error('Erreur WebSocket:', error);
        this.updateConnectionStatus(`Erreur WebSocket: ${error.message}. Tentative de reconnexion...`, 'alert-danger');
        this.reconnectWebSocket();
    }

    reconnectWebSocket() {
        setTimeout(() => {
            console.log('Reconnecting WebSocket...');
            this.initWebSocket();
        }, 5000); // Reconnect after 5 seconds
    }

    updateConnectionStatus(message, alertClass) {
        const statusDiv = document.getElementById('dashboardConnectionStatus');
        if (statusDiv) {
            statusDiv.textContent = message;
            statusDiv.className = `alert ${alertClass}`;
        }
    }

    subscribeToFavorites() {
        this.cryptoVariationsTable.clear();
        const favorites = favoriteService.getFavorites();
        const symbolsToSubscribe = favorites.slice(0, 10);

        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            this.websocket.send(JSON.stringify({ method: 'UNSUBSCRIBE', params: symbolsToSubscribe.map(symbol => `${symbol.toLowerCase()}@ticker`), id: 2 }));
            this.websocket.send(JSON.stringify({ method: 'SUBSCRIBE', params: symbolsToSubscribe.map(symbol => `${symbol.toLowerCase()}@ticker`), id: 1 }));
        }
    }
}

export const websocketService = new WebSocketService();
export const initWebSocket = () => websocketService.initWebSocket();