require('dotenv').config();
const express = require('express');
const path = require('path');
const { Spot } = require('@binance/connector');
const WebSocket = require('ws');

const app = express();
const port = 3000; // Ou un autre port, par exemple 3001

app.use(express.static('public'));
app.use(express.json());

const logger = console; // Pour simplifier, utilisons console.log directement

// ======= ROUTES REST API (COMMENTÉES POUR TEST) =======
/*
app.post('/connect', async (req, res) => { ... });
app.get('/price', async (req, res) => { ... });
app.get('/24hr-ticker', async (req, res) => { ... });
app.get('/account', async (req, res) => { ... });
app.get('*', (req, res) => { ... });
*/


// ======= SERVEUR WEBSOCKET =======
const wss = new WebSocket.Server({ port: port });

wss.on('connection', ws => {
    logger.log('Client WebSocket connecté');
    ws.send(JSON.stringify({ type: 'message', data: 'Test WebSocket - Connexion établie!' }));
    ws.on('message', message => {
        logger.log(`Message reçu du client WebSocket: ${message}`);
    });
    ws.on('close', () => {
        logger.log('Client WebSocket déconnecté');
    });
    ws.on('error', error => {
        logger.error('Erreur WebSocket:', error);
    });
});


// ======= LANCEMENT DU SERVEUR =======
app.listen(port, () => {
    logger.log(`Serveur Express et WebSocket écoutant sur le port ${port}`);
});