// js/login/login.js
import { initDashboard } from "../dashboard/dashboard.js";

document.addEventListener("DOMContentLoaded", () => {
  const loginFormContainer = document.getElementById("loginFormContainer");
  const dashboardContainer = document.getElementById("dashboard");
  const assetInfoPageContainer = document.getElementById("assetInfoPage");
  const accountInfoDiv = document.getElementById("account-info");
  const accountBalanceDiv = document.getElementById("account-balance");
  const editProfileContainer = document.getElementById("editProfileContainer");
  const profileListContainer = document.getElementById("profileListContainer");
  const profileButtonsContainer = document.getElementById(
    "profileButtonsContainer"
  );
  const noProfilesMessage = document.getElementById("noProfilesMessage");
  const profileLoginForm = document.getElementById("profileLoginForm");
  const connectProfileButton = document.getElementById("connectProfileButton");
  const createProfileForm = document.getElementById("createProfileForm");
  const logoutButton = document.getElementById("logoutButton");
  const showCreateProfileButton = document.getElementById(
    "showCreateProfileButton"
  );
  const createProfileContainer = document.getElementById(
    "createProfileContainer"
  );
  const editProfileForm = document.getElementById("editProfileForm");
  const loginSection = document.getElementById("loginSection");

  const backToLoginButton = document.createElement("button");
  backToLoginButton.textContent = "Retour à la connexion";
  backToLoginButton.classList.add("btn", "btn-secondary", "mt-3");
  backToLoginButton.id = "backToLoginButton";

  let savedProfiles = [];
  loadProfiles();

  let selectedProfileName = null;

  const rememberedProfileName = localStorage.getItem("rememberedProfileName");
  console.log(
    "Au chargement de la page, profil mémorisé trouvé dans localStorage :",
    rememberedProfileName
  );
  if (rememberedProfileName) {
    selectedProfileName = rememberedProfileName;
    loginFormContainer.style.display = "none";
    const selectedProfile = savedProfiles.find(
      (p) => p.profileName === rememberedProfileName
    );
    if (selectedProfile) {
      connectAutomatically(selectedProfile);
    } else {
      loginFormContainer.style.display = "block";
      profileButtonsContainer.style.display = "block";
      populateProfileDropdown();
    }
  }

  function loadProfiles() {
    console.log("loadProfiles() appelée");
    const profilesJSON = localStorage.getItem("binanceProfiles");
    savedProfiles = profilesJSON ? JSON.parse(profilesJSON) : [];
    console.log("Profils chargés depuis localStorage :", savedProfiles);

    if (savedProfiles.length > 0) {
      noProfilesMessage.style.display = "none";
      profileButtonsContainer.style.display = "block";
      populateProfileDropdown();
    } else {
      noProfilesMessage.style.display = "block";
      profileButtonsContainer.style.display = "none";
    }
  }

  function populateProfileDropdown() {
    console.log("populateProfileDropdown() appelée");
    profileButtonsContainer.innerHTML = "";

    const profileList = document.createElement("ul");
    profileList.classList.add("list-unstyled", "profile-list");

    savedProfiles.forEach((profile) => {
      const profileListItem = document.createElement("li");
      profileListItem.classList.add("profile-list-item");

      const profileLink = document.createElement("a");
      profileLink.href = "#";
      profileLink.textContent = profile.profileName;
      profileLink.classList.add("profile-list-link");

      profileLink.addEventListener("click", (event) => {
        event.preventDefault();
        selectedProfileName = profile.profileName;
        document
          .querySelectorAll(".profile-list-item")
          .forEach((item) => item.classList.remove("active"));
        profileListItem.classList.add("active");
        profileLoginForm.style.display = "block";
      });
      profileListItem.appendChild(profileLink);

      const actionsContainer = document.createElement("div");
      actionsContainer.classList.add("profile-actions");

      const editButton = document.createElement("button");
      editButton.classList.add(
        "btn",
        "btn-sm",
        "btn-outline-primary",
        "edit-profile-button",
        "icon-button"
      );
      editButton.innerHTML = '<i class="fas fa-pen"></i>';
      editButton.title = "Éditer le profil";
      editButton.addEventListener("click", (event) => {
        event.stopPropagation();
        event.preventDefault();
        handleEditProfile(profile.profileName);
      });
      actionsContainer.appendChild(editButton);

      const deleteButton = document.createElement("button");
      deleteButton.classList.add(
        "btn",
        "btn-sm",
        "btn-outline-danger",
        "delete-profile-button",
        "icon-button"
      );
      deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
      deleteButton.title = "Supprimer le profil";
      deleteButton.addEventListener("click", (event) => {
        event.stopPropagation();
        event.preventDefault();
        handleDeleteProfile(profile.profileName);
      });
      actionsContainer.appendChild(deleteButton);

      profileListItem.appendChild(actionsContainer);
      profileList.appendChild(profileListItem);
    });

    profileButtonsContainer.appendChild(profileList);
    profileButtonsContainer.style.display = "block";
  }

  createProfileForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const profileName = document.getElementById("newProfileName").value.trim();
    const profileCode = document.getElementById("newProfileCode").value.trim();
    const apiKey = document.getElementById("newApiKey").value.trim();
    const secretKey = document.getElementById("newSecretKey").value.trim();

    if (!profileName || !apiKey || !secretKey) {
      alert(
        "Veuillez remplir tous les champs obligatoires (Nom du Profil, Clé API et Clé Secrète)."
      );
      return;
    }

    const newProfile = {
      profileName: profileName,
      profileCode: profileCode,
      apiKey: apiKey,
      secretKey: secretKey,
      connectionType: "Testnet",
    };

    savedProfiles.push(newProfile);
    localStorage.setItem("binanceProfiles", JSON.stringify(savedProfiles));
    loadProfiles();
    alert(`Profil "${profileName}" enregistré avec succès.`);
    createProfileForm.reset();
    createProfileContainer.style.display = "none";
    handleBackToLogin();
  });
  if (showCreateProfileButton && createProfileContainer) {
    showCreateProfileButton.addEventListener("click", function () {
      createProfileContainer.appendChild(backToLoginButton);
      loginSection.style.display = "none";
      createProfileContainer.style.display = "block";
    });
  } else {
    console.error(
      "Bouton 'showCreateProfileButton' ou 'createProfileContainer' non trouvé dans le DOM. Vérifiez les IDs dans index.html."
    );
  }

  function handleBackToLogin() {
    loginSection.style.display = "block";
    createProfileContainer.style.display = "none";
    editProfileContainer.style.display = "none";
    loadProfiles();
  }
  if (backToLoginButton) {
    backToLoginButton.addEventListener("click", function () {
      handleBackToLogin();
    });
  } else {
    console.error(
      "Bouton 'backToLoginButton' non trouvé dans le DOM. Vérifiez les IDs dans index.html."
    );
  }

  connectProfileButton.addEventListener("click", async function (event) {
    event.preventDefault();
    const profileCodeInput = document
      .getElementById("profileCode")
      .value.trim();
    const rememberProfileCheckbox =
      document.getElementById("rememberProfile").checked;
    document.getElementById("assetActionsContainer").style.display = "block";
    document.querySelector(".dashboard-title").style.display = "block";

    if (!selectedProfileName) {
      alert(
        "Veuillez sélectionner un profil en cliquant sur un profil dans la liste."
      );
      return;
    }

    const selectedProfile = savedProfiles.find(
      (p) => p.profileName === selectedProfileName
    );
    if (!selectedProfile) {
      alert("Profil sélectionné non trouvé. Veuillez recharger la page.");
      return;
    }

    if (
      selectedProfile.profileCode &&
      profileCodeInput !== selectedProfile.profileCode
    ) {
      alert("Code de profil incorrect.");
      return;
    }

    const apiKey = selectedProfile.apiKey;
    const secretKey = selectedProfile.secretKey;

    if (!apiKey || !secretKey) {
      alert("Clés API ou secrète manquantes dans le profil sélectionné.");
      return;
    }

    try {
      const response = await axios.post("auth/connect", {
        apiKey: apiKey,
        secretKey: secretKey,
      });
      if (response.data.success) {
        loginFormContainer.style.display = "none";
        dashboardContainer.style.display = "block";
        assetInfoPageContainer.style.display = "none";
        initDashboard();

        if (rememberProfileCheckbox) {
          localStorage.setItem("rememberedProfileName", selectedProfileName);
        } else {
          localStorage.removeItem("rememberedProfileName");
        }
      } else {
        alert(
          `Échec de la connexion API REST avec le profil "${selectedProfile.profileName}": ${response.data.message}`
        );
        console.error("Erreur de connexion API REST (profil):", response.data);
        accountInfoDiv.textContent =
          "Erreur de connexion API (profil). Voir la console pour les détails.";
        accountBalanceDiv.innerHTML = "";
      }
    } catch (error) {
      console.error(
        "Erreur lors de la requête de connexion API REST (profil):",
        error
      );
      alert(
        "Erreur de connexion API REST (profil). Vérifiez la console pour plus de détails."
      );
      accountInfoDiv.textContent =
        "Erreur de connexion API (profil). Voir la console pour les détails.";
      accountBalanceDiv.innerHTML = "";
    }
  });
  if (logoutButton) {
    logoutButton.addEventListener("click", function () {
      localStorage.removeItem("rememberedProfileName");
      const dashboardContainer = document.getElementById("dashboard");
      const loginFormContainer = document.getElementById("loginFormContainer");
      const profileButtonsContainer = document.getElementById(
        "profileButtonsContainer"
      );

      if (dashboardContainer && loginFormContainer && profileButtonsContainer) {
        dashboardContainer.style.display = "none";
        loginFormContainer.style.display = "block";
        profileButtonsContainer.style.display = "block";
        const accountInfoDiv = document.getElementById("account-info");
        const accountBalanceDiv = document.getElementById("account-balance");
        if (accountInfoDiv && accountBalanceDiv) {
          accountInfoDiv.textContent = "";
          accountBalanceDiv.innerHTML = "";
        }

        alert("Déconnexion réussie.");
      } else {
        console.error(
          "Éléments HTML (dashboard, loginFormContainer, profileButtonsContainer) non trouvés. Vérifiez les IDs dans index.html."
        );
      }
    });
  } else {
    console.error(
      "Bouton 'logoutButton' non trouvé dans le DOM. Vérifiez l'ID dans index.html."
    );
  }

  async function connectAutomatically(profile) {
    const apiKey = profile.apiKey;
    const secretKey = profile.secretKey;
    document.getElementById("assetActionsContainer").style.display = "block";
    document.querySelector(".dashboard-title").style.display = "block";

    try {
      const response = await axios.post("auth/connect", {
        apiKey: apiKey,
        secretKey: secretKey,
      });

      if (response.data.success) {
        loginFormContainer.style.display = "none";
        dashboardContainer.style.display = "block";
        assetInfoPageContainer.style.display = "none";
        initDashboard();
      } else {
        loginFormContainer.style.display = "block";
        profileButtonsContainer.style.display = "block";
        populateProfileDropdown();
        accountInfoDiv.textContent =
          "Erreur de connexion API (profil). Voir la console pour les détails.";
        accountBalanceDiv.innerHTML = "";
      }
    } catch (error) {
      loginFormContainer.style.display = "block";
      profileButtonsContainer.style.display = "block";
      populateProfileDropdown();
      accountInfoDiv.textContent =
        "Erreur de connexion API (profil). Voir la console pour les détails.";
      accountBalanceDiv.innerHTML = "";
    }
  } // --- FIN AJOUT FIN - Fonctionnalité "Rester connecté" - Fonction connectAutomatically ---

  function handleEditProfile(profileName) {
    console.log("handleEditProfile appelée pour le profil :", profileName);
    // 1. Cacher tous les autres formulaires et containers
    loginFormContainer.style.display = "none";
    loginSection.style.display = "none";
    profileButtonsContainer.style.display = "none";
    createProfileContainer.style.display = "none";

    // 2. Afficher le formulaire d'édition
    editProfileContainer.style.display = "block";
    editProfileContainer.appendChild(backToLoginButton);

    // 3. Pré-remplir les champs du formulaire avec les données du profil à éditer
    const profileToEdit = savedProfiles.find(
      (p) => p.profileName === profileName
    );
    if (profileToEdit) {
      document.getElementById("editProfileName").value =
        profileToEdit.profileName;
      document.getElementById("editProfileCode").value =
        profileToEdit.profileCode;
      document.getElementById("editApiKey").value = profileToEdit.apiKey;
      document.getElementById("editSecretKey").value = profileToEdit.secretKey;
      // Optionnel : Gérer d'autres champs comme connectionType si besoin
    } else {
      console.error("Profil à éditer non trouvé :", profileName);
      alert("Profil à éditer non trouvé.");
      return; // Arrêter l'exécution de la fonction si le profil n'est pas trouvé
    }

    // 4. Gérer la soumission du formulaire d'édition
    editProfileForm.onsubmit = function (event) {
      event.preventDefault();
      const editedProfileName = document
        .getElementById("editProfileName")
        .value.trim();
      const editedProfileCode = document
        .getElementById("editProfileCode")
        .value.trim();
      const editedApiKey = document.getElementById("editApiKey").value.trim();
      const editedSecretKey = document
        .getElementById("editSecretKey")
        .value.trim();

      if (!editedProfileName || !editedApiKey || !editedSecretKey) {
        alert(
          "Veuillez remplir tous les champs obligatoires (Nom du Profil, Clé API et Clé Secrète)."
        );
        return;
      }

      // 5. Mettre à jour les données du profil dans savedProfiles
      const profileIndex = savedProfiles.findIndex(
        (p) => p.profileName === profileName
      );
      if (profileIndex > -1) {
        savedProfiles[profileIndex] = {
          profileName: editedProfileName,
          profileCode: editedProfileCode,
          apiKey: editedApiKey,
          secretKey: editedSecretKey,
          connectionType: "Testnet", // ou autre valeur si gérée dans le formulaire
        };
        localStorage.setItem("binanceProfiles", JSON.stringify(savedProfiles));
        alert(
          `Profil "${profileName}" modifié avec succès. Les changements ne seront effectifs qu'à la prochaine connexion.`
        );

        // 6. Réinitialiser l'affichage
        editProfileContainer.style.display = "none";
        loginFormContainer.style.display = "block";
        profileButtonsContainer.style.display = "block";
        handleBackToLogin(); // Recharger les profils pour mettre à jour l'affichage
      } else {
        console.error(
          "Erreur : Profil à éditer non trouvé dans la liste des profils."
        );
        alert("Erreur lors de la modification du profil.");
      }
    };
  }

  function handleDeleteProfile(profileName) {
    console.log("handleDeleteProfile appelée pour le profil :", profileName);
    if (
      confirm(`Êtes-vous sûr de vouloir supprimer le profil "${profileName}" ?`)
    ) {
      savedProfiles = savedProfiles.filter(
        (p) => p.profileName !== profileName
      );
      localStorage.setItem("binanceProfiles", JSON.stringify(savedProfiles));
      loadProfiles();
      alert(`Profil "${profileName}" supprimé avec succès.`);
    }
  }
  // --- FIN AJOUT - Fonctions handleEditProfile et handleDeleteProfile ---
});
