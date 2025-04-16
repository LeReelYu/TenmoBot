const { SlashCommandBuilder, EmbedBuilder } = require("@discordjs/builders");
const Barre = require("../../../Sequelize/modèles/barre");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("majupd")
    .setDescription(
      "Met à jour le taux de progression avant la prochaine mise à jour."
    )
    .addIntegerOption((option) =>
      option
        .setName("progression")
        .setDescription("Taux de progression (0 à 100)")
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has("Administrator")) {
      return interaction.reply(
        "❌ Tu n'as pas la permission d'utiliser cette commande."
      );
    }

    const progression = interaction.options.getInteger("progression");

    if (progression < 0 || progression > 100) {
      return interaction.reply(
        "❗ Le taux de progression doit être compris entre 0 et 100."
      );
    }

    await Barre.upsert({ id: 1, progression });

    const bar = generateBar(progression);
    const color = getColor(progression);

    const embed = new EmbedBuilder()
      .setTitle("✅ Progression mise à jour")
      .setDescription(`Le taux est désormais à **${progression}%**.`)
      .setColor(color)
      .addFields({
        name: "Nouvelle progression",
        value: bar,
        inline: true,
      })
      .setFooter({ text: "Merci Admin 👑" });

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
