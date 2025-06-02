const { DateTime } = require("luxon");

module.exports = async function bjorn(client) {
  const channelId = "1332366656428572693";

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

      const now = DateTime.now().setZone("Europe/Paris");
      const hours = now.hour.toString().padStart(2, "0");
      const minutes = now.minute.toString().padStart(2, "0");
      const currentTime = `${hours}:${minutes}`;

      if (hours === minutes && lastSentTime !== currentTime) {
        try {
          await channel.send("nez");
          console.log(`✅ Message "nez" envoyé à ${currentTime}`);
          lastSentTime = currentTime;

          isPaused = true;
          console.log("⏸️ Pause de 20 minutes activée");

          setTimeout(() => {
            isPaused = false;
            console.log("▶️ Pause terminée, reprise des vérifications.");
          }, 20 * 60 * 1000); // 20 minutes
        } catch (error) {
          console.error("❌ Erreur lors de l'envoi du message :", error);
        }
      }
    }, 60 * 1000); // Vérifie toutes les minutes (et pas 30 secondes)
  } catch (error) {
    console.error("❌ Erreur lors de la récupération du salon :", error);
  }
};
