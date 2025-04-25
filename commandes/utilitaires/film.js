const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const axios = require("axios");
const config = require("../../config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("film")
    .setDescription("Affiche les infos d’un film via TMDb")
    .addStringOption((option) =>
      option
        .setName("titre")
        .setDescription("Titre du film à rechercher")
        .setRequired(true)
    ),

  async execute(interaction) {
    const filmTitre = interaction.options.getString("titre");
    const apiKey = config.tmdbApiKey;

    try {
      const searchResponse = await axios.get(
        "https://api.themoviedb.org/3/search/movie",
        {
          params: {
            api_key: apiKey,
            query: filmTitre,
            language: "fr-FR",
          },
        }
      );

      const films = searchResponse.data.results;

      if (!films || films.length === 0) {
        return interaction.reply(`❌ Aucun film trouvé pour **${filmTitre}**.`);
      }

      const film = films[0];

      const detailsResponse = await axios.get(
        `https://api.themoviedb.org/3/movie/${film.id}`,
        {
          params: {
            api_key: apiKey,
            language: "fr-FR",
          },
        }
      );

      const filmDetails = detailsResponse.data;

      const embed = new EmbedBuilder()
        .setTitle(
          `${filmDetails.title} (${filmDetails.release_date?.split("-")[0]})`
        )
        .setDescription(
          filmDetails.overview || "Aucune description disponible."
        )
        .setColor("#00c0ff")
        .setThumbnail(
          `https://image.tmdb.org/t/p/w500${filmDetails.poster_path}`
        )
        .addFields(
          {
            name: "📅 Date de sortie",
            value: filmDetails.release_date || "Inconnue",
            inline: true,
          },
          {
            name: "⏱️ Durée",
            value: filmDetails.runtime
              ? `${filmDetails.runtime} min`
              : "Inconnue",
            inline: true,
          },
          {
            name: "🌐 Langue originale",
            value: filmDetails.original_language.toUpperCase(),
            inline: true,
          },
          {
            name: "⭐ Note moyenne",
            value: `${filmDetails.vote_average.toFixed(1)} / 10`,
            inline: true,
          },
          {
            name: "🎞️ Genres",
            value: filmDetails.genres.map((g) => g.name).join(", ") || "Aucun",
            inline: true,
          }
        )
        .setFooter({ text: `Fourni par The Movie Database (TMDb)` });

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Erreur lors de la récupération du film:", error);
      return interaction.reply(
        `❌ Une erreur est survenue lors de la recherche du film.`
      );
    }
  },
};
