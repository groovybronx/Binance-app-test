# Client Tableau de Bord Binance Testnet (avec Gestion de Profils et Icônes)

## Description du Projet

Ce projet est un client web simple conçu pour interagir avec l'API Testnet de Binance. Il permet aux utilisateurs de :

*   **Se connecter à Binance Testnet** en utilisant leurs clés API.
*   **Gérer plusieurs profils de connexion** pour différents comptes Testnet.
*   **Visualiser le solde de leur compte** en USDT.
*   **Suivre les variations de prix en temps réel** de cryptomonnaies favorites via WebSocket.
*   **Rechercher des symboles de cryptomonnaies** et afficher des informations détaillées.
*   **Personnaliser la liste des cryptomonnaies favorites** à suivre.
*   **Bénéficier d'une fonctionnalité "Rester connecté"** pour une reconnexion plus rapide.
*   **Gérer les profils** (création, suppression, *fonctionnalité d'édition à venir*).

L'interface utilisateur est conçue pour être claire et informative, permettant un accès rapide aux informations essentielles pour le trading et le suivi de portefeuille sur Binance Testnet.

## Fonctionnalités Principales

*   **Gestion de Profils de Connexion :**
    *   Enregistrez et gérez plusieurs profils de connexion Binance Testnet.
    *   Connexion rapide à un profil sélectionné.
    *   **Liste de profils visuellement améliorée :**  Les profils sont affichés dans une liste claire avec des icônes pour les actions.
    *   **Icônes pour Éditer et Supprimer :** Les boutons "Éditer" et "Supprimer" ont été remplacés par des icônes pour une interface plus épurée.
        *   [Image of Bouton Éditer remplacé par icône stylo]
        *   [Image of Bouton Supprimer remplacé par icône corbeille]

*   **Tableau de Bord Interactif :**
    *   **Solde du Compte :** Visualisez le solde de votre compte Binance Testnet en USDT.
    *   **Variations de Prix en Temps Réel (WebSocket) :** Suivez les variations de prix en pourcentage de vos cryptomonnaies favorites.
        *   **Colorisation des Variations :** Les pourcentages de variation sont affichés en vert pour les hausses et en rouge pour les baisses.
        *   [Image of Tableau de variations de prix avec pourcentages colorés en vert et rouge]

*   **Fonctionnalité "Rester Connecté" :**
    *   Possibilité de mémoriser le profil sélectionné pour une reconnexion automatique lors des prochaines visites.
    *   [Image of Checkbox "Rester connecté" sur le formulaire de connexion]

*   **Recherche de Symboles et Page d'Informations sur les Actifs :**
    *   Recherchez rapidement des symboles de cryptomonnaies (par exemple, BTC).
    *   Accédez à une page d'information détaillée pour chaque actif, incluant le prix actuel, la variation sur 24h, le volume, etc.
    *   Possibilité d'ajouter/retirer des symboles de votre liste de favoris directement depuis la page d'information.
    *   [Image of Page d'information sur un actif avec détails et bouton favori]

*   **Gestion des Favoris :**
    *   Ajoutez des symboles à votre liste de favoris pour un suivi personnalisé des variations de prix.
    *   Les favoris sont stockés localement dans le navigateur (localStorage).

## Technologies Utilisées

*   **Frontend :**
    *   HTML5, CSS3, JavaScript
    *   Bootstrap pour le style et la mise en page responsive.
    *   Font Awesome pour les icônes.
*   **Librairies JavaScript :**
    *   axios pour les requêtes HTTP vers l'API Binance Testnet.

## Prérequis

*   Un navigateur web moderne (Chrome, Firefox, Safari, etc.).
*   Des clés API Binance Testnet (obtenues depuis le site de Binance Testnet).

## Installation et Lancement

Ce projet est un client frontend qui s'exécute directement dans le navigateur. Il ne nécessite pas d'installation complexe.

1.  **Clonez ce repository (si vous avez le code source) :**
    ```bash
    git clone [URL_DU_REPOSITORY]
    cd [NOM_DU_DOSSIER_DU_PROJET]
    ```

2.  **Ouvrez le fichier `index.html`** dans votre navigateur web.

## Configuration

1.  **Obtenez vos clés API Testnet Binance :**
    *   Connectez-vous ou créez un compte sur [Binance Testnet](https://testnet.binance.vision/).
    *   Naviguez vers la section de gestion des API pour créer des clés API Testnet.
    *   **Important :**  Conservez précieusement votre **Clé API (API Key)** et votre **Clé Secrète (Secret Key)**.

2.  **Utilisez l'application :**
    *   Ouvrez `index.html` dans votre navigateur.
    *   Cliquez sur "Créer un Nouveau Profil" pour enregistrer vos clés API Testnet et un nom de profil.
    *   Sélectionnez un profil dans la liste.
    *   Entrez le code de profil si vous en avez défini un (facultatif).
    *   Cliquez sur "Se Connecter".

## Utilisation

1.  **Page de Connexion :**
    *   La page de connexion affiche une liste des profils enregistrés.
    *   Sélectionnez un profil pour vous connecter.
    *   Utilisez la case à cocher "Rester connecté" pour simplifier les connexions futures.
    *   Cliquez sur les icônes de stylo pour *éditer le profil (fonctionnalité à venir)* ou de corbeille pour supprimer un profil.

2.  **Tableau de Bord :**
    *   Une fois connecté, le tableau de bord affiche :
        *   Le statut de la connexion WebSocket.
        *   Le solde de votre compte en USDT.
        *   Un tableau des variations de prix en temps réel pour vos cryptomonnaies favorites.
    *   Utilisez le bouton "Rechercher un Symbole" pour afficher la section de recherche.

3.  **Section de Recherche :**
    *   Entrez un symbole de cryptomonnaie (par exemple, `BTC`).
    *   Cliquez sur "Rechercher" ou appuyez sur "Entrée".
    *   Les résultats de la recherche s'affichent sous forme de liste cliquable.
    *   Cliquez sur un résultat pour accéder à la page d'informations détaillées de l'actif.

4.  **Page d'Informations sur l'Actif :**
    *   Affiche des informations détaillées sur l'actif sélectionné (symbole, prix actuel, variation 24h, volume, etc.).
    *   Utilisez le bouton "Favoris" pour ajouter ou retirer l'actif de votre liste de favoris.
    *   Cliquez sur "Retour au Tableau de Bord" pour revenir au tableau de bord principal.

5.  **Déconnexion :**
    *   Cliquez sur le bouton "Déconnexion" dans le tableau de bord pour vous déconnecter et revenir à la page de connexion.

## Personnalisation (Optionnel)

*   **Styles CSS :**  Vous pouvez personnaliser l'apparence de l'application en modifiant le fichier `css/style.css`.

## Disclaimer

**Ce projet est destiné à être utilisé UNIQUEMENT avec l'API Testnet de Binance.**  N'utilisez **JAMAIS** vos clés API réelles de Binance avec ce client, car cela pourrait compromettre la sécurité de votre compte de trading réel.  Ce projet est fourni à des fins éducatives et de test uniquement.  L'auteur ne saurait être tenu responsable de toute perte ou dommage résultant de l'utilisation de ce logiciel.

---

*Dernière mise à jour : Octobre 2023*