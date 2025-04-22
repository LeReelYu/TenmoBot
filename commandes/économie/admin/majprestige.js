const { SlashCommandBuilder } = require("discord.js");
const Prestige = require("../../../Sequelize/modèles/prestige");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("majprestige")
    .setDescription("Modifier le taux de prestige d'un membre")
    .addUserOption((option) =>
      option
        .setName("membre")
        .setDescription("Le membre dont tu veux modifier le prestige")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("prestige")
        .setDescription("Le nouveau taux de prestige")
        .setRequired(true)
    ),

  async execute(interaction) {
    const adminId = interaction.user.id;
    const member = interaction.options.getUser("membre");
    const newPrestige = interaction.options.getInteger("prestige");

    if (!interaction.member.permissions.has("ADMINISTRATOR")) {
      return interaction.reply({
        content: "Tu n'as pas la permission de faire cela.",
      });
    }

    const prestige = await Prestige.findOne({ where: { userId: member.id } });

    if (!prestige) {
      await Prestige.create({
        userId: member.id,
        prestige: newPrestige,
      });
    } else {
      await prestige.update({ prestige: newPrestige });
    }

    await interaction.reply({
      content: `Le taux de prestige de <@${member.id}> a été mis à jour à **${newPrestige}** points de prestige.`,
    });
  },
};
