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
      if (isPaused) return; // Si en pause, ne vérifie pas l'heure

      const now = new Date();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const currentTime = `${hours}:${minutes}`;

      // Vérifie si l'heure et les minutes sont identiques (ex: 13:13) et si le message n'a pas déjà été envoyé
      if (hours === minutes && lastSentTime !== currentTime) {
        try {
          await channel.send("nez");
          console.log(`✅ Message "nez" envoyé à ${currentTime}`);
          lastSentTime = currentTime; // Évite les doublons

          isPaused = true; // Active la pause
          console.log("⏸️ Pause nez activée pour 30 minutes...");

          // Attendre 30 minutes avant de reprendre la vérification
          setTimeout(() => {
            isPaused = false;
            console.log("▶️ Pause terminée, reprise de la vérification.");
          }, 30 * 60 * 1000);
        } catch (error) {
          console.error("❌ Erreur lors de l'envoi du message :", error);
        }
      }
    }, 1000); // Vérifie chaque seconde
  } catch (error) {
    console.error("❌ Erreur lors de la récupération du salon :", error);
  }
};
