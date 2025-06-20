const {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("dream")
    .setDescription("Raconte un rêve ou un cauchemar, anonymement ou non")
    .addStringOption((option) =>
      option
        .setName("contenu")
        .setDescription("Décris ton rêve ou cauchemar")
        .setRequired(true)
        .setMaxLength(1000)
    )
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("Quel type de rêve veux-tu partager ?")
        .setRequired(true)
        .addChoices(
          { name: "Rêve", value: "rêve" },
          { name: "Cauchemar", value: "cauchemar" }
        )
    )
    .addStringOption((option) =>
      option
        .setName("anonyme")
        .setDescription("Souhaites-tu rester anonyme ?")
        .setRequired(true)
        .addChoices(
          { name: "Oui", value: "oui" },
          { name: "Non", value: "non" }
        )
    ),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const contenu = interaction.options.getString("contenu");
    const type = interaction.options.getString("type");
    const anonyme = interaction.options.getString("anonyme");

    const dreamsChannel = interaction.guild.channels.cache.get(
      "1342894060553109655"
    );

    let embedColor, embedTitle;

    if (type === "rêve") {
      embedColor = "#84b6f4";
      embedTitle = "🌙 Un doux rêve a été partagé";
    } else {
      embedColor = "#ff6b6b";
      embedTitle = "🌑 Un cauchemar a été confié";
    }

    const embed = new EmbedBuilder()
      .setColor(embedColor)
      .setTitle(embedTitle)
      .setDescription(contenu)
      .setTimestamp();

    if (anonyme === "oui") {
      embed.setFooter({
        text: "Partagé anonymement 🌌",
      });
    } else {
      embed.setFooter({
        text: `Par ${interaction.user.username}`,
        iconURL: interaction.user.displayAvatarURL(),
      });
    }

    await dreamsChannel.send({ embeds: [embed] });

    const confirmEmbed = new EmbedBuilder()
      .setColor("#00FFAA")
      .setTitle("Ton rêve a bien été partagé 🌟")
      .setDescription(
        anonyme === "oui"
          ? "Il a été publié anonymement dans le salon des rêves."
          : "Ton message a été publié avec ton pseudo dans le salon des rêves."
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [confirmEmbed] });
  },
};
