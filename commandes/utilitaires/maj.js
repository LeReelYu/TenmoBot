const { SlashCommandBuilder, EmbedBuilder } = require("@discordjs/builders");
const Barre = require("../../Sequelize/modèles/barre");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("maj")
    .setDescription(
      "Affiche le taux de progression avant la prochaine mise à jour du bot."
    ),

  async execute(interaction) {
    const progressionData = await Barre.findOne({ where: { id: 1 } });

    if (!progressionData) {
      return interaction.reply("Erreur : Aucune progression trouvée en base.");
    }

    const progression = progressionData.progression;
    const bar = generateBar(progression);
    const color = getColor(progression);

    const embed = new EmbedBuilder()
      .setTitle("📦 Progression de la mise à jour")
      .setDescription(
        `Le taux de progression actuel est de **${progression}%**.`
      )
      .setColor(color)
      .addFields({
        name: "Barre de progression",
        value: bar,
        inline: true,
      })
      .setFooter({ text: "Mise à jour en cours..." });

    interaction.reply({ embeds: [embed] });
  },
};

function generateBar(progression) {
  const total = 20;
  const filled = Math.round((progression / 100) * total);
  const empty = total - filled;

  return "🟩".repeat(filled) + "🟥".repeat(empty);
}

function getColor(prog) {
  if (prog >= 75) return 0x00ff00; // Vert
  if (prog >= 25) return 0xffa500; // Orange
  return 0xff0000; // Rouge
}
