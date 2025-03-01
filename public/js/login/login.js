document.addEventListener('DOMContentLoaded', () => {
    // login.js - Gestion des profils de connexion (VERSION LISTES A PUCES + ICONES EDIT/DELETE)

    // --- DEPLACER TOUTES LES DECLARATIONS AVEC document.getElementById ICI, AVANT loadProfiles() ---
    const loginFormContainer = document.getElementById('loginFormContainer');
    const dashboardContainer = document.getElementById('dashboard');
    const assetInfoPageContainer = document.getElementById('assetInfoPage');
    const accountInfoDiv = document.getElementById('account-info');
    const accountBalanceDiv = document.getElementById('account-balance');

    const profileListContainer = document.getElementById('profileListContainer');
    const profileButtonsContainer = document.getElementById('profileButtonsContainer'); // Container pour les listes de profil
    const noProfilesMessage = document.getElementById('noProfilesMessage');
    const profileLoginForm = document.getElementById('profileLoginForm');
    const connectProfileButton = document.getElementById('connectProfileButton'); // Bouton "Se Connecter"
    const createProfileForm = document.getElementById('createProfileForm');
    const logoutButton = document.getElementById('logoutButton'); // Bouton "Déconnexion"
    const showCreateProfileButton = document.getElementById('showCreateProfileButton'); // Bouton "Créer un Nouveau Profil"
    const createProfileContainer = document.getElementById('createProfileContainer'); // Container du formulaire "Créer un Profil"


    let savedProfiles = [];
    loadProfiles(); // APPELLER loadProfiles() ICI, APRES avoir déclaré savedProfiles et les éléments HTML


    let selectedProfileName = null;


    // --- AJOUT DEBUT - Fonctionnalité "Rester connecté" ---
    const rememberedProfileName = localStorage.getItem('rememberedProfileName');
    console.log("Au chargement de la page, profil mémorisé trouvé dans localStorage :", rememberedProfileName);
    if (rememberedProfileName) {
        selectedProfileName = rememberedProfileName; // Définir le profil mémorisé comme profil sélectionné
        // profileLoginForm.style.display = 'block'; // SUPPRIMER CETTE LIGNE : Ne pas afficher le formulaire de code profil lors de la connexion automatique
        loginFormContainer.style.display = 'none'; // Cacher le formulaire de login principal en attendant la connexion auto

        const selectedProfile = savedProfiles.find(p => p.profileName === rememberedProfileName);
        if (selectedProfile) {
            // Tentative de connexion automatique avec le profil mémorisé
            connectAutomatically(selectedProfile);
        } else {
            // Profil mémorisé non trouvé (supprimé ?), revenir à l'affichage normal de login
            loginFormContainer.style.display = 'block';
            profileButtonsContainer.style.display = 'block';
            populateProfileDropdown();
        }
    }
    // --- FIN AJOUT DEBUT - Fonctionnalité "Rester connecté" ---


    function loadProfiles() {
        console.log("loadProfiles() appelée");
        const profilesJSON = localStorage.getItem('binanceProfiles');
        savedProfiles = profilesJSON ? JSON.parse(profilesJSON) : [];
        console.log("Profils chargés depuis localStorage :", savedProfiles);

        if (savedProfiles.length > 0) {
            noProfilesMessage.style.display = 'none';
            profileButtonsContainer.style.display = 'block'; // Afficher le container des listes
            populateProfileDropdown();
        } else {
            noProfilesMessage.style.display = 'block';
            profileButtonsContainer.style.display = 'none'; // Cacher le container des listes s'il n'y a pas de profils
        }
    }


    function populateProfileDropdown() {
        console.log("populateProfileDropdown() appelée (pour listes avec icônes Edit/Delete)");
        profileButtonsContainer.innerHTML = '';

        const profileList = document.createElement('ul');
        profileList.classList.add('list-unstyled', 'profile-list');

        savedProfiles.forEach(profile => {
            console.log("Traitement du profil (liste Icones Edit/Delete):", profile.profileName);

            const profileListItem = document.createElement('li');
            profileListItem.classList.add('profile-list-item');

            const profileLink = document.createElement('a');
            profileLink.href = '#';
            profileLink.textContent = profile.profileName;
            profileLink.classList.add('profile-list-link');

            profileLink.addEventListener('click', (event) => {
                event.preventDefault();
                selectedProfileName = profile.profileName;
                document.querySelectorAll('.profile-list-item').forEach(item => item.classList.remove('active'));
                profileListItem.classList.add('active');
                profileLoginForm.style.display = 'block';
            });
            profileListItem.appendChild(profileLink);

            // --- MODIFICATION DEBUT - Boutons EDITER et SUPPRIMER remplacés par des ICONES ---
            const actionsContainer = document.createElement('div');
            actionsContainer.classList.add('profile-actions');

            // Bouton EDITER (ICONE STYLO)
            const editButton = document.createElement('button');
            editButton.classList.add('btn', 'btn-sm', 'btn-outline-primary', 'edit-profile-button', 'icon-button'); // Ajout de 'icon-button' pour styler les boutons d'icônes
            editButton.innerHTML = '<i class="fas fa-pen"></i>'; // Utilisation de l'icône "fa-pen" de Font Awesome (icône stylo)
            editButton.title = 'Éditer le profil'; // Ajout d'un tooltip pour l'accessibilité
            editButton.addEventListener('click', (event) => {
                event.stopPropagation();
                event.preventDefault();
                handleEditProfile(profile.profileName);
            });
            actionsContainer.appendChild(editButton);

            // Bouton SUPPRIMER (ICONE CORBEILLE)
            const deleteButton = document.createElement('button');
            deleteButton.classList.add('btn', 'btn-sm', 'btn-outline-danger', 'delete-profile-button', 'icon-button'); // Ajout de 'icon-button'
            deleteButton.innerHTML = '<i class="fas fa-trash"></i>'; // Utilisation de l'icône "fa-trash" de Font Awesome (icône corbeille)
            deleteButton.title = 'Supprimer le profil'; // Ajout d'un tooltip
            deleteButton.addEventListener('click', (event) => {
                event.stopPropagation();
                event.preventDefault();
                handleDeleteProfile(profile.profileName);
            });
            actionsContainer.appendChild(deleteButton);

            profileListItem.appendChild(actionsContainer);
            // --- MODIFICATION FIN - Boutons EDITER et SUPPRIMER remplacés par des ICONES ---

            profileList.appendChild(profileListItem);
        });

        profileButtonsContainer.appendChild(profileList);
        profileButtonsContainer.style.display = 'block';
        console.log("Fin de populateProfileDropdown() (pour listes avec icônes Edit/Delete)");
    }


    // --- AJOUT DEBUT - Gestion du formulaire createProfileForm (Créer un Nouveau Profil) ---
    createProfileForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const profileName = document.getElementById('newProfileName').value.trim();
        const profileCode = document.getElementById('newProfileCode').value.trim();
        const apiKey = document.getElementById('newApiKey').value.trim();
        const secretKey = document.getElementById('newSecretKey').value.trim();

        if (!profileName || !apiKey || !secretKey) {
            alert('Veuillez remplir tous les champs obligatoires (Nom du Profil, Clé API et Clé Secrète).');
            return;
        }

        const newProfile = {
            profileName: profileName,
            profileCode: profileCode,
            apiKey: apiKey,
            secretKey: secretKey,
            connectionType: 'Testnet'
        };

        savedProfiles.push(newProfile);
        localStorage.setItem('binanceProfiles', JSON.stringify(savedProfiles));
        loadProfiles();
        alert(`Profil "${profileName}" enregistré avec succès.`);
        createProfileForm.reset();
        createProfileContainer.style.display = 'none'; // Cacher le formulaire après la création du profil
    });
    // --- FIN AJOUT - Gestion du formulaire createProfileForm (Créer un Nouveau Profil) ---


    connectProfileButton.addEventListener('click', async function (event) {
        event.preventDefault();
        const profileCodeInput = document.getElementById('profileCode').value.trim();
        const rememberProfileCheckbox = document.getElementById('rememberProfile').checked; // Récupérer l'état de la checkbox

        if (!selectedProfileName) {
            alert('Veuillez sélectionner un profil en cliquant sur un profil dans la liste.');
            return;
        }

        const selectedProfile = savedProfiles.find(p => p.profileName === selectedProfileName);
        if (!selectedProfile) {
            alert('Profil sélectionné non trouvé. Veuillez recharger la page.');
            return;
        }

        if (selectedProfile.profileCode && profileCodeInput !== selectedProfile.profileCode) {
            alert('Code de profil incorrect.');
            return;
        }

        const apiKey = selectedProfile.apiKey;
        const secretKey = selectedProfile.secretKey;

        if (!apiKey || !secretKey) {
            alert('Clés API ou secrète manquantes dans le profil sélectionné.');
            return;
        }

        try {
            const response = await axios.post('auth/connect', { apiKey: apiKey, secretKey: secretKey });
            if (response.data.success) {
                displayAccountBalances(response.data.accountInfo);
                loginFormContainer.style.display = 'none';
                dashboardContainer.style.display = 'block';
                assetInfoPageContainer.style.display = 'none';

                if (typeof displayAccountBalances === 'function') {
                    displayAccountBalances(response.data.accountInfo);
                } else {
                    console.error("Fonction displayAccountBalances non définie dans le scope global.");
                }
                if (typeof initWebSocket === 'function') {
                    initWebSocket();
                } else {
                    console.error("Fonction initWebSocket non définie dans le scope global.");
                }
                /*if (typeof attachFavoriteButtonListeners === 'function') {
                    attachFavoriteButtonListeners();
                } else {
                    console.error("Fonction attachFavoriteButtonListeners non définie dans le scope global.");
                } */

                // --- AJOUT MILIEU - Fonctionnalité "Rester connecté" ---
                if (rememberProfileCheckbox) {
                    localStorage.setItem('rememberedProfileName', selectedProfileName); // Enregistrer le nom du profil
                    console.log("Rester connecté coché. Profil enregistré dans localStorage :", selectedProfileName);
                } else {
                    localStorage.removeItem('rememberedProfileName'); // Supprimer si non coché
                    console.log("Rester connecté non coché. Profil supprimé de localStorage.");
                }
                // --- FIN AJOUT MILIEU - Fonctionnalité "Rester connecté" ---


            } else {
                alert(`Échec de la connexion API REST avec le profil "${selectedProfile.profileName}": ${response.data.message}`);
                console.error('Erreur de connexion API REST (profil):', response.data);
                accountInfoDiv.textContent = 'Erreur de connexion API (profil). Voir la console pour les détails.';
                accountBalanceDiv.innerHTML = '';
            }
        } catch (error) {
            console.error('Erreur lors de la requête de connexion API REST (profil):', error);
            alert('Erreur de connexion API REST (profil). Vérifiez la console pour plus de détails.');
            accountInfoDiv.textContent = 'Erreur de connexion API (profil). Voir la console pour les détails.';
            accountBalanceDiv.innerHTML = '';
        }
    });


    // --- AJOUT FIN - Fonctionnalité "Rester déconnecté" - Gestion du bouton Déconnexion ---
    if (logoutButton) { // Vérifier si le bouton existe bien dans le DOM
        logoutButton.addEventListener('click', function() {
            console.log("Bouton Déconnexion cliqué."); // Pour vérification dans la console

            // 1. Supprimer le profil mémorisé du localStorage (désactiver "Rester connecté")
            localStorage.removeItem('rememberedProfileName');
            console.log("Profil mémorisé supprimé de localStorage (Déconnexion).");

            // 2. Réinitialiser l'affichage : Cacher le tableau de bord, afficher le formulaire de login et les listes de profil
            const dashboardContainer = document.getElementById('dashboard');
            const loginFormContainer = document.getElementById('loginFormContainer');
            const profileButtonsContainer = document.getElementById('profileButtonsContainer');

            if (dashboardContainer && loginFormContainer && profileButtonsContainer) { // Vérifier que les éléments existent avant de les manipuler
                dashboardContainer.style.display = 'none'; // Cacher le tableau de bord
                loginFormContainer.style.display = 'block'; // Afficher le formulaire de login principal
                profileButtonsContainer.style.display = 'block'; // Afficher les listes de profil
                console.log("Tableau de bord caché, formulaire de login et listes de profil affichés.");

                // Optionnel : Réinitialiser d'autres éléments ou variables si nécessaire (ex: vider le contenu du tableau de bord)
                const accountInfoDiv = document.getElementById('account-info');
                const accountBalanceDiv = document.getElementById('account-balance');
                if (accountInfoDiv && accountBalanceDiv) {
                    accountInfoDiv.textContent = ''; // Vider les infos du compte
                    accountBalanceDiv.innerHTML = ''; // Vider le solde
                    console.log("Infos du compte et solde réinitialisés.");
                }

                alert("Déconnexion réussie."); // Message de confirmation (optionnel)
            } else {
                console.error("Éléments HTML (dashboard, loginFormContainer, profileButtonsContainer) non trouvés. Vérifiez les IDs dans index.html.");
            }
        });
    } else {
        console.error("Bouton 'logoutButton' non trouvé dans le DOM. Vérifiez l'ID dans index.html.");
    }
    // --- FIN AJOUT - Fonctionnalité "Rester déconnecté" - Gestion du bouton Déconnexion ---


    // --- Gestion du bouton "Créer un nouveau profil" (afficher/masquer le formulaire) ---
    if (showCreateProfileButton && createProfileContainer) {
        showCreateProfileButton.addEventListener('click', function() {
            console.log("Bouton 'Créer un Nouveau Profil' cliqué.");
            createProfileContainer.style.display = (createProfileContainer.style.display === 'none' || createProfileContainer.style.display === '') ? 'block' : 'none';
        });
    } else {
        console.error("Bouton 'showCreateProfileButton' ou 'createProfileContainer' non trouvé dans le DOM. Vérifiez les IDs dans index.html.");
    }
    // --- Fin gestion du bouton "Créer un nouveau profil" ---


    // --- AJOUT FIN - Fonctionnalité "Rester connecté" - Fonction connectAutomatically ---
    async function connectAutomatically(profile) {
        console.log("Fonction connectAutomatically appelée pour le profil :", profile.profileName); // AJOUT : Vérifier si la fonction est appelée
        const apiKey = profile.apiKey;
        const secretKey = profile.secretKey;

        try {
            const response = await axios.post('auth/connect', { apiKey: apiKey, secretKey: secretKey });
            console.log("Réponse de la requête axios.post('auth/connect') dans connectAutomatically :", response); // AJOUT : Vérifier la réponse de la requête API

            if (response.data.success) {
                displayAccountBalances(response.data.accountInfo);
                loginFormContainer.style.display = 'none';
                dashboardContainer.style.display = 'block';
                assetInfoPageContainer.style.display = 'none';
                console.log(`Connexion automatique réussie avec le profil "${profile.profileName}".`); // Message de succès discret dans la console

                if (typeof displayAccountBalances === 'function') {
                    displayAccountBalances(response.data.accountInfo);
                } else {
                    console.error("Fonction displayAccountBalances non définie dans le scope global.");
                }
                if (typeof initWebSocket === 'function') {
                    initWebSocket();
                } else {
                    console.error("Fonction initWebSocket non définie dans le scope global.");
                }
                /*if (typeof attachFavoriteButtonListeners === 'function') {
                    attachFavoriteButtonListeners();
                } else {
                    console.error("Fonction attachFavoriteButtonListeners non définie dans le scope global.");
                } */

            } else {
                console.error('Échec de la connexion API REST automatique (profil):', response.data);
                loginFormContainer.style.display = 'block'; // En cas d'échec, réafficher le formulaire de login
                profileButtonsContainer.style.display = 'block';
                populateProfileDropdown(); // Et afficher les listes de profil
                // alert(`Échec de la connexion automatique API REST avec le profil "${profile.profileName}". Veuillez vous connecter manuellement.`); // SUPPRIMER CETTE ALERTE
                accountInfoDiv.textContent = 'Erreur de connexion API (profil). Voir la console pour les détails.';
                accountBalanceDiv.innerHTML = '';
                console.log("La connexion automatique API REST a échoué."); // AJOUT : Confirmation d'échec API
            }
        } catch (error) {
            console.error('Erreur lors de la requête de connexion API REST automatique (profil):', error);
            loginFormContainer.style.display = 'block'; // En cas d'erreur, réafficher le formulaire de login
            profileButtonsContainer.style.display = 'block';
            populateProfileDropdown(); // Et afficher les listes de profil
            // alert('Erreur de connexion API REST automatique (profil). Vérifiez la console pour plus de détails.'); // SUPPRIMER CETTE ALERTE
            accountInfoDiv.textContent = 'Erreur de connexion API (profil). Voir la console pour les détails.';
            accountBalanceDiv.innerHTML = '';
            console.log("Erreur lors de la requête de connexion automatique API REST."); // AJOUT : Confirmation d'erreur requête
        }
    }
    // --- FIN AJOUT FIN - Fonctionnalité "Rester connecté" - Fonction connectAutomatically ---


    // --- AJOUT DEBUT - Fonctions handleEditProfile et handleDeleteProfile ---

    function handleEditProfile(profileName) {
        console.log("handleEditProfile appelée pour le profil :", profileName);
        alert(`Fonctionnalité d'édition du profil "${profileName}" à implémenter.`); // Pour le moment, une alerte. On développera le formulaire d'édition plus tard.
        // TODO: Implémenter l'affichage du formulaire d'édition pour le profil spécifié (profileName)
    }


    function handleDeleteProfile(profileName) {
        console.log("handleDeleteProfile appelée pour le profil :", profileName);

        if (confirm(`Êtes-vous sûr de vouloir supprimer le profil "${profileName}" ? Cette action est irréversible.`)) {
            savedProfiles = savedProfiles.filter(profile => profile.profileName !== profileName); // Filtrer pour exclure le profil à supprimer
            localStorage.setItem('binanceProfiles', JSON.stringify(savedProfiles)); // Mettre à jour localStorage
            loadProfiles(); // Recharger et réafficher la liste des profils
            alert(`Profil "${profileName}" supprimé avec succès.`);

            // Optionnel: Déselectionner le profil et cacher le formulaire de code si le profil supprimé était sélectionné
            if (selectedProfileName === profileName) {
                selectedProfileName = null;
                profileLoginForm.style.display = 'none';
                document.querySelectorAll('.profile-list-item').forEach(item => item.classList.remove('active'));
            }
        } else {
            alert(`Suppression du profil "${profileName}" annulée.`);
        }
    }

    // --- FIN AJOUT - Fonctions handleEditProfile et handleDeleteProfile ---


    // --- Initialisation au chargement de la page ---

});