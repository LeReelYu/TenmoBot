const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const Economie = require("../../Sequelize/modèles/économie");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("donner")
    .setDescription("Donne une monnaie à un autre membre si tu es STAFF")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers) // Nécessite la permission de bannir
    .addUserOption((option) =>
      option
        .setName("membre")
        .setDescription("Membre à qui donner de l'argent")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("montant")
        .setDescription("Montant à donner")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("monnaie")
        .setDescription("Type de monnaie à donner (champignons/pièces)")
        .setRequired(true)
        .addChoices(
          { name: "Champignons", value: "champignons" },
          { name: "Pièces", value: "pièces" }
        )
    ),

  async execute(interaction) {
    const membre = interaction.options.getUser("membre");
    const montant = interaction.options.getInteger("montant");
    const monnaie = interaction.options.getString("monnaie");

    // Vérifier si l'utilisateur existe dans la base de données
    const targetUser = await Economie.findOne({ where: { userId: membre.id } });

    if (targetUser) {
      if (monnaie === "champignons") {
        targetUser.champignons += montant;
      } else if (monnaie === "pièces") {
        targetUser.pièces += montant;
      }
      await targetUser.save();
    } else {
      // Si l'utilisateur n'a pas de compte, en créer un
      await Economie.create({
        userId: membre.id,
        champignons: monnaie === "champignons" ? montant : 0,
        pièces: monnaie === "pièces" ? montant : 0,
      });
    }

    return interaction.reply(
      `Tu as donné ${montant} ${monnaie} à ${membre.username}.`
    );
  },
};
