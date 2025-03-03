document
  .getElementById("registerProfileButton")
  .addEventListener("click", async (event) => {
    event.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const apiKey = document.getElementById("apiKey").value;
    const secretApiKey = document.getElementById("secretApiKey").value;

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, apiKey, secretApiKey }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log(data.message);
        // Rediriger ou afficher un message de succès
      } else {
        console.error(data.error);
        // Afficher un message d'erreur à l'utilisateur
      }
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error);
    }
   });
