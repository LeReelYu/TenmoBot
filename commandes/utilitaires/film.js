const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const film = require("../../Sequelize/modèles/movies/film");
const votefilm = require("../../Sequelize/modèles/movies/votefilm");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("film")
    .setDescription("Système de notation de films")
    .addSubcommand((sub) =>
      sub
        .setName("voter")
        .setDescription("Vote pour un film")
        .addStringOption((opt) =>
          opt.setName("nom").setDescription("Nom du film").setRequired(true)
        )
        .addIntegerOption((opt) =>
          opt.setName("note").setDescription("Note sur 5").setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("note")
        .setDescription("Affiche la moyenne d’un film")
        .addStringOption((opt) =>
          opt.setName("nom").setDescription("Nom du film").setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub.setName("liste").setDescription("Liste tous les films enregistrés")
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    // VOTER
    if (sub === "voter") {
      const nomFilm = interaction.options.getString("nom");
      const note = interaction.options.getInteger("note");
      const userId = interaction.user.id;

      if (note < 1 || note > 5) {
        return interaction.reply("❌ La note doit être entre 1 et 5.");
      }

      const filmData = await film.findOne({ where: { nom: nomFilm } });
      if (!filmData) {
        return interaction.reply(
          "❌ Ce film n'existe pas dans la base de données."
        );
      }

      await votefilm.upsert({
        userId,
        filmId: filmData.id,
        note,
      });

      return interaction.reply(
        `✅ Tu as noté **${filmData.nom}** avec **${note}/5**.`
      );
    }

    // NOTE
    if (sub === "note") {
      const nomFilm = interaction.options.getString("nom");

      const filmData = await film.findOne({ where: { nom: nomFilm } });
      if (!filmData) {
        return interaction.reply(
          "❌ Ce film n'existe pas dans la base de données."
        );
      }

      const votes = await votefilm.findAll({ where: { filmId: filmData.id } });

      if (votes.length === 0) {
        return interaction.reply("⚠️ Aucun vote pour ce film pour le moment.");
      }

      const moyenne =
        votes.reduce((sum, vote) => sum + vote.note, 0) / votes.length;
      const étoiles = "⭐".repeat(Math.round(moyenne));

      const embed = new EmbedBuilder()
        .setTitle(`🎬 ${filmData.nom}`)
        .setDescription(
          `📅 Vu le **${
            filmData.date_visionnage
          }**\n\n**${étoiles} (${moyenne.toFixed(2)}/5)**`
        )
        .setColor("Orange")
        .setFooter({ text: `Basé sur ${votes.length} vote(s)` });

      return interaction.reply({ embeds: [embed] });
    }

    // LISTE
    if (sub === "liste") {
      const films = await film.findAll();

      if (films.length === 0) {
        return interaction.reply("Aucun film n’a encore été ajouté.");
      }

      const liste = films
        .map((f) => `🎬 **${f.nom}** (Vu le ${f.date_visionnage})`)
        .join("\n");

      const embed = new EmbedBuilder()
        .setTitle("📽️ Liste des films enregistrés")
        .setDescription(liste)
        .setColor("Blue");

      return interaction.reply({ embeds: [embed] });
    }
  },
};
