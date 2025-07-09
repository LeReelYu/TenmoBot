const { Events, ChannelType } = require("discord.js");
const Blacklist = require("../Sequelize/modèles/blacklist");
const Taglist = require("../Sequelize/modèles/taglist");

const LOG_CHANNEL_ID = "1332346986111832086";

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member) {
    try {
      const guild = member.guild;

      const blEntry = await Blacklist.findOne({ where: { userID: member.id } });
      if (blEntry) {
        await member.ban({
          reason: `Blacklisté : ${blEntry.reason || "Aucune raison fournie"}`,
        });

        const logChannel = await guild.channels
          .fetch(LOG_CHANNEL_ID)
          .catch(() => null);
        if (logChannel && logChannel.type === ChannelType.GuildText) {
          logChannel.send(
            `🚫 **${
              member.user.tag
            }** a été automatiquement banni.\n📌 Raison : **Blacklist**\n📝 Détail : ${
              blEntry.reason || "Aucune raison fournie"
            }`
          );
        }

        console.log(`🔨 ${member.user.tag} banni (Blacklist ID)`);
        return;
      }

      const username = member.user.username.toLowerCase();
      const tags = await Taglist.findAll();

      for (const tag of tags) {
        if (username.includes(tag.term.toLowerCase())) {
          await member.ban({
            reason: `Pseudo contient terme interdit : ${tag.term}`,
          });

          const logChannel = await guild.channels
            .fetch(LOG_CHANNEL_ID)
            .catch(() => null);
          if (logChannel && logChannel.type === ChannelType.GuildText) {
            logChannel.send(
              `🚫 **${member.user.tag}** a été automatiquement banni.\n📌 Raison : **Tag interdit détecté**\n🧩 Terme : \`${tag.term}\``
            );
          }

          console.log(`🔨 ${member.user.tag} banni (Tag "${tag.term}")`);
          return;
        }
      }
    } catch (error) {
      console.error("Erreur dans le module d’autoban :", error);
    }
  },
};
