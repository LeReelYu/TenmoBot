module.exports = async function autochannel(client) {
  const { ChannelType, PermissionsBitField } = require("discord.js");

  module.exports = {
    name: "voiceStateUpdate",
    async execute(oldState, newState) {
      const voiceChannelID = "1332399812317806746";
      const guild = newState.guild;

      // L'utilisateur rejoint le salon spécifique
      if (newState.channelId === voiceChannelID) {
        const member = newState.member;
        const tempChannel = await guild.channels.create({
          name: `Salon de ${member.user.username}`,
          type: ChannelType.GuildVoice,
          parent: newState.channel.parentId, // Garde la même catégorie
          permissionOverwrites: [
            {
              id: guild.id,
              allow: [
                PermissionsBitField.Flags.Connect,
                PermissionsBitField.Flags.ViewChannel,
              ],
            },
          ],
        });

        // Déplace l'utilisateur dans le nouveau salon
        await member.voice.setChannel(tempChannel);
      }

      // Vérifie si un salon temporaire est vide et supprime-le
      if (oldState.channel && oldState.channel.id !== voiceChannelID) {
        if (oldState.channel.members.size === 0) {
          setTimeout(() => {
            if (oldState.channel.members.size === 0) {
              oldState.channel.delete().catch(console.error);
            }
          }, 5000); // Délai pour éviter les suppressions instantanées
        }
      }
    },
  };
};
