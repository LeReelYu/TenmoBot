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
        .setDescription("Exprimez-vous")
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
          { name: "Secret que tu as besoin de partager", value: "sérieux" },
          { name: "Réponse anonyme à un sondage", value: "sondage" }
        )
    ),
  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const message = interaction.options.getString("message");
    const forme = interaction.options.getString("forme");
    const humourChannel = interaction.guild.channels.cache.get(
      "1332370621329575996"
    );
    const seriousChannel = interaction.guild.channels.cache.get(
      "1332370621329575996"
    );
    const pollChannel = interaction.guild.channels.cache.get(
      "1332371377411461120"
    );
    const roleId = "1353997087309561920";

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
    let channelToSend;

    if (forme === "humour") {
      embedColor = "#00FF00";
      embedTitle = "💬 Haha ce message est super marrant !";
      embedDescription = `${message}`;
      channelToSend = humourChannel;
    } else if (forme === "sérieux") {
      embedColor = "#FFFF00";
      embedTitle = "🚨 Ce message m'a fait composer le 17";
      embedDescription = `${message}`;
      channelToSend = seriousChannel;
    } else if (forme === "sondage") {
      embedColor = "#FF0000";
      embedTitle = "💬 Le sondage était excellent je suis d'accord";
      embedDescription = `${message}`;
      channelToSend = pollChannel;
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

    if (forme === "sérieux") {
      channelToSend.send({
        content: `<@&${roleId}> **Nouveau message anonyme**`,
      });
    }
    channelToSend.send({ embeds: [embed] });

    const successEmbed = new EmbedBuilder()
      .setColor("#00FF00")
      .setTitle("Votre message a été envoyé")
      .setDescription(
        "Ton message a été envoyé de manière anonyme, au rapport !💚"
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [successEmbed] });
  },
};
