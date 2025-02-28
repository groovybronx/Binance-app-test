document.addEventListener('DOMContentLoaded', () => {
    // login.js - Gestion des profils de connexion (VERSION BOUTONS)

    const loginFormContainer = document.getElementById('loginFormContainer');
    const dashboardContainer = document.getElementById('dashboard');
    const assetInfoPageContainer = document.getElementById('assetInfoPage');
    const accountInfoDiv = document.getElementById('account-info');
    const accountBalanceDiv = document.getElementById('account-balance');

    const profileListContainer = document.getElementById('profileListContainer');
    const profileButtonsContainer = document.getElementById('profileButtonsContainer'); // Container pour les boutons de profil
    const noProfilesMessage = document.getElementById('noProfilesMessage');
    const profileLoginForm = document.getElementById('profileLoginForm');
    const connectProfileButton = document.getElementById('connectProfileButton'); // Bouton "Se Connecter"
    const createProfileForm = document.getElementById('createProfileForm');
    let savedProfiles = [];
    let selectedProfileName = null;

    // --- AJOUTER CE CODE ICI ---
    const createProfileContainer = document.getElementById('createProfileContainer');
    const showCreateProfileButton = document.getElementById('showCreateProfileButton');

    showCreateProfileButton.addEventListener('click', function() {
        createProfileContainer.style.display = 'block'; // Afficher le formulaire de création de profil
    });
    // --- FIN DE L'AJOUT ---


    function loadProfiles() {
        console.log("loadProfiles() appelée");
        const profilesJSON = localStorage.getItem('binanceProfiles');
        savedProfiles = profilesJSON ? JSON.parse(profilesJSON) : [];
        console.log("Profils chargés depuis localStorage :", savedProfiles);

        if (savedProfiles.length > 0) {
            noProfilesMessage.style.display = 'none';
            profileButtonsContainer.style.display = 'block'; // Afficher le container des boutons
            populateProfileDropdown();
        } else {
            noProfilesMessage.style.display = 'block';
            profileButtonsContainer.style.display = 'none'; // Cacher le container des boutons s'il n'y a pas de profils
        }
    }


    function populateProfileDropdown() {
        console.log("populateProfileDropdown() appelée (pour boutons)");
        profileButtonsContainer.innerHTML = ''; // Effacer les boutons existants
        savedProfiles.forEach(profile => {
            console.log("Traitement du profil (bouton):", profile.profileName);
            const profileButton = document.createElement('button'); // Créer un bouton au lieu d'un lien
            profileButton.classList.add('btn', 'btn-outline-secondary', 'profile-button'); // Classes Bootstrap pour le style
            profileButton.textContent = profile.profileName;
            profileButton.addEventListener('click', () => {
                selectedProfileName = profile.profileName;
                // Indiquer visuellement le profil sélectionné
                document.querySelectorAll('.profile-button').forEach(btn => btn.classList.remove('active'));
                profileButton.classList.add('active');
                profileLoginForm.style.display = 'block';
            });
            profileButtonsContainer.appendChild(profileButton);
        });
        profileButtonsContainer.style.display = 'block'; // Afficher le container des boutons maintenant qu'il est rempli
        console.log("Fin de populateProfileDropdown() (pour boutons)");
    }


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
    });


    connectProfileButton.addEventListener('click', async function (event) {
        event.preventDefault();
        const profileCodeInput = document.getElementById('profileCode').value.trim();
        const rememberProfileCheckbox = document.getElementById('rememberProfile').checked;

        if (!selectedProfileName) {
            alert('Veuillez sélectionner un profil en cliquant sur un bouton de profil.');
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
            const response = await axios.post('auth/connect', { apiKey: apiKey, secretKey: secretKey }); // Correction du chemin de la route vers /auth/connect
            if (response.data.success) {
                alert(`Connexion réussie avec le profil "${selectedProfile.profileName}".`);
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


    // --- Initialisation au chargement de la page ---
    loadProfiles();

});