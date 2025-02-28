# Tableau de Bord Binance Testnet - Variations Crypto Temps Réel et Soldes

Ce projet est un tableau de bord web interactif qui utilise l'API Testnet de Binance pour afficher :

*   **Les variations de prix en temps réel** pour une liste de cryptomonnaies (actuellement axé sur les favoris).
*   **Les soldes de votre compte Binance Testnet** en USDT.

Le tableau de bord utilise également un **flux WebSocket** pour obtenir les mises à jour de prix en temps réel, offrant une expérience utilisateur dynamique.

## Fonctionnalités Principales

*   **Connexion API Binance Testnet :**  Utilise vos clés API et Secret Key Testnet pour se connecter à Binance.
*   **Affichage des Soldes du Compte :** Présente un tableau des soldes de votre compte en USDT, affichant les soldes libres et bloqués.
*   **Tableau des Variations de Cryptomonnaies (24h) :**  Affiche un tableau des variations de prix en pourcentage sur 24 heures pour une liste de cryptomonnaies (favoris).
*   **Flux de Données Temps Réel (WebSocket) :**  Mise à jour automatique du tableau des variations de prix en temps réel via WebSocket.
*   **Fonctionnalité Favoris :**  Permet d'ajouter et de retirer des cryptomonnaies de votre liste de favoris. Les variations de prix des favoris sont suivies en temps réel.
*   **Recherche de Symboles :**  Permet de rechercher des informations (prix actuel, variations 24h, etc.) pour n'importe quel symbole de cryptomonnaie sur Binance Testnet.
*   **Page d'Informations Détaillées par Actif :**  En cliquant sur l'icône "oeil" dans le tableau des variations, vous accédez à une page d'informations détaillées pour l'actif sélectionné (prix, variations, volumes, etc.), avec un bouton pour ajouter/retirer des favoris.
*   **Interface Utilisateur Moderne et Responsive :**  Utilisation de Bootstrap 5 et de Font Awesome pour une interface utilisateur claire, réactive et agréable.

## Prérequis

Avant de démarrer, assurez-vous d'avoir installé :

*   **Node.js et npm :** (https://nodejs.org/) -  Nécessaire pour exécuter le serveur et gérer les dépendances JavaScript.

## Installation et Configuration

1.  **Clonez ce dépôt Git :**
    ```bash
    git clone [URL_DE_VOTRE_REPO_GIT]
    cd mon-application-binance
    ```
2.  **Installez les dépendances Node.js :**
    ```bash
    npm install
    ```
3.  **Créez un fichier `.env` à la racine du projet :**
    ```bash
    touch .env
    ```
4.  **Ajoutez vos clés API Binance Testnet dans le fichier `.env` :**
    ```env
    BINANCE_API_KEY=VOTRE_API_KEY_TESTNET
    BINANCE_SECRET_KEY=VOTRE_SECRET_KEY_TESTNET
    ```
    **Important :**  Remplacez `VOTRE_API_KEY_TESTNET` et `VOTRE_SECRET_KEY_TESTNET` par vos véritables clés API Testnet Binance. **Ne versionnez jamais le fichier `.env` !** (il doit être ignoré par Git grâce au fichier `.gitignore` que vous avez créé).

## Démarrage de l'Application

Pour lancer le tableau de bord, exécutez la commande suivante dans le terminal à la racine du projet :

```bash
npm start