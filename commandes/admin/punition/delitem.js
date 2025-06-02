const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");
const Objets = require("../../../Sequelize/modèles/argent/vente/objets"); // Modèle Item
const Inventaire = require("../../../Sequelize/modèles/argent/vente/inventaire"); // Modèle Inventaire

module.exports = {
  data: new SlashCommandBuilder()
    .setName("removeitem")
    .setDescription("Supprimer un objet de la boutique et des inventaires")
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("Le nom de l'objet à supprimer")
        .setRequired(true)
    ),

  async execute(interaction) {
    // Vérifier si l'utilisateur a la permission d'administrateur
    if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({
        content:
          "Désolé, vous n'avez pas la permission de supprimer des objets de la boutique.",
      });
    }

    // Récupérer le nom de l'objet à supprimer
    const name = interaction.options.getString("name");

    try {
      // Chercher l'objet dans la base de données
      const item = await Objets.findOne({ where: { name } });

      if (!item) {
        return interaction.reply({
          content: `Aucun objet trouvé avec le nom **${name}**.`,
        });
      }

      // Supprimer les références de cet objet dans la table Inventaire (si des utilisateurs l'ont acheté)
      await Inventaire.destroy({
        where: { itemId: item.id },
      });

      // Supprimer l'objet de la table Objets
      await item.destroy();

      // Répondre à l'utilisateur
      await interaction.reply({
        content: `L'objet **${name}** a été supprimé de la boutique et de tous les inventaires.`,
      });
    } catch (error) {
      console.error("Erreur lors de la suppression de l'objet:", error);
      await interaction.reply({
        content:
          "Une erreur est survenue lors de la suppression de l'objet de la boutique et des inventaires.",
      });
    }
  },
};
