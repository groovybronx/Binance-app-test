const path = require('path'); // Module path pour la gestion des chemins de fichiers
const express = require('express');
const app = express();
const cors = require('cors'); // Si vous utilisez CORS


// Import des middlewares (pour l'instant, juste errorMiddleware - on ajoutera les autres au besoin)
const errorMiddleware = require('./middlewares/errorMiddleware');

// Import des routes
const authRoutes = require('./routes/auth');
const dataRoutes = require('./routes/data');
// const tradingRoutes = require('./routes/trading'); // (Futur - si vous ajoutez des routes de trading)


// Configuration de base du serveur
const PORT = process.env.PORT || 3000;

// Middlewares globaux
app.use(cors()); // Si vous avez besoin de CORS
app.use(express.json()); // Pour parser le JSON des requêtes
app.use(express.static(path.join(__dirname, '..', 'public')));// Pour servir les fichiers statiques depuis le dossier 'public' (un niveau au-dessus de 'server')

// -- IMPORTANT : Les middlewares spécifiques aux routes (authentification, etc.) seront ajoutés *dans* les fichiers de routes (routes/) si nécessaire --

// Utilisation des routes (ici, routes d'authentification et de données)
app.use('/auth', authRoutes); // Préfixe '/auth' pour les routes d'authentification (ex: /auth/connect)
app.use('/data', dataRoutes); // Préfixe '/data' pour les routes de données (ex: /data/price)
// app.use('/trading', tradingRoutes); // (Futur - si vous ajoutez des routes de trading, avec préfixe '/trading')


// Middleware de gestion des erreurs (doit être défini *après* les routes)
app.use(errorMiddleware);

// Route principale pour servir index.html (pour que votre application frontend fonctionne)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html')); // Remonte d'un niveau pour atteindre 'public'
});


// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});