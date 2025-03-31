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
      if (isPaused) return;

      const now = new Date();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const seconds = now.getSeconds();
      const currentTime = `${hours}:${minutes}`;

      if (hours === minutes && seconds === 0 && lastSentTime !== currentTime) {
        try {
          await channel.send("nez");
          console.log(`✅ Message "nez" envoyé à ${currentTime}`);
          lastSentTime = currentTime;

          isPaused = true;
          console.log("⏸️ Pause de 20 minutes activée");

          setTimeout(() => {
            isPaused = false;
            console.log("▶️ Pause terminée, reprise des vérifications.");
          }, 20 * 60 * 1000);
        } catch (error) {
          console.error("❌ Erreur lors de l'envoi du message :", error);
        }
      }
    }, 1000); // Vérification chaque seconde
  } catch (error) {
    console.error("❌ Erreur lors de la récupération du salon :", error);
  }
};
