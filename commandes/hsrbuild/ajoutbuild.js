const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const Build = require("../../Sequelize/modèles/buildhsr");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ajoutbuild")
    .setDescription("Ajouter un build pour un personnage de Honkai: Star Rail.")
    .addStringOption((option) =>
      option
        .setName("personnage")
        .setDescription("Nom du personnage")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("image")
        .setDescription("URL de l'image du personnage")
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has("KICK_MEMBERS")) {
      return interaction.reply({
        content:
          "❌ Vous devez avoir la permission de **kick des membres** pour utiliser cette commande.",
        flags: MessageFlags.Ephemeral,
      });
    }
    const personnage = interaction.options.getString("personnage");
    const image = interaction.options.getString("image");

    try {
      // Créer un build dans la base de données
      const build = await Build.create({
        name: personnage,
        image: image,
      });

      return interaction.reply({
        content: `✅ Build pour **${build.name}** créé avec succès.`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error(error);
      return interaction.reply({
        content: "❌ Une erreur est survenue lors de la création du build.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
