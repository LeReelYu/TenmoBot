const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const Economie = require("../../../Sequelize/modèles/argent/économie");
const Pets = require("../../../Sequelize/modèles/argent/vente/animaux/pets");
const UserPets = require("../../../Sequelize/modèles/argent/vente/animaux/userpets");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("donner")
    .setDescription("Donne une monnaie à un autre membre si tu es STAFF")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption((option) =>
      option
        .setName("membre")
        .setDescription("Membre à qui donner des ressources")
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
        .setDescription("Type de monnaie à donner (champignons/pièces/bulles)")
        .setRequired(true)
        .addChoices(
          { name: "Champignons", value: "champignons" },
          { name: "Pièces", value: "pièces" }
        )
    )
    .addStringOption((option) =>
      option
        .setName("pet")
        .setDescription("Nom du pet à donner à l'utilisateur")
        .setRequired(false)
    ),

  async execute(interaction) {
    const membre = interaction.options.getUser("membre");
    const montant = interaction.options.getInteger("montant");
    const monnaie = interaction.options.getString("monnaie");
    const petName = interaction.options.getString("pet");

    // Récupère ou crée les entrées économiques
    const [targetUser] = await Economie.findOrCreate({
      where: { userId: membre.id },
      defaults: {
        champignons: 0,
        pièces: 0,
      },
    });

    let successMessage = `Tu as donné ${montant} ${monnaie} à ${membre.username}.`;

    // Modification de la monnaie
    if (monnaie === "champignons") {
      targetUser.champignons += montant;
    } else if (monnaie === "pièces") {
      targetUser.pièces += montant;

      await targetUser.save();

      // Gestion des pets
      if (petName) {
        const pet = await Pets.findOne({ where: { name: petName } });

        if (!pet) {
          return interaction.reply(`🚫 Le pet **${petName}** n'existe pas.`);
        }

        const existing = await UserPets.findOne({
          where: {
            userId: membre.id,
            petId: pet.id,
          },
        });

        if (existing) {
          successMessage += `\n⚠️ ${membre.username} possède déjà le pet **${petName}**.`;
        } else {
          await UserPets.create({
            userId: membre.id,
            petId: pet.id,
            is_equipped: false,
          });

          successMessage += `\nLe pet **${petName}** a été donné à ${membre.username}.`;
        }
      }

      return interaction.reply(successMessage);
    }
  },
};
