const { SlashCommandBuilder } = require("discord.js");
const Tags = require("../../Sequilize/modèles/tags");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("souvenir")
    .setDescription("Que Tenmo se rappelle de quelque chose")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("mémoire")
        .setDescription("Affiche un tag enregistré.")
        .addStringOption((option) =>
          option
            .setName("nom")
            .setDescription("Nom du souvenir")
            .setRequired(true)
        )
    ),
  async execute(interaction) {
    const name = interaction.options.getString("nom");
    const tag = await Tags.findOne({ where: { name } });

    if (tag) {
      await interaction.reply(`📌 **${name}**: ${tag.description}`);
    } else {
      await interaction.reply("❌ Tenmo ne se souvient pas de ça!");
    }
  },
};
