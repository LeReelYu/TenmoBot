const { SlashCommandBuilder, AttachmentBuilder } = require("discord.js");
const { ChartJSNodeCanvas } = require("chartjs-node-canvas");
const MarketHistory = require("../../../Sequelize/modèles/argent/bourse/MarketHistory");
const { subDays } = require("date-fns");

const width = 800;
const height = 400;
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

module.exports = {
  data: new SlashCommandBuilder()
    .setName("chart")
    .setDescription(
      "Affiche un graphique de l'évolution du Maocoin cette semaine"
    ),

  async execute(interaction) {
    const oneWeekAgo = subDays(new Date(), 7);

    const records = await MarketHistory.findAll({
      where: {
        recordedAt: {
          [require("sequelize").Op.gte]: oneWeekAgo,
        },
      },
      order: [["recordedAt", "ASC"]],
    });

    if (records.length === 0) {
      return interaction.reply(
        "📉 Pas encore assez de données pour afficher un graphique !"
      );
    }

    const labels = records.map((r) => r.recordedAt.toISOString());
    const data = records.map((r) => r.price);

    const config = {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Évolution du Maocoin",
            data,
            borderColor: "#00cc99",
            backgroundColor: "rgba(0, 204, 153, 0.2)",
            tension: 0.25,
            fill: true,
          },
        ],
      },
      options: {
        scales: {
          x: {
            type: "time",
            time: {
              unit: "hour",
              tooltipFormat: "dd/MM/yyyy HH:mm",
            },
            title: {
              display: true,
              text: "Temps",
            },
          },
          y: {
            title: {
              display: true,
              text: "Prix (pièces)",
            },
            beginAtZero: false,
          },
        },
        plugins: {
          legend: {
            display: false,
          },
        },
      },
    };

    const image = await chartJSNodeCanvas.renderToBuffer(config);
    const attachment = new AttachmentBuilder(image, { name: "bourse.png" });

    await interaction.reply({
      content: "📊 Voici l'évolution du Maocoin cette semaine :",
      files: [attachment],
    });
  },
};
