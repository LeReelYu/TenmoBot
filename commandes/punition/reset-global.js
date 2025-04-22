const { SlashCommandBuilder } = require("discord.js");
const Economie = require("../../Sequelize/modèles/argent/économie");
const BubbleProfile = require("../../Sequelize/modèles/argent/bulle/BubbleProfile");
const Pets = require("../../Sequelize/modèles/argent/vente/animaux/pets");
const UserPets = require("../../Sequelize/modèles/argent/vente/animaux/userpets");
const daily = require("../../Sequelize/modèles/argent/cooldowns/daily");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("reset-global")
    .setDescription("Réinitialise le solde et l'état de tous les membres")
    .addStringOption((option) =>
      option
        .setName("sujet")
        .setDescription("Choisissez le sujet à réinitialiser")
        .setRequired(true)
        .addChoices(
          { name: "Pièces", value: "pièces" },
          { name: "Bulles", value: "bulles" },
          { name: "Pets", value: "pets" }
        )
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has("ADMINISTRATOR")) {
      return interaction.reply({
        content:
          "🚫 Tu n'as pas les permissions nécessaires pour utiliser cette commande.",
      });
    }

    const sujet = interaction.options.getString("sujet");

    const allUsers = await Economie.findAll();
    const allBubbleProfiles = await BubbleProfile.findAll();
    const allUserPets = await UserPets.findAll();

    if (allUsers.length === 0) {
      return interaction.reply(
        "⚠️ Aucun utilisateur avec un solde enregistré."
      );
    }

    if (sujet === "pièces") {
      for (const user of allUsers) {
        user.pièces = 0;
        await user.save();
      }
      return interaction.reply("✅ Toutes les pièces ont été réinitialisées !");
    }

    if (sujet === "bulles") {
      for (const bubbleProfile of allBubbleProfiles) {
        bubbleProfile.bubbles = 0;
        await bubbleProfile.save();
      }
      return interaction.reply("✅ Toutes les bulles ont été réinitialisées !");
    }

    if (sujet === "pets") {
      for (const userPet of allUserPets) {
        await userPet.destroy();
      }
      return interaction.reply("✅ Tous les pets ont été réinitialisés !");
    }

    return interaction.reply("⚠️ Sujet de réinitialisation invalide.");
  },
};
