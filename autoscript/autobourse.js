const { EmbedBuilder } = require("discord.js");
const { DateTime } = require("luxon");
const Market = require("../Sequelize/modèles/argent/bourse/Market");
const Investment = require("../Sequelize/modèles/argent/bourse/Investment");
const MarketHistory = require("../Sequelize/sequelize");

// 👇 ID du salon où l'update de la bourse sera envoyé
const CHANNEL_ID = "1332381214836920380";

// 👇 Modifier cette variable à "oui" ou "non"
const ACTIVER_BOURSE_AUTO = "non"; // "non" pour désactiver

// Fonction pour mettre à jour le prix du marché
async function updateMarketPrice(client) {
  try {
    let market = await Market.findOne();
    if (!market) {
      market = await Market.create({ price: 1.0 });
    }

    const totalInvested = (await Investment.sum("amountInvested")) || 0;

    const randomness = Math.random() * 1.8 - 0.9; // [-0.9, +0.9]
    const changeFactor = 1 + randomness + totalInvested / 1000000;

    const newPrice = Math.max(0.01, market.price * changeFactor);
    const changePercent = (
      ((newPrice - market.price) / market.price) *
      100
    ).toFixed(2);

    market.price = parseFloat(newPrice.toFixed(4));
    await market.save();

    // ✅ Enregistrer dans l'historique
    await MarketHistory.create({
      price: market.price,
      recordedAt: new Date(),
    });

    console.log(
      `💰 Nouveau prix du Maocoin : ${market.price} (${changePercent}%)`
    );

    const embed = new EmbedBuilder()
      .setColor(0xffa500)
      .setTitle("📈 Mise à jour automatique de la Bourse")
      .setDescription(
        `Le **nouveau prix** du Maocoin est de **${market.price} pièces**.\n` +
          `Variation : **${changePercent}%**`
      )
      .setTimestamp(DateTime.now().toJSDate());

    const channel = await client.channels.fetch(CHANNEL_ID);
    if (channel && channel.isTextBased()) {
      await channel.send({ embeds: [embed] });
      await channel.send(
        "📢 La bourse vient d’évoluer, consultez le nouvel état !"
      );
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour du marché : ", error);
  }
}

// Fonction pour automatiser la mise à jour de la bourse
function automajbourse(client) {
  try {
    if (ACTIVER_BOURSE_AUTO.toLowerCase() !== "oui") {
      console.log("💰 Mise à jour automatique désactivée.");
      return;
    }

    // Appel immédiat + mises à jour toutes les 2h
    updateMarketPrice(client);
    setInterval(() => updateMarketPrice(client), 2 * 60 * 60 * 1000);
  } catch (error) {
    console.error(
      "Erreur dans la mise à jour automatique de la bourse : ",
      error
    );
  }
}

module.exports = { automajbourse };
