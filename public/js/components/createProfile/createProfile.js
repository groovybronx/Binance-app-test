// public/js/components/createProfile/createProfile.js

function initCreateProfileComponent(saveProfile, populateProfileDropdown) {
    // Paramètres :
    // - saveProfile: fonction pour enregistrer un profil (définie dans login.js)
    // - populateProfileDropdown: fonction pour peupler la liste des profils (définie dans login.js)

    console.log("Fonction initCreateProfileComponent() appelée (depuis components/createProfile/createProfile.js)");

    const createProfileForm = document.getElementById('createProfileForm');
    const createProfileContainer = document.getElementById('createProfileContainer');

    if (!createProfileForm) {
        console.error("Erreur: Element #createProfileForm non trouvé dans le DOM (createProfileComponent.js).");
        return;
    }
    if (!createProfileContainer) {
        console.error("Erreur: Element #createProfileContainer non trouvé dans le DOM (createProfileComponent.js).");
        return;
    }

    // --- Gestion du formulaire createProfileForm (Créer un Nouveau Profil) ---
    createProfileForm.addEventListener('submit', function (event) {
        console.log("DEBUG - createProfileForm submit event listener ENTERED! (from components/createProfile/createProfile.js)");
        event.preventDefault();
        const profileName = document.getElementById('profileName').value.trim();
        const profileCode = document.getElementById('createProfileCode').value.trim();
        const apiKey = document.getElementById('createProfileApiKey').value.trim();
        const secretKey = document.getElementById('createProfileSecretKey').value.trim();

        console.log("DEBUG - Valeurs des champs du formulaire de création AVANT validation (from components/createProfile/createProfile.js):");
        console.log("Nom du Profil:", profileName);
        console.log("Clé API Testnet:", apiKey);
        console.log("Clé Secrète Testnet:", secretKey);

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

        saveProfile(newProfile); // Utilise la fonction saveProfile passée en paramètre
        populateProfileDropdown(); // Utilise la fonction populateProfileDropdown passée en paramètre

        alert(`Profil "${profileName}" enregistré avec succès.`);
        createProfileForm.reset();
        createProfileContainer.style.display = 'none';
    });
    // --- Fin Gestion du formulaire createProfileForm (Créer un Nouveau Profil) ---

}

// --- N'oubliez pas d'exporter la fonction initCreateProfileComponent pour pouvoir l'importer et l'utiliser ailleurs ---
export { initCreateProfileComponent };