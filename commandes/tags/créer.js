const { SlashCommandBuilder } = require("discord.js");
const Tags = require("../../Sequilize/modèles/tags");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("apprendre")
    .setDescription("Que Tenmo apprenne quelque chose")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("ajout")
        .setDescription("Ajoute un nouveau tag.")
        .addStringOption((option) =>
          option.setName("nom").setDescription("Nom du tag").setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("contenu")
            .setDescription("Contenu du tag")
            .setRequired(true)
        )
    ),
  async execute(interaction) {
    const name = interaction.options.getString("nom");
    const description = interaction.options.getString("contenu");
    try {
      await Tags.create({
        name: name,
        description: description,
        username: interaction.user.tag,
      });
      await interaction.reply(`✅ Souvenir **${name}** ajouté avec succès !`);
    } catch (error) {
      if (error.name === "SequelizeUniqueConstraintError") {
        await interaction.reply("❌ Ce souvenir existe déjà !");
      } else {
        console.error(error);
        await interaction.reply("❌ Une erreur est survenue.");
      }
    }
  },
};
