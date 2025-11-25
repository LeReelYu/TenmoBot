const { SlashCommandBuilder } = require("discord.js");
const film = require("../../../Sequelize/modèles/movies/film");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("majfilm")
    .setDescription("Ajoute un film à la liste pour être noté")
    .addStringOption((option) =>
      option.setName("nom").setDescription("Nom du film").setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("date")
        .setDescription("Date de visionnage (JJ/MM/AAAA)")
        .setRequired(true)
    ),

  async execute(interaction) {
    const nom = interaction.options.getString("nom");
    const dateInput = interaction.options.getString("date");

    // Validation manuelle du format JJ/MM/AAAA
    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = dateInput.match(dateRegex);

    if (!match) {
      return interaction.reply({
        content:
          "❌ Le format de la date est invalide. Utilise **JJ/MM/AAAA**.",
        ephemeral: true,
      });
    }

    const [_, day, month, year] = match;
    const isoDate = `${year}-${month}-${day}`;

    try {
      const [filmEntry, created] = await film.findOrCreate({
        where: { nom },
        defaults: { date_visionnage: dateInput },
      });

      if (!created) {
        return interaction.reply(`⚠️ Le film **${nom}** existe déjà.`);
      }

      return interaction.reply(
        `✅ Film **${nom}** ajouté (vu le ${dateInput}) !`
      );
    } catch (error) {
      console.error("Erreur lors de l'ajout du film :", error);
      return interaction.reply(
        "❌ Une erreur est survenue lors de l'ajout du film."
      );
    }
  },
};
