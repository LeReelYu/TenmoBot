const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  PermissionsBitField,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("embed")
    .setDescription("Créer, envoyer ou modifier un embed.")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("envoyer")
        .setDescription("Envoie un embed personnalisé dans un salon.")
        .addChannelOption((option) =>
          option
            .setName("salon")
            .setDescription("Salon où envoyer l'embed")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("titre")
            .setDescription("Le titre de l'embed")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("description")
            .setDescription("La description de l'embed")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("couleur")
            .setDescription("Couleur de l'embed (ex: #ff0000 pour rouge)")
            .setRequired(false)
        )
        .addStringOption((option) =>
          option
            .setName("image")
            .setDescription("URL de l'image principale")
            .setRequired(false)
        )
        .addStringOption((option) =>
          option
            .setName("miniature")
            .setDescription("URL de la miniature")
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("modifier")
        .setDescription(
          "Modifie un embed existant en fournissant son ID de message."
        )
        .addStringOption((option) =>
          option
            .setName("message_id")
            .setDescription("L'ID du message à modifier")
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName("salon")
            .setDescription("Le salon où se trouve l'embed")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("titre")
            .setDescription("Le nouveau titre de l'embed")
            .setRequired(false)
        )
        .addStringOption((option) =>
          option
            .setName("description")
            .setDescription("La nouvelle description de l'embed")
            .setRequired(false)
        )
        .addStringOption((option) =>
          option
            .setName("couleur")
            .setDescription("Nouvelle couleur de l'embed (ex: #ff0000)")
            .setRequired(false)
        )
        .addStringOption((option) =>
          option
            .setName("image")
            .setDescription("Nouvelle URL de l'image principale")
            .setRequired(false)
        )
        .addStringOption((option) =>
          option
            .setName("miniature")
            .setDescription("Nouvelle URL de la miniature")
            .setRequired(false)
        )
    ),

  async execute(interaction) {
    if (
      !interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)
    ) {
      return interaction.reply({
        content:
          "Vous devez avoir la permission de kick des membres pour utiliser cette commande.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "envoyer") {
      const salon = interaction.options.getChannel("salon");
      const titre = interaction.options.getString("titre");
      const description = interaction.options.getString("description");
      const couleur = interaction.options.getString("couleur") || "#ffffff"; // Blanc par défaut
      const imageUrl = interaction.options.getString("image");
      const thumbnailUrl = interaction.options.getString("miniature");

      const embed = new EmbedBuilder()
        .setTitle(titre)
        .setDescription(description)
        .setColor(couleur);

      if (imageUrl) embed.setImage(imageUrl);
      if (thumbnailUrl) embed.setThumbnail(thumbnailUrl);

      try {
        await salon.send({ embeds: [embed] });
        await interaction.reply({
          content: `✅ Embed envoyé dans ${salon}`,
          ephemeral: true,
        });
      } catch (error) {
        console.error(error);
        await interaction.reply({
          content: "❌ Impossible d'envoyer l'embed.",
          ephemeral: true,
        });
      }
    }

    if (subcommand === "modifier") {
      const salon = interaction.options.getChannel("salon");
      const messageId = interaction.options.getString("message_id");
      const newTitle = interaction.options.getString("titre");
      const newDescription = interaction.options.getString("description");
      const newColor = interaction.options.getString("couleur");
      const newImageUrl = interaction.options.getString("image");
      const newThumbnailUrl = interaction.options.getString("miniature");

      try {
        const message = await salon.messages.fetch(messageId);
        if (!message)
          return interaction.reply({
            content: "❌ Message introuvable.",
            ephemeral: true,
          });

        if (!message.embeds.length)
          return interaction.reply({
            content: "❌ Le message ne contient pas d'embed.",
            ephemeral: true,
          });

        const oldEmbed = message.embeds[0];
        const updatedEmbed = new EmbedBuilder()
          .setTitle(newTitle || oldEmbed.title)
          .setDescription(newDescription || oldEmbed.description)
          .setColor(newColor || oldEmbed.color);

        if (newImageUrl) {
          updatedEmbed.setImage(newImageUrl);
        } else if (oldEmbed.image) {
          updatedEmbed.setImage(oldEmbed.image.url);
        }

        if (newThumbnailUrl) {
          updatedEmbed.setThumbnail(newThumbnailUrl);
        } else if (oldEmbed.thumbnail) {
          updatedEmbed.setThumbnail(oldEmbed.thumbnail.url);
        }

        await message.edit({ embeds: [updatedEmbed] });
        await interaction.reply({
          content: "✅ Embed modifié avec succès.",
          ephemeral: true,
        });
      } catch (error) {
        console.error(error);
        await interaction.reply({
          content: "❌ Impossible de modifier l'embed.",
          ephemeral: true,
        });
      }
    }
  },
};
