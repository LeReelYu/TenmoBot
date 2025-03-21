module.exports = async function bjorn(client) {
  const channelId = "1332366656428572693"; // Remplace par l'ID du salon
  const nezTimes = [
    "00:00",
    "01:01",
    "02:02",
    "03:03",
    "04:04",
    "05:05",
    "06:06",
    "07:07",
    "08:08",
    "09:09",
    "10:10",
    "11:11",
    "12:12",
    "13:13",
    "14:14",
    "15:15",
    "16:16",
    "17:17",
    "18:18",
    "19:19",
    "20:20",
    "21:21",
    "22:22",
    "23:23",
  ]; // Heures où le bot envoie "nez"

  try {
    const channel = await client.channels.fetch(channelId);
    if (!channel) {
      console.error("Salon introuvable !");
      return;
    }

    let lastSentTime = null;
    let isPaused = false;

    setInterval(async () => {
      if (isPaused) return; // Si le bot est en pause, il ne vérifie pas l'heure

      const now = new Date();
      const currentTime = now.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      // Vérifie si l'heure actuelle est dans la liste et si le message n'a pas déjà été envoyé pour cette minute
      if (nezTimes.includes(currentTime) && lastSentTime !== currentTime) {
        try {
          await channel.send("nez");
          console.log(`✅ Message "nez" envoyé à ${currentTime}`);
          lastSentTime = currentTime; // Empêche les envois multiples dans la même minute

          isPaused = true; // Met le bot en pause
          console.log("⏸️ Pause activée pour 30 minutes...");

          // Attendre 30 minutes (30 * 60 * 1000 ms) avant de reprendre la vérification
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
