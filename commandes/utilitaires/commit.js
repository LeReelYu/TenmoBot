// commitdb.js
const { SlashCommandBuilder } = require("discord.js");
const { commitDatabaseFile } = require("../../events/github"); // Importer la fonction commitDatabaseFile

module.exports = {
  data: new SlashCommandBuilder()
    .setName("commitdb")
    .setDescription("Met à jour le fichier database.sqlite sur GitHub."),

  async execute(interaction) {
    await interaction.deferReply(); // Préparer la réponse

    try {
      // Appeler la fonction pour effectuer le commit sur GitHub
      await commitDatabaseFile();

      // Répondre dans Discord
      await interaction.editReply(
        "Le fichier 'database.sqlite' a été mis à jour et poussé vers GitHub !"
      );
    } catch (error) {
      console.error(error);
      await interaction.editReply(
        "Une erreur est survenue lors de la mise à jour de 'database.sqlite' sur GitHub."
      );
    }
  },
};
