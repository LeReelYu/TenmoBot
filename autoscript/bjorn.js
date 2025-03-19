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
    setInterval(async () => {
      const now = new Date();
      const currentTime = now.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      if (nezTimes.includes(currentTime)) {
        try {
          await channel.send("nez");
          console.log(`Message "nez" envoyé à ${currentTime}`);
        } catch (error) {
          console.error("Erreur lors de l'envoi du message:", error);
        }
      }
    }, 60 * 1000); // Vérifie toutes les minutes
  } catch (error) {
    console.error("Erreur lors de la récupération du salon :", error);
  }
};
