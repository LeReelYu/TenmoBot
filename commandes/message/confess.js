const {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("confess")
    .setDescription(
      "Exprimez-vous anonymement et choisissez un type de message"
    )
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("Exprimez vous")
        .setRequired(true)
        .setMaxLength(1000)
    )
    .addStringOption((option) =>
      option
        .setName("forme")
        .setDescription("Choisissez la forme du message")
        .setRequired(true)
        .addChoices(
          { name: "Blague anonyme", value: "humour" },
          { name: "Information anonyme sérieuse", value: "sérieux" },
          { name: "Message anonyme pour vent", value: "vent" }
        )
    ),
  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const message = interaction.options.getString("message");
    const forme = interaction.options.getString("forme");
    const channel = interaction.guild.channels.cache.get("1332370621329575996"); // ID du salon anonyme
    const roleId = "1353997087309561920"; // ID du rôle à mentionner

    if (message.length > 1000) {
      const errorEmbed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("Erreur")
        .setDescription(
          "Votre message dépasse la limite de 1000 caractères. Veuillez réduire votre message."
        )
        .setFooter({
          text: `Demandé par ${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTimestamp();

      return await interaction.editReply({ embeds: [errorEmbed] });
    }

    let embedColor;
    let embedTitle;
    let embedDescription;

    if (forme === "humour") {
      embedColor = "#00FF00";
      embedTitle = "💬 Que ça blague";
      embedDescription = `${message}`;
      channel.send({
        content: `<@&${roleId}> **Nouveau message anonyme**`,
      });
    } else if (forme === "sérieux") {
      embedColor = "#FFFF00";
      embedTitle = "🚨 En sah to sah";
      embedDescription = `${message}`;
      channel.send({
        content: `<@&${roleId}> **Nouveau message anonyme**`,
      });
    } else if (forme === "vent") {
      embedColor = "#FF0000";
      embedTitle = "💬 J'ai besoin d'en parler";
      embedDescription = `${message}`;
      channel.send({
        content: `<@&${roleId}> **Nouveau message anonyme**`,
      });
    }

    const embed = new EmbedBuilder()
      .setColor(embedColor)
      .setTitle(embedTitle)
      .setDescription(embedDescription)
      .setFooter({
        text: "Champignon anonyme",
        iconURL:
          "https://static.wikia.nocookie.net/leagueoflegends/images/d/d8/01PZ022-full.png/revision/latest?cb=20200407030712",
      })
      .setTimestamp();

    channel.send({ embeds: [embed] });

    const successEmbed = new EmbedBuilder()
      .setColor("#00FF00")
      .setTitle("Votre message a été envoyé")
      .setDescription("Ton message a été envoyé de manière anonyme 💚")
      .setFooter({
        text: `Demandé par ${interaction.user.username}`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTimestamp();

    await interaction.editReply({ embeds: [successEmbed] });
  },
};
