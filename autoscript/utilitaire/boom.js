const { EmbedBuilder } = require("discord.js");
const Shroom = require("../../Sequelize/modèles/champignongue/Shroom");
const Scout = require("../../Sequelize/modèles/champignongue/Scout");

module.exports = (client) => {
  client.on("messageCreate", async (message) => {
    if (message.author.bot || !message.guild) return;

    const channelId = message.channel.id;

    const shroom = await Shroom.findOne({ where: { channelId } });
    if (!shroom) return;

    try {
      await message.delete();

      const xpGain = Math.floor(Math.random() * 15) + 1;

      const [scout] = await Scout.findOrCreate({
        where: { userId: shroom.userId },
      });
      await scout.increment("xp", { by: xpGain });

      await shroom.destroy();

      const boomEmbed = new EmbedBuilder()
        .setTitle("💥 BOOM ! Champignon déclenché !")
        .setDescription(
          `Le message de **${message.author.username}** a déclenché un champignon 💣\n` +
            `👉 <@${shroom.userId}> gagne **${xpGain} XP** pour son piège bien placé.`
        )
        .setColor(0xff0000)
        .setFooter({ text: "Mini-jeu : Le meilleur Scout de Bandle 🍄" })
        .setTimestamp();

      await message.channel.send({ embeds: [boomEmbed] });
    } catch (error) {
      console.error("Erreur dans boom.js :", error);
    }
  });
};
