const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("infoserveur")
    .setDescription("Te donne des informations sur le serveur"),
  async execute(interaction) {
    // interaction.guild c'est le serveur dans lequel la commande a été effectuée
    await interaction.reply(
      `Ce serveur est ${interaction.guild.name} et il a ${interaction.guild.memberCount} membres`
    );
  },
};
