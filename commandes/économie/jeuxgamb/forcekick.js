const { SlashCommandBuilder } = require("discord.js");
const Inventaire = require("../../../Sequelize/modèles/argent/vente/inventaire");
const Objets = require("../../../Sequelize/modèles/argent/vente/objets");
const { Op } = require("sequelize");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("forcekick")
    .setDescription(
      "Kick un utilisateur si tu possèdes un 'forcekick' dans ton inventaire."
    )
    .addUserOption((option) =>
      option
        .setName("membre")
        .setDescription("L'utilisateur à kick")
        .setRequired(true)
    ),

  async execute(interaction) {
    const userId = interaction.user.id;
    const memberToKick = interaction.options.getUser("membre");

    const forcekickItem = await Objets.findOne({ where: { id: 7 } });
    if (!forcekickItem) {
      return interaction.reply({
        content: "❌ L'objet 'forcekick' n'existe pas.",
      });
    }

    const inventory = await Inventaire.findOne({
      where: {
        userId: userId,
        itemId: forcekickItem.id,
        quantity: {
          [Op.gt]: 0,
        },
      },
    });

    if (!inventory) {
      return interaction.reply({
        content: "❌ Tu n'as pas d'objet 'forcekick' dans ton inventaire.",
      });
    }

    inventory.quantity -= 1;
    if (inventory.quantity <= 0) {
      await inventory.destroy();
    } else {
      await inventory.save();
    }

    try {
      await memberToKick.send({
        content: `Désolé pour la gêne occasionnée, tu as été expulsé du serveur par **${interaction.user.username}**. Voici un lien pour revenir : [Rejoindre le serveur](https://discord.gg/WNHhEAQQrW).`,
      });
    } catch (error) {
      console.error("Erreur lors de l'envoi du message privé:", error);
    }

    const member = await interaction.guild.members.fetch(memberToKick.id);
    if (!member) {
      return interaction.reply({
        content: "❌ Impossible de trouver ce membre dans le serveur.",
      });
    }

    await member.kick("Kicked via /forcekick");

    return interaction.reply({
      content: `✅ Tu as kick **${memberToKick.username}** du serveur... Est-ce que ça valait le coût ?`,
    });
  },
};
