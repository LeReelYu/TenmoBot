const { SlashCommandBuilder } = require("discord.js");
const Tags = require("../../Sequilize/modèles/tags");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("oublier")
    .setDescription("Faire oublier quelque chose à Tenmo")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription("Supprime un tag existant.")
        .addStringOption((option) =>
          option.setName("nom").setDescription("Nom du tag").setRequired(true)
        )
    ),
  async execute(interaction) {
    const name = interaction.options.getString("nom");
    const rowCount = await Tags.destroy({ where: { name } });

    if (!rowCount) {
      return interaction.reply("❌ Ce tag n'existe pas !");
    }

    return interaction.reply(`🗑️ Tag **${name}** supprimé.`);
  },
};
