const {
  SlashCommandBuilder,
  MessageFlags,
  EmbedBuilder,
} = require("discord.js");
const Shroom = require("../../Sequelize/modèles/champignongue/Shroom");
const ShroomUsage = require("../../Sequelize/modèles/champignongue/Shroomusage");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("shroom")
    .setDescription("Place un champignon piégé dans le salon"),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const userId = interaction.user.id;
    const channelId = interaction.channel.id;

    const now = new Date();
    const cooldown = 2 * 60 * 60 * 1000;

    const usage = await ShroomUsage.findOne({ where: { userId } });

    if (usage && now - usage.lastUsedAt < cooldown) {
      const timeLeft = cooldown - (now - usage.lastUsedAt);
      const hours = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

      return interaction.editReply({
        content: `⏳ Tu as déjà posé un champignon récemment !\nTu pourras en replanter un dans **${hours}h ${minutes}m ${seconds}s**.`,
      });
    }

    const existing = await Shroom.findOne({ where: { channelId } });
    if (existing) {
      return interaction.editReply({
        content:
          "❌ Ce salon est déjà piégé. Tu perds ton champignon actuel et ne pourra réessayer que dans 2 heures",
      });
    }

    await Shroom.create({ userId, channelId, placedAt: now });
    await ShroomUsage.upsert({ userId, lastUsedAt: now });

    const embed = new EmbedBuilder()
      .setColor(0x00aa88)
      .setTitle("🍄 Champignon placé")
      .setDescription(`Tu as piégé ce salon avec un champignon bien planqué...`)
      .setFooter({ text: "Mini-jeu : Le meilleur Scout de Bandle 🍄" })
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  },
};
