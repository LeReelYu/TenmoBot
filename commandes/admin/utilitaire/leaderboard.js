const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Economie = require("../../../Sequelize/modèles/argent/économie");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Affiche le leaderboard des membres"),

  async execute(interaction) {
    const type = interaction.options.getString("type");

    let leaderboard;
    let title;
    let description;

    if (type === "pièces") {
      leaderboard = await Economie.findAll({
        order: [["pièces", "DESC"]],
        limit: 10,
      });

      title = "Leaderboard des Pièces";
      description = leaderboard.length
        ? leaderboard
            .map(
              (user, index) =>
                `**${index + 1}.** <@${user.userId}> - **${
                  user.pièces
                } pièces**`
            )
            .join("\n")
        : "Aucun utilisateur n'a encore de pièces.";
    }

    const randomColor = () => {
      const color = Math.floor(Math.random() * 16777215).toString(16);
      return `#${color.padStart(6, "0")}`;
    };

    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .setColor(randomColor())
      .setFooter({
        text: "Tom Nook",
        iconURL:
          "https://pbs.twimg.com/profile_images/1280368407586594817/bUqZkDDU_400x400.jpg",
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
