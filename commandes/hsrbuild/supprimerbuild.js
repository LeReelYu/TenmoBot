const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const Builds = require("../../Sequelize/modèles/buildhsr"); // Importation du modèle Build

module.exports = {
  data: new SlashCommandBuilder()
    .setName("supprimebuild")
    .setDescription(
      "Supprimer un build pour un personnage de Honkai: Star Rail."
    )
    .addStringOption((option) =>
      option
        .setName("personnage")
        .setDescription("Nom du personnage")
        .setRequired(true)
    ),

  async execute(interaction) {
    // Vérification si l'utilisateur a la permission de "kick des membres"
    if (!interaction.member.permissions.has("KICK_MEMBERS")) {
      return interaction.reply({
        content:
          "❌ Vous devez avoir la permission de **kick des membres** pour utiliser cette commande.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const personnage = interaction.options.getString("personnage");

    try {
      // Recherche du build dans la base de données
      const build = await Builds.findOne({
        where: { name: personnage },
      });

      if (!build) {
        return interaction.reply({
          content: `❌ Aucun build trouvé pour **${personnage}**.`,
          ephemeral: true,
        });
      }

      // Suppression du build trouvé
      await build.destroy();

      return interaction.reply({
        content: `✅ Le build pour **${personnage}** a été supprimé avec succès.`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error(error);
      return interaction.reply({
        content: "❌ Une erreur est survenue lors de la suppression du build.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
