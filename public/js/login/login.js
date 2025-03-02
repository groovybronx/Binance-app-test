// public/js/login/login.js
// login.js - Gestion des profils de connexion (VERSION LISTES A PUCES + ICONES EDIT/DELETE)

import { initCreateProfileComponent } from '../components/createProfile/createProfile.js'; // IMPORT DU COMPOSANT createProfileComponent

// --- Déclaration des éléments DOM (UNE SEULE FOIS en haut du fichier) ---
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
const createProfileForm = document.getElementById('createProfileForm'); // Déclaration, même si le composant s'en occupe maintenant
const logoutButton = document.getElementById('logoutButton'); // Bouton "Déconnexion"
const showCreateProfileButton = document.getElementById('showCreateProfileButton'); // Bouton "Créer un Nouveau Profil"
const createProfileContainer = document.getElementById('createProfileContainer'); // Déclaration, même si le composant s'en occupe maintenant
const profileNameDropdown = document.getElementById('profileNameDropdown');


let savedProfiles; // Déclaration de savedProfiles en portée globale (script)

document.addEventListener('DOMContentLoaded', () => {
    savedProfiles = loadProfiles(); // CHARGER les profils UNE SEULE FOIS au démarrage, DANS le DOMContentLoaded
    populateProfileDropdown(); // Peupler la liste des profils après le chargement

    // --- INITIALISER le composant createProfileComponent et LUI PASSER les fonctions saveProfile et populateProfileDropdown EN PARAMÈTRES ---
    initCreateProfileComponent(saveProfile, populateProfileDropdown); // INITIALISATION DU COMPOSANT createProfileComponent et PASSAGE DES FONCTIONS EN PARAMÈTRES

    let selectedProfileName = null;
    let currentProfileName = null;

   


    console.log("dashboard.js initialisation terminée.");



    // --- Fonctionnalité "Rester connecté" ---
    const rememberedProfileName = localStorage.getItem('rememberedProfileName');
    console.log("Au chargement de la page, profil mémorisé trouvé dans localStorage :", rememberedProfileName);
    if (rememberedProfileName) {
        selectedProfileName = rememberedProfileName; // Définir le profil mémorisé comme profil sélectionné
        loginFormContainer.style.display = 'none'; // Cacher le formulaire de login principal en attendant la connexion auto

        const selectedProfile = getProfile(rememberedProfileName);
        if (selectedProfile) {
            // Tentative de connexion automatique avec le profil mémorisé
            connectAutomatically(selectedProfile.profileName);
        } else {
            // Profil mémorisé non trouvé (supprimé ?), revenir à l'affichage normal de login
            loginFormContainer.style.display = 'block';
            profileButtonsContainer.style.display = 'block';
            populateProfileDropdown();
        }
    }
    // --- Fin Fonctionnalité "Rester connecté" ---


    function loadProfiles() {
        console.log("loadProfiles() appelée");
        const profilesJSON = localStorage.getItem('binanceProfiles');
        const loadedProfiles = profilesJSON ? JSON.parse(profilesJSON) : [];
        console.log("Profils chargés depuis localStorage :", loadedProfiles);
        return loadedProfiles;
    }


    function populateProfileDropdown() {
        console.log("populateProfileDropdown() appelée (pour listes avec icônes Edit/Delete)");
        profileButtonsContainer.innerHTML = '';

        const profileList = document.createElement('ul');
        profileList.classList.add('list-unstyled', 'profile-list');


        if (savedProfiles.length === 0) { // Utiliser savedProfiles chargée au démarrage
            noProfilesMessage.style.display = 'block';
            profileButtonsContainer.style.display = 'none';
            return;
        } else {
            noProfilesMessage.style.display = 'none';
            profileButtonsContainer.style.display = 'block';
        }


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

            const actionsContainer = document.createElement('div');
            actionsContainer.classList.add('profile-actions');

            const editButton = document.createElement('button');
            editButton.classList.add('btn', 'btn-sm', 'btn-outline-primary', 'edit-profile-button', 'icon-button');
            editButton.innerHTML = '<i class="fas fa-pen"></i>';
            editButton.title = 'Éditer le profil';
            editButton.addEventListener('click', (event) => {
                event.stopPropagation();
                event.preventDefault();
                handleEditProfile(profile.profileName);
            });
            actionsContainer.appendChild(editButton);

            const deleteButton = document.createElement('button');
            deleteButton.classList.add('btn', 'btn-sm', 'btn-outline-danger', 'delete-profile-button', 'icon-button');
            deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
            deleteButton.title = 'Supprimer le profil';
            deleteButton.addEventListener('click', (event) => {
                event.stopPropagation();
                event.preventDefault();
                handleDeleteProfile(profile.profileName);
            });
            actionsContainer.appendChild(deleteButton);

            profileListItem.appendChild(actionsContainer);
            profileList.appendChild(profileListItem);
        });

        profileButtonsContainer.appendChild(profileList);
        profileButtonsContainer.style.display = 'block';
        console.log("Fin de populateProfileDropdown() (pour listes avec icônes Edit/Delete)");
    }


    connectProfileButton.addEventListener('click', async function (event) {
        event.preventDefault();
        const profileCodeInput = document.getElementById('profileCode').value.trim();
        const rememberProfileCheckbox = document.getElementById('rememberProfile').checked;

        if (!selectedProfileName) {
            alert('Veuillez sélectionner un profil en cliquant sur un profil dans la liste.');
            return;
        }

        const selectedProfile = getProfile(selectedProfileName);
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
                loginFormContainer.style.display = 'none';
                dashboardContainer.style.display = 'block';
                assetInfoPageContainer.style.display = 'none';


                if (typeof initWebSocket === 'function') {
                    initWebSocket();
                } else {
                    console.error("Fonction initWebSocket non définie dans le scope global.");
                }


                if (rememberProfileCheckbox) {
                    localStorage.setItem('rememberedProfileName', selectedProfileName);
                    console.log("Rester connecté coché. Profil enregistré dans localStorage :", selectedProfileName);
                } else {
                    localStorage.removeItem('rememberedProfileName');
                    console.log("Rester connecté non coché. Profil supprimé de localStorage.");
                }


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



    if (showCreateProfileButton && createProfileContainer) {
        showCreateProfileButton.addEventListener('click', function () {
            console.log("Bouton 'Créer un Nouveau Profil' cliqué.");
            createProfileContainer.style.display = (createProfileContainer.style.display === 'none' || createProfileContainer.style.display === '') ? 'block' : 'none';
        });
    } else {
        console.error("Bouton 'showCreateProfileButton' ou 'createProfileContainer' non trouvé dans le DOM. Vérifiez les IDs dans index.html.");
    }


    async function connectAutomatically(profileName) {
        console.log("Fonction connectAutomatically appelée pour le profil :", profileName);
        const storedProfile = getProfile(profileName);
        if (storedProfile) {

            currentProfileName = profileName;

            console.log("Debugging - getElementById results:");
            console.log("profileApiKey element:", document.getElementById('profileApiKey'));
            console.log("profileSecretKey element:", document.getElementById('profileSecretKey'));
            console.log("profileCode element:", document.getElementById('profileCode'));


            document.getElementById('profileApiKey').value = storedProfile.apiKey;
            document.getElementById('profileSecretKey').value = storedProfile.secretKey;
            document.getElementById('profileCode').value = storedProfile.profileCode;


            try {
                const response = await axios.post('/auth/connect', {
                    apiKey: storedProfile.apiKey,
                    secretKey: storedProfile.secretKey,
                    profileCode: storedProfile.profileCode,
                    profileName: profileName
                });

                console.log("Réponse de la requête axios.post('auth/connect') dans connectAutomatically :", response);

                if (response.data && response.data.success) {
                    updateConnectionStatus(true, 'Connexion automatique réussie (REST API).', 'alert-success');
                    memorizeCurrentProfile(profileName);

                    initWebSocket();
                    loadFavorites();

                } else {
                    updateConnectionStatus(false, `Erreur de connexion automatique (REST API): ${response.data ? response.data.message : 'erreur inconnue'}`, 'alert-danger');
                    console.error("Erreur de connexion automatique (REST API):", response.data);
                }


            } catch (error) {
                updateConnectionStatus(false, `Erreur lors de la requête de connexion API REST automatique (profil): ${error.message}`, 'alert-danger');
                console.error("Erreur lors de la requête de connexion API REST automatique (profil):", error);
            }


        } else {
            console.warn("Profil mémorisé introuvable, connexion automatique impossible.");
        }
    }


    function handleEditProfile(profileName) {
        console.log("handleEditProfile appelée pour le profil :", profileName);
        alert(`Fonctionnalité d'édition du profil "${profileName}" à implémenter.`);
    }


    function handleDeleteProfile(profileName) {
        console.log("handleDeleteProfile appelée pour le profil :", profileName);

        if (confirm(`Êtes-vous sûr de vouloir supprimer le profil "${profileName}" ? Cette action est irréversible.`)) {
            savedProfiles = savedProfiles.filter(profile => profile.profileName !== profileName); // Utiliser savedProfiles en mémoire
            localStorage.setItem('binanceProfiles', JSON.stringify(savedProfiles));
            populateProfileDropdown();
            alert(`Profil "${profileName}" supprimé avec succès.`);


            if (selectedProfileName === profileName) {
                selectedProfileName = null;
                profileLoginForm.style.display = 'block';
                document.querySelectorAll('.profile-list-item').forEach(item => item.classList.remove('active'));
            }
        }
    }


    function getProfile(profileName) {
        return savedProfiles.find(profile => profile.profileName === profileName); // Utiliser savedProfiles en mémoire
    }


    function saveProfile(profileData) {
        savedProfiles.push(profileData);    // Ajouter au tableau en mémoire
        localStorage.setItem('binanceProfiles', JSON.stringify(savedProfiles));
    }


    function deleteProfile(profileName) {
        savedProfiles = savedProfiles.filter(profile => profile.profileName !== profileName); // Utiliser savedProfiles en mémoire
        localStorage.setItem('binanceProfiles', JSON.stringify(savedProfiles));
    }


    function memorizeCurrentProfile(profileName) {
        localStorage.setItem('rememberedProfileName', profileName);
    }




});