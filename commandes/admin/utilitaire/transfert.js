const { SlashCommandBuilder } = require("discord.js");
const Economie = require("../../../Sequelize/modèles/argent/économie");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("transfert")
    .setDescription("Transfère des pièces à un autre membre")
    .addUserOption((option) =>
      option
        .setName("membre")
        .setDescription("Membre à qui transférer l'argent")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("montant")
        .setDescription("Montant à transférer")
        .setRequired(true)
    ),

  async execute(interaction) {
    const membre = interaction.options.getUser("membre");
    const montant = interaction.options.getInteger("montant");

    // Vérifier si l'utilisateur a assez de fonds
    const user = await Economie.findOne({
      where: { userId: interaction.user.id },
    });
    const targetUser = await Economie.findOne({ where: { userId: membre.id } });

    if (!user) {
      return interaction.reply("Tu n'as pas encore de compte au lagon !");
    }

    if (user.pièces < montant) {
      return interaction.reply(
        "Tu n'as pas assez de pièces pour effectuer ce transfert."
      );
    }

    // Débiter l'argent de l'utilisateur
    user.pièces -= montant;

    // Créditer l'argent à l'utilisateur cible
    if (targetUser) {
      targetUser.pièces += montant;
      await targetUser.save();
    } else {
      // Créer un compte pour le membre cible si il n'existe pas
      await Economie.create({
        userId: membre.id,
        champignons: 0, // Le membre n'aura pas de champignons
        pièces: montant, // Le membre reçoit les pièces
      });
    }

    // Sauvegarder les modifications pour l'utilisateur qui a fait le transfert
    await user.save();

    return interaction.reply(
      `Tu as transféré ${montant} pièces à ${membre.username}.`
    );
  },
};
