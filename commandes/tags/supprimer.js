const { SlashCommandBuilder } = require("discord.js");
const Tags = require("../../Sequelize/modèles/tags");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("oublier")
    .setDescription("Faire oublier quelque chose à Tenmo")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("supprimer")
        .setDescription("Supprime un souvenir existant.")
        .addStringOption((option) =>
          option
            .setName("nom")
            .setDescription("Nom du souvenir")
            .setRequired(true)
        )
    ),
  async execute(interaction) {
    const name = interaction.options.getString("nom");
    const rowCount = await Tags.destroy({ where: { name } });

    if (!rowCount) {
      return interaction.reply("❌ Tenmo ne sait pas ça !");
    }

    return interaction.reply(`🗑️ Souvenir **${name}** oublié.`);
  },
};
