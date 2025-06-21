const { SlashCommandBuilder, MessageFlags } = require("discord.js");
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

    const usage = await ShroomUsage.findOne({ where: { userId } });
    const now = new Date();

    const cooldown = 8 * 60 * 60 * 1000;

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
      await ShroomUsage.upsert({ userId, lastUsedAt: now });

      return interaction.editReply({
        content:
          "💥 Ce salon est déjà piégé. Ton champignon a été perdu pour aujourd’hui !",
      });
    }

    await Shroom.create({ userId, channelId, placedAt: now });
    await ShroomUsage.upsert({ userId, lastUsedAt: now });

    return interaction.editReply({
      content:
        "🍄 Tu as placé un champignon piégé dans ce salon. Bonne chasse !",
    });
  },
};
