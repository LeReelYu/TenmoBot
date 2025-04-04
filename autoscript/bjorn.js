const { DateTime } = require("luxon");

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

      // Heure locale dans le fuseau "Europe/Paris"
      const now = DateTime.now().setZone("Europe/Paris");

      const hours = now.hour.toString().padStart(2, "0");
      const minutes = now.minute.toString().padStart(2, "0");
      const seconds = now.second;
      const currentTime = `${hours}:${minutes}`;

      // Vérifie si l'heure et les minutes sont identiques (ex: 14:14) et que c'est la première fois à cette minute
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
          }, 20 * 60 * 1000); // 20 minutes de pause
        } catch (error) {
          console.error("❌ Erreur lors de l'envoi du message :", error);
        }
      }
    }, 30000); // Vérification toutes les 30 secondes
  } catch (error) {
    console.error("❌ Erreur lors de la récupération du salon :", error);
  }
};
