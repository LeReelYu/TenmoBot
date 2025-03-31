const { ChannelType, PermissionsBitField } = require("discord.js");

module.exports = (client) => {
  const targetChannelId = "1332399812317806746";

  client.on("voiceStateUpdate", async (oldState, newState) => {
    if (newState.channelId === targetChannelId) {
      console.log(`${newState.member.user.tag} a rejoint le salon cible.`);

      const guild = newState.guild;
      const member = newState.member;

      const tempChannel = await guild.channels.create({
        name: `🔊 Bassin de ${member.user.username}`,
        type: ChannelType.GuildVoice,
        parent: newState.channel.parentId, // Même catégorie que le salon maman
        permissionOverwrites: [
          {
            id: guild.roles.everyone.id,
            allow: [PermissionsBitField.Flags.Connect], // Tout le monde peut entrer
          },
          {
            id: member.id,
            allow: [PermissionsBitField.Flags.ManageChannels], // Le créateur peut modifier les permissions
          },
        ],
      });

      await member.voice.setChannel(tempChannel);
    }

    if (oldState.channel && oldState.channel.name.startsWith("🔊 Bassin de")) {
      if (oldState.channel.members.size === 0) {
        console.log(
          `🗑 Suppression du salon temporaire : ${oldState.channel.name}`
        );
        await oldState.channel.delete();
      }
    }
  });
};
