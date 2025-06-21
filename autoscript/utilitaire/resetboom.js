const cron = require("node-cron");
const Scout = require("../../Sequelize/modèles/champignongue/Scout");

module.exports = (client) => {
  cron.schedule("0 9 * * 1", async () => {
    const topScout = await Scout.findOne({ order: [["xp", "DESC"]] });

    const guild = client.guilds.cache.get("1332345878094287009");
    const channel = guild.channels.cache.get("1332366656428572693");

    if (topScout) {
      await channel.send(
        `🏆 **Le meilleur scout de la semaine est <@${topScout.userId}> avec ${topScout.xp} XP !**\nBravo ! Le classement est maintenant réinitialisé.`
      );
    }

    await Scout.update({ xp: 0, isBannedUntilReset: false }, { where: {} });
  });
};
