const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
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
    )
    .addSubcommand((sub) =>
      sub
        .setName("mesvotes")
        .setDescription("Affiche les films que tu as notés")
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === "voter") {
      const nomFilm = interaction.options.getString("nom").trim();
      const note = interaction.options.getInteger("note");
      const userId = interaction.user.id;

      if (note < 1 || note > 5) {
        return interaction.reply("❌ La note doit être entre 1 et 5.");
      }

      const filmData = await film.findOne({
        where: { nom: { [Op.like]: nomFilm } },
      });

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

    if (sub === "note") {
      const nomFilm = interaction.options.getString("nom").trim();
      const filmData = await film.findOne({
        where: { nom: { [Op.like]: nomFilm } },
      });

      if (!filmData) {
        return interaction.reply(
          "❌ Ce film n'existe pas dans la base de données."
        );
      }

      const votes = await votefilm.findAll({ where: { filmId: filmData.id } });

      if (votes.length === 0) {
        return interaction.reply("⚠️ Aucun vote pour ce film pour le moment.");
      }

      const moyenne = votes.reduce((sum, v) => sum + v.note, 0) / votes.length;
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

    if (sub === "liste") {
      const films = await film.findAll({
        order: [["date_visionnage", "DESC"]],
      });
      if (films.length === 0) {
        return interaction.reply("Aucun film n’a encore été ajouté.");
      }

      const filmsParPage = 10;
      const totalPages = Math.ceil(films.length / filmsParPage);
      let page = 1;

      const getPageEmbed = (pageNum) => {
        const start = (pageNum - 1) * filmsParPage;
        const current = films.slice(start, start + filmsParPage);
        const desc = current
          .map((f, i) => `🎬 **${f.nom}** — Vu le ${f.date_visionnage}`)
          .join("\n");

        return new EmbedBuilder()
          .setTitle("📽️ Liste des films enregistrés")
          .setDescription(desc)
          .setColor("Blue")
          .setFooter({ text: `Page ${pageNum}/${totalPages}` });
      };

      const backBtn = new ButtonBuilder()
        .setCustomId("prev")
        .setEmoji("⬅️")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true);

      const nextBtn = new ButtonBuilder()
        .setCustomId("next")
        .setEmoji("➡️")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(totalPages <= 1);

      const row = new ActionRowBuilder().addComponents(backBtn, nextBtn);
      const message = await interaction.reply({
        embeds: [getPageEmbed(page)],
        components: [row],
        fetchReply: true,
      });

      const collector = message.createMessageComponentCollector({
        time: 120000,
        filter: (i) => i.user.id === interaction.user.id,
      });

      collector.on("collect", async (i) => {
        if (i.customId === "next") page++;
        else if (i.customId === "prev") page--;

        backBtn.setDisabled(page === 1);
        nextBtn.setDisabled(page === totalPages);

        await i.update({
          embeds: [getPageEmbed(page)],
          components: [new ActionRowBuilder().addComponents(backBtn, nextBtn)],
        });
      });

      collector.on("end", async () => {
        backBtn.setDisabled(true);
        nextBtn.setDisabled(true);
        await message.edit({
          components: [new ActionRowBuilder().addComponents(backBtn, nextBtn)],
        });
      });
    }

    if (sub === "mesvotes") {
      const userId = interaction.user.id;
      const votes = await votefilm.findAll({ where: { userId } });

      if (votes.length === 0) {
        return interaction.reply("🎬 Tu n’as encore noté aucun film !");
      }

      const unique = {};
      for (const v of votes) {
        if (!unique[v.filmId]) unique[v.filmId] = v;
        else if (new Date(v.updatedAt) > new Date(unique[v.filmId].updatedAt)) {
          await unique[v.filmId].destroy();
          unique[v.filmId] = v;
        } else {
          await v.destroy();
        }
      }

      const films = await film.findAll({
        where: { id: Object.keys(unique) },
      });

      const contenu = Object.values(unique)
        .map((v) => {
          const f = films.find((film) => film.id === v.filmId);
          return f ? `🎞️ **${f.nom}** → ${v.note}/5` : null;
        })
        .filter(Boolean)
        .join("\n");

      const embed = new EmbedBuilder()
        .setTitle(`📊 Votes de ${interaction.user.username}`)
        .setDescription(contenu)
        .setColor("Purple");

      return interaction.reply({ embeds: [embed] });
    }
  },
};
