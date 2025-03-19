const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("infoutilisateur")
    .setDescription("Te donne des informations sur le membre désigné"),
  async execute(interaction) {
    // interaction.user c'est celui qui a lancé la commande
    // interaction.member c'est le membre dans le serveur en particulier
    // donc interaction.member.joinedAt c'est la date à laquelle le membre a rejoint 1 serveur en particulier
    await interaction.reply(
      `La commande a été lancée par ${interaction.user.username}, qui a rejoint le ${interaction.member.joinedAt}`
    );
  },
};
