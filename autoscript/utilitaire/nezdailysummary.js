const { EmbedBuilder } = require("discord.js");
const { DateTime } = require("luxon");
const cron = require("node-cron");
const NezStats = require("../../Sequelize/modèles/nezcount");

module.exports = function nezDailySummary(client) {
  const channelId = "1352351466328948786";

  cron.schedule(
    "59 23 * * *",
    async () => {
      console.log("⏰ Génération du résumé quotidien des nez...");

      const channel = await client.channels.fetch(channelId);
      if (!channel)
        return console.error("❌ Channel introuvable pour le résumé des nez.");

      const parisNow = DateTime.now().setZone("Europe/Paris");
      const today = parisNow.toFormat("yyyy-MM-dd");
      const yesterday = parisNow.minus({ days: 1 }).toFormat("yyyy-MM-dd");

      const todayStats = await NezStats.findAll({ where: { date: today } });
      const yesterdayStats = await NezStats.findAll({
        where: { date: yesterday },
      });

      const streakMap = {};
      yesterdayStats.forEach((stat) => {
        if (stat.count > 0) streakMap[stat.userId] = stat.streak || 1;
      });

      for (const stat of todayStats) {
        const wasInStreak = streakMap[stat.userId];
        const newStreak =
          stat.count > 0 && wasInStreak
            ? wasInStreak + 1
            : stat.count > 0
            ? 1
            : 0;
        await stat.update({ streak: newStreak });
      }

      const sorted = todayStats.sort((a, b) => b.count - a.count).slice(0, 10);
      const leaderboard = await Promise.all(
        sorted.map(async (s, i) => {
          const user = await client.users.fetch(s.userId);
          const flames =
            s.streak >= 3 ? " 🔥".repeat(Math.min(s.streak, 5)) : "";
          return `**#${i + 1}** - ${user.username} : \`${
            s.count
          } nez\`${flames}`;
        })
      );

      const embed = new EmbedBuilder()
        .setTitle("👃 Classement quotidien des NEZ")
        .setDescription(leaderboard.join("\n") || "Aucun nez aujourd’hui !")
        .setColor(0xffc107)
        .setFooter({ text: `Date : ${today}` })
        .setTimestamp();

      await channel.send({ embeds: [embed] });

      console.log("✅ Résumé quotidien des nez envoyé.");
    },
    {
      timezone: "Europe/Paris",
    }
  );
};
