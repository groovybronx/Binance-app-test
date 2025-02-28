// Middleware de gestion des erreurs global
const errorMiddleware = (err, req, res, next) => {
    console.error('Middleware Error Handling:', err); // Log de l'erreur (important pour le débogage)

    // -- Vous pouvez personnaliser la réponse d'erreur ici en fonction du type d'erreur, etc. --

    // Réponse d'erreur générique pour l'instant
    res.status(500).json({
        success: false,
        message: 'Une erreur serveur est survenue.',
        details: err.message || 'Détails non disponibles' // Inclure le message d'erreur si disponible
    });
};

module.exports = errorMiddleware;