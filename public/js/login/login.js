document.getElementById('connectProfileButton').addEventListener('click', async (event) => {
    event.preventDefault();
    const profileName = document.getElementById('profileName').value;
    const response = await fetch('/api/auth/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileName })
    });
    const data = await response.json();
    console.log(data.message);
});

// Ajoutez un gestionnaire similaire pour l'enregistrement de profil