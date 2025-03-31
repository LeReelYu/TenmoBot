const { SlashCommandBuilder } = require("discord.js");
const Economie = require("../../Sequelize/modèles/argent/économie");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("retirer")
    .setDescription(
      "Permet à un administrateur de retirer des pièces ou des champignons d'un utilisateur."
    )
    .addUserOption((option) =>
      option
        .setName("membre")
        .setDescription("Membre à qui retirer l'argent")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("monnaie")
        .setDescription("Type de monnaie à retirer (pièces ou champignons)")
        .setRequired(true)
        .addChoices(
          { name: "Pièces", value: "pièces" },
          { name: "Champignons", value: "champignons" }
        )
    )
    .addIntegerOption((option) =>
      option
        .setName("montant")
        .setDescription("Montant à retirer")
        .setRequired(true)
    ),

  async execute(interaction) {
    // Vérification si l'utilisateur est un administrateur (peut bannir)
    if (!interaction.member.permissions.has("BAN_MEMBERS")) {
      return interaction.reply(
        "Tu n'as pas la permission de retirer de l'argent !"
      );
    }

    const membre = interaction.options.getUser("membre");
    const monnaie = interaction.options.getString("monnaie");
    const montant = interaction.options.getInteger("montant");

    // Vérification si le montant est valide
    if (montant <= 0) {
      return interaction.reply("Le montant doit être supérieur à zéro.");
    }

    // Récupération des données de l'utilisateur
    const user = await Economie.findOne({ where: { userId: membre.id } });

    if (!user) {
      return interaction.reply("Cet utilisateur n'a pas de compte au lagon !");
    }

    // Retirer les fonds de la monnaie spécifiée
    if (monnaie === "pièces") {
      if (user.pièces < montant) {
        return interaction.reply("Cet utilisateur n'a pas assez de pièces.");
      }
      user.pièces -= montant;
    } else if (monnaie === "champignons") {
      if (user.champignons < montant) {
        return interaction.reply(
          "Cet utilisateur n'a pas assez de champignons."
        );
      }
      user.champignons -= montant;
    }

    // Sauvegarder les modifications
    await user.save();

    return interaction.reply(
      `Tu as retiré ${montant} ${monnaie} de ${membre.username}.`
    );
  },
};
