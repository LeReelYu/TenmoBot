const { DateTime } = require("luxon");
const NezStats = require("../../Sequelize/modèles/nezcount");

module.exports = (client) => {
  const VALID_CHANNEL_ID = "1332366656428572693";

  client.on("messageCreate", async (message) => {
    if (message.author.bot || message.channel.id !== VALID_CHANNEL_ID) return;

    const now = DateTime.now().setZone("Europe/Paris");

    const hour = now.hour;
    const minute = now.minute;

    if (hour !== minute) return;

    const content = message.content.trim().toLowerCase();
    if (content !== "nez") return;

    const userId = message.author.id;
    const date = now.toFormat("yyyy-MM-dd");

    try {
      const [record] = await NezStats.findOrCreate({
        where: { userId, date },
      });

      await record.increment("count");
      console.log(
        `👃 Nez enregistré pour ${message.author.username} à ${hour}:${minute}`
      );
    } catch (err) {
      console.error("❌ Erreur lors de l'enregistrement du nez :", err);
    }
  });
};
