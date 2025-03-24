module.exports = async function bjorn(client) {
  const channelId = "1332366656428572693"; // Remplace par l'ID du salon

  try {
    const channel = await client.channels.fetch(channelId);
    if (!channel) {
      console.error("❌ Salon introuvable !");
      return;
    }

    let lastSentTime = null;
    let isPaused = false;

    setInterval(async () => {
      if (isPaused) return; // Bloque l'exécution si en pause

      const now = new Date();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const currentTime = `${hours}:${minutes}`;

      // Vérifie si l'heure et les minutes sont identiques (ex: 13:13)
      if (hours === minutes && lastSentTime !== currentTime) {
        try {
          await channel.send("nez");
          console.log(`✅ Message "nez" envoyé à ${currentTime}`);
          lastSentTime = currentTime; // Empêche les doublons pour cette heure

          isPaused = true; // Active la pause
          console.log("⏸️ Pause de 20 minutes activée");

          // Attendre 20 minutes avant de permettre un nouvel envoi
          setTimeout(() => {
            isPaused = false;
            console.log("▶️ Pause terminée, reprise des vérifications.");
          }, 20 * 60 * 1000); // 20 minutes en millisecondes
        } catch (error) {
          console.error("❌ Erreur lors de l'envoi du message :", error);
        }
      }
    }, 3000); // Vérifie toutes les 3 secondes pour optimiser les performances
  } catch (error) {
    console.error("❌ Erreur lors de la récupération du salon :", error);
  }
};
