// commandes/hsrbuild/viewbuild.js
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Builds = require("../../Sequelize/modèles/buildhsr"); // Importation du modèle Build

module.exports = {
  data: new SlashCommandBuilder()
    .setName("build")
    .setDescription(
      "Afficher un build pour un personnage de Honkai: Star Rail."
    )
    .addStringOption((option) =>
      option
        .setName("personnage")
        .setDescription("Nom du personnage")
        .setRequired(true)
    ),

  async execute(interaction) {
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

      // Création de l'embed pour afficher le build
      const embed = new EmbedBuilder()
        .setTitle(`Build pour ${build.name}`)
        .setDescription(`Voici le build pour le personnage **${build.name}**.`)
        .setImage(
          build.image ||
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJ-G-d36SrLE1Ej7njvy94SDA87jez1HwVrw&s"
        ) // Image par défaut si aucune image
        .setColor("#00b0f4");

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      return interaction.reply({
        content: "❌ Une erreur est survenue lors de l'affichage du build.",
        ephemeral: true,
      });
    }
  },
};
