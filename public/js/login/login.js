document.addEventListener('DOMContentLoaded', () => {
    console.log("login.js initialisation commencée.");

    // Initialisation des éléments du DOM
    const profileListContainer = document.getElementById('profileListContainer');
    const profileLoginForm = document.getElementById('profileLoginForm');
    const profileLoginFormInner = document.getElementById('profileLoginFormInner');
    const profileCode = document.getElementById('profileCode');
    const profileApiKey = document.getElementById('profileApiKey');
    const profileSecretKey = document.getElementById('profileSecretKey');
    const rememberProfile = document.getElementById('rememberProfile');
    const connectProfileButton = document.getElementById('connectProfileButton');
    const showCreateProfileButton = document.getElementById('showCreateProfileButton');
    const createProfileContainer = document.getElementById('createProfileContainer');

    // Chargement initial des profils
    loadProfiles();

    // Vérification du profil mémorisé
    const rememberedProfile = localStorage.getItem('rememberedProfile');
    if (rememberedProfile) {
        console.log("Au chargement de la page, profil mémorisé trouvé dans localStorage :", rememberedProfile);
        connectAutomatically(rememberedProfile);
    }

    // Event listeners
    if (profileLoginFormInner) {
        profileLoginFormInner.addEventListener('submit', handleLogin);
    }

    if (showCreateProfileButton) {
        showCreateProfileButton.addEventListener('click', toggleCreateProfileForm);
    }

    console.log("login.js initialisation terminée.");
});

function loadProfiles() {
    console.log("login.js: loadProfiles() appelée");
    const profiles = JSON.parse(localStorage.getItem('profiles')) || [];
    console.log("login.js: Profils chargés depuis localStorage :", profiles);
    populateProfileDropdown(profiles);
}

function populateProfileDropdown(profiles) {
    console.log("login.js: populateProfileDropdown() appelée");
    const profileButtonsContainer = document.getElementById('profileButtonsContainer');
    const noProfilesMessage = document.getElementById('noProfilesMessage');

    if (profileButtonsContainer) {
        profileButtonsContainer.innerHTML = '';

        if (profiles.length === 0) {
            if (noProfilesMessage) noProfilesMessage.style.display = 'block';
        } else {
            if (noProfilesMessage) noProfilesMessage.style.display = 'none';
            profiles.forEach(profile => {
                console.log("login.js: Traitement du profil:", profile.name);
                const profileButton = document.createElement('button');
                profileButton.textContent = profile.name;
                profileButton.classList.add('btn', 'btn-outline-primary', 'me-2', 'mb-2');
                profileButton.addEventListener('click', () => selectProfile(profile.name));

                const editButton = createIconButton('✏️', () => editProfile(profile.name));
                const deleteButton = createIconButton('🗑️', () => deleteProfile(profile.name));

                const buttonGroup = document.createElement('div');
                buttonGroup.classList.add('btn-group', 'me-2', 'mb-2');
                buttonGroup.appendChild(profileButton);
                buttonGroup.appendChild(editButton);
                buttonGroup.appendChild(deleteButton);

                profileButtonsContainer.appendChild(buttonGroup);
            });
        }
    }
    console.log("login.js: Fin de populateProfileDropdown()");
}

function createIconButton(icon, onClick) {
    const button = document.createElement('button');
    button.innerHTML = icon;
    button.classList.add('btn', 'btn-outline-secondary');
    button.addEventListener('click', onClick);
    return button;
}

function selectProfile(profileName) {
    console.log("login.js: selectProfile appelée pour", profileName);
    const profiles = JSON.parse(localStorage.getItem('profiles')) || [];
    const selectedProfile = profiles.find(p => p.name === profileName);

    if (selectedProfile) {
        document.getElementById('profileApiKey').value = selectedProfile.apiKey || '';
        document.getElementById('profileSecretKey').value = selectedProfile.secretKey || '';
        if (selectedProfile.code) {
            document.getElementById('profileCode').value = selectedProfile.code;
        }
    }
}

async function handleLogin(event) {
    event.preventDefault();
    console.log("login.js: handleLogin appelée");

    const apiKey = document.getElementById('profileApiKey').value;
    const secretKey = document.getElementById('profileSecretKey').value;
    const code = document.getElementById('profileCode').value;
    const rememberProfile = document.getElementById('rememberProfile').checked;

    try {
        const response = await axios.post('/auth/connect', { apiKey, secretKey });
        console.log("login.js: Réponse de la requête de connexion:", response);

        if (response.data.success) {
            if (rememberProfile) {
                localStorage.setItem('rememberedProfile', JSON.stringify({ apiKey, secretKey, code }));
            }
            window.location.href = '/html/dashboard.html';
        } else {
            console.error('Échec de la connexion:', response.data.message);
            // Afficher un message d'erreur à l'utilisateur
        }
    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        // Afficher un message d'erreur à l'utilisateur
    }
}

async function connectAutomatically(profileName) {
    console.log("login.js: Fonction connectAutomatically appelée pour le profil :", profileName);

    const profiles = JSON.parse(localStorage.getItem('profiles')) || [];
    const profile = profiles.find(p => p.name === profileName);

    if (!profile) {
        console.error("Profil non trouvé pour la connexion automatique");
        return;
    }

    console.log("login.js: Debugging - getElementById results:");
    console.log("login.js: profileApiKey element:", document.getElementById('profileApiKey'));
    console.log("login.js: profileSecretKey element:", document.getElementById('profileSecretKey'));
    console.log("login.js: profileCode element:", document.getElementById('profileCode'));

    document.getElementById('profileApiKey').value = profile.apiKey;
    document.getElementById('profileSecretKey').value = profile.secretKey;
    if (profile.code) {
        document.getElementById('profileCode').value = profile.code;
    }

    try {
        const response = await axios.post('/auth/connect', { 
            apiKey: profile.apiKey, 
            secretKey: profile.secretKey 
        });
        console.log("login.js: Réponse de la requête axios.post('auth/connect') dans connectAutomatically :", response);

        if (response.data.success) {
            window.location.href = '/html/dashboard.html';
        } else {
            console.error('Échec de la connexion automatique:', response.data.message);
            // Afficher un message d'erreur à l'utilisateur
        }
    } catch (error) {
        console.error('Erreur lors de la connexion automatique:', error);
        // Afficher un message d'erreur à l'utilisateur
    }
}

function toggleCreateProfileForm() {
    const createProfileContainer = document.getElementById('createProfileContainer');
    if (createProfileContainer) {
        createProfileContainer.style.display = createProfileContainer.style.display === 'none' ? 'block' : 'none';
    }
}

function editProfile(profileName) {
    console.log("Édition du profil:", profileName);
    // Implémentez la logique d'édition ici
}

function deleteProfile(profileName) {
    console.log("Suppression du profil:", profileName);
    const profiles = JSON.parse(localStorage.getItem('profiles')) || [];
    const updatedProfiles = profiles.filter(p => p.name !== profileName);
    localStorage.setItem('profiles', JSON.stringify(updatedProfiles));
    loadProfiles();
}