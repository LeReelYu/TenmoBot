const { SlashCommandBuilder } = require("discord.js");
const Economie = require("../../../Sequelize/modèles/argent/économie");
const CooldownCrime = require("../../../Sequelize/modèles/argent/cdcrime");

const COOLDOWN_TIME = 30 * 60 * 1000; // 30 minutes en ms

module.exports = {
  data: new SlashCommandBuilder()
    .setName("crime")
    .setDescription(
      "Tente de commettre un crime pour obtenir des pièces. Risque inclus."
    ),

  async execute(interaction) {
    const userId = interaction.user.id;
    const now = Date.now();

    // Récupération ou création du cooldown
    let cooldown = await CooldownCrime.findOne({ where: { userId } });
    if (!cooldown) {
      cooldown = await CooldownCrime.create({ userId, lastUsed: null });
    }

    if (cooldown.lastUsed) {
      const timePassed = now - new Date(cooldown.lastUsed).getTime();
      if (timePassed < COOLDOWN_TIME) {
        const remaining = COOLDOWN_TIME - timePassed;
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);

        return interaction.reply({
          content: `⏳ Tu dois encore attendre **${minutes}m ${seconds}s** avant de refaire un crime.`,
        });
      }
    }

    // Gestion des pièces via Economie
    let userEco = await Economie.findOne({ where: { userId } });
    if (!userEco) {
      userEco = await Economie.create({ userId, pièces: 0, champignons: 0 });
    }

    const success = Math.random() < 0.5;
    let resultMessage = "";

    if (success) {
      const gain = Math.floor(Math.random() * 151) + 50; // 50 à 200 pièces
      userEco.pièces += gain;
      resultMessage = `🔫 Tu as réussi ton crime et gagné **${gain}** pièces ! 🤑`;
    } else {
      const loss = Math.floor(Math.random() * 151) + 50; // 50 à 200 pièces
      userEco.pièces -= loss;
      resultMessage = `🚓 Tu t’es fait choper ! Tu perds **${loss}** pièces... 😬`;
    }

    // Sauvegarde des changements
    await userEco.save();
    cooldown.lastUsed = new Date();
    await cooldown.save();

    return interaction.reply(resultMessage);
  },
};
