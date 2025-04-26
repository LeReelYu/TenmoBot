const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const axios = require("axios");
const config = require("../../config.json");
const Films = require("../../Sequelize/modèles/Films");
const { Op } = require("sequelize");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("film")
    .setDescription("Gestion des films")
    .addSubcommand((sub) =>
      sub
        .setName("chercher")
        .setDescription("Recherche un film via TMDb")
        .addStringOption((opt) =>
          opt.setName("titre").setDescription("Titre du film").setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("noter")
        .setDescription("Note un film pré-enregistré")
        .addStringOption((opt) =>
          opt
            .setName("titre")
            .setDescription("Titre exact du film enregistré")
            .setRequired(true)
        )
        .addIntegerOption((opt) =>
          opt
            .setName("note")
            .setDescription("Note sur 5")
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(5)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("classement")
        .setDescription("Affiche le classement des films notés")
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === "chercher") {
      const titre = interaction.options.getString("titre");
      const apiKey = config.tmdbApiKey;

      try {
        const res = await axios.get(
          "https://api.themoviedb.org/3/search/movie",
          {
            params: {
              api_key: apiKey,
              query: titre,
              language: "fr-FR",
            },
          }
        );

        const result = res.data.results?.[0];
        if (!result)
          return interaction.reply("❌ Aucun film trouvé avec ce titre.");

        const detail = await axios.get(
          `https://api.themoviedb.org/3/movie/${result.id}`,
          {
            params: {
              api_key: apiKey,
              language: "fr-FR",
            },
          }
        );

        const film = detail.data;

        const embed = new EmbedBuilder()
          .setTitle(`${film.title} (${film.release_date?.split("-")[0]})`)
          .setDescription(film.overview || "Pas de synopsis.")
          .addFields(
            {
              name: "Date de sortie",
              value: film.release_date || "Inconnue",
              inline: true,
            },
            {
              name: "Durée",
              value: film.runtime ? `${film.runtime} min` : "Inconnue",
              inline: true,
            },
            {
              name: "Note TMDb",
              value: `${film.vote_average.toFixed(1)} / 10`,
              inline: true,
            }
          )
          .setThumbnail(`https://image.tmdb.org/t/p/w500${film.poster_path}`)
          .setColor("#00c0ff");

        return interaction.reply({ embeds: [embed] });
      } catch (err) {
        console.error(err);
        return interaction.reply("❌ Une erreur est survenue.");
      }
    }

    if (sub === "noter") {
      const titre = interaction.options.getString("titre");
      const note = interaction.options.getInteger("note");
      const userId = interaction.user.id;

      const film = await Films.findOne({
        where: { title: { [Op.iLike]: titre } },
      });

      if (!film) {
        return interaction.reply("❌ Ce film n'est pas enregistré.");
      }

      const [filmNote, created] = await NoteFilms.findOrCreate({
        where: { userId, filmId: film.id },
        defaults: { note },
      });

      if (!created) {
        filmNote.note = note;
        await filmNote.save();
        return interaction.reply(
          `✅ Ta note pour **${film.title}** a été mise à jour à **${note}/5**.`
        );
      }

      return interaction.reply(
        `✅ Tu as noté **${film.title}** : **${note}/5**.`
      );
    }

    if (sub === "classement") {
      const films = await Films.findAll({
        include: [{ model: NoteFilms }],
      });

      if (!films.length)
        return interaction.reply(
          "❌ Aucun film enregistré ou noté pour l'instant."
        );

      const filmStats = films
        .map((film) => {
          const notes = film.NoteFilms;
          if (!notes.length)
            return { titre: film.title, moyenne: "Vide", count: 0 };

          const moyenne =
            notes.reduce((sum, note) => sum + note.note, 0) / notes.length;
          return { titre: film.title, moyenne, count: notes.length };
        })
        .sort((a, b) => {
          if (a.moyenne === "Vide") return 1;
          if (b.moyenne === "Vide") return -1;
          return b.moyenne - a.moyenne;
        });

      const classement = filmStats
        .map(
          (film, i) =>
            `**${i + 1}.** ${film.titre} — ${
              film.moyenne === "Vide" ? "Vide" : film.moyenne.toFixed(2)
            }/5 (${film.count} note${film.count > 1 ? "s" : ""})`
        )
        .join("\n");

      const embed = new EmbedBuilder()
        .setTitle("🎬 Classement des films")
        .setDescription(classement)
        .setColor("Gold");

      return interaction.reply({ embeds: [embed] });
    }
  },
};
