const {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");
const Note = require("../../Sequelize/modèles/Note");

const COLORS = [
  "#1ABC9C",
  "#2ECC71",
  "#3498DB",
  "#9B59B6",
  "#E91E63",
  "#F1C40F",
  "#E67E22",
  "#E74C3C",
  "#95A5A6",
  "#00BCD4",
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("note")
    .setDescription(
      "Créer, consulter, modifier ou supprimer une note personnelle"
    )
    .addStringOption((opt) =>
      opt
        .setName("action")
        .setDescription("Que veux-tu faire ?")
        .setRequired(true)
        .addChoices(
          { name: "Créer une note", value: "create" },
          { name: "Consulter une note", value: "read" },
          { name: "Supprimer une note", value: "delete" },
          { name: "Lister mes notes", value: "list" },
          { name: "Modifier une note", value: "edit" }
        )
    )
    .addStringOption((opt) =>
      opt
        .setName("nom")
        .setDescription("Nom de la note")
        .setRequired(false)
        .setAutocomplete(true)
    )
    .addStringOption((opt) =>
      opt
        .setName("contenu")
        .setDescription("Contenu de la note (création ou modification)")
        .setRequired(false)
        .setMaxLength(1000)
    ),

  async autocomplete(interaction) {
    const focused = interaction.options.getFocused();
    const userId = interaction.user.id;

    const notes = await Note.findAll({
      where: { userId },
      limit: 10,
    });

    const filtered = notes
      .filter((n) => n.noteName.toLowerCase().startsWith(focused.toLowerCase()))
      .map((n) => ({ name: n.noteName, value: n.noteName }))
      .slice(0, 25);

    await interaction.respond(filtered);
  },

  async execute(interaction) {
    const action = interaction.options.getString("action");
    const userId = interaction.user.id;
    const noteName = interaction.options.getString("nom");
    const content = interaction.options.getString("contenu");

    if (action === "create") {
      if (!noteName || !content) {
        return interaction.reply({
          content:
            "❌ Tu dois fournir un nom **et** un contenu pour créer une note.",
          flags: MessageFlags.Ephemeral,
        });
      }

      const [note, created] = await Note.findOrCreate({
        where: { userId, noteName },
        defaults: { content },
      });

      if (!created) {
        return interaction.reply({
          content: `⚠️ Tu as déjà une note nommée "${noteName}".`,
          flags: MessageFlags.Ephemeral,
        });
      }

      return interaction.reply({
        content: `✅ Note "${noteName}" créée avec succès.`,
        flags: MessageFlags.Ephemeral,
      });
    }

    if (action === "read") {
      if (!noteName) {
        return interaction.reply({
          content: "❌ Tu dois indiquer le nom de la note à consulter.",
          flags: MessageFlags.Ephemeral,
        });
      }

      const note = await Note.findOne({ where: { userId, noteName } });
      if (!note) {
        return interaction.reply({
          content: "❌ Aucune note trouvée avec ce nom.",
          flags: MessageFlags.Ephemeral,
        });
      }

      const embed = new EmbedBuilder()
        .setTitle(`📓 Note : ${noteName}`)
        .setDescription(note.content)
        .setColor(randomColor())
        .setFooter({ text: `Privée pour ${interaction.user.username}` })
        .setTimestamp();

      return interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
    }

    if (action === "delete") {
      if (!noteName) {
        return interaction.reply({
          content: "❌ Tu dois indiquer le nom de la note à supprimer.",
          flags: MessageFlags.Ephemeral,
        });
      }

      const deleted = await Note.destroy({
        where: { userId, noteName },
      });

      if (!deleted) {
        return interaction.reply({
          content: "❌ Aucune note trouvée avec ce nom.",
          flags: MessageFlags.Ephemeral,
        });
      }

      return interaction.reply({
        content: `🗑️ Note "${noteName}" supprimée.`,
        flags: MessageFlags.Ephemeral,
      });
    }

    if (action === "list") {
      const notes = await Note.findAll({ where: { userId } });

      if (notes.length === 0) {
        return interaction.reply({
          content: "🗒️ Tu n'as encore aucune note.",
          flags: MessageFlags.Ephemeral,
        });
      }

      const embed = new EmbedBuilder()
        .setTitle(`📚 Liste de tes notes (${notes.length})`)
        .setColor(randomColor())
        .setDescription(notes.map((n) => `• \`${n.noteName}\``).join("\n"))
        .setFooter({ text: `Privé pour ${interaction.user.username}` })
        .setTimestamp();

      return interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
    }

    if (action === "edit") {
      if (!noteName || !content) {
        return interaction.reply({
          content:
            "❌ Tu dois indiquer un nom de note **et** un nouveau contenu.",
          flags: MessageFlags.Ephemeral,
        });
      }

      const note = await Note.findOne({ where: { userId, noteName } });
      if (!note) {
        return interaction.reply({
          content: "❌ Aucune note trouvée avec ce nom.",
          flags: MessageFlags.Ephemeral,
        });
      }

      const oldContent = note.content;
      note.content = content;
      await note.save();

      const embed = new EmbedBuilder()
        .setTitle(`✏️ Note "${noteName}" modifiée`)
        .setColor(randomColor())
        .addFields(
          {
            name: "Avant :",
            value:
              oldContent.length > 1024
                ? oldContent.slice(0, 1021) + "..."
                : oldContent,
          },
          {
            name: "Après :",
            value:
              content.length > 1024 ? content.slice(0, 1021) + "..." : content,
          }
        )
        .setFooter({
          text: `Modification faite par ${interaction.user.username}`,
        })
        .setTimestamp();

      return interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};

function randomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}
