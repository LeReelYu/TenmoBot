const { EmbedBuilder } = require("discord.js");
const { DateTime } = require("luxon");
const Market = require("../Sequelize/modèles/argent/bourse/Market");
const Investment = require("../Sequelize/modèles/argent/bourse/Investment");
const MarketHistory = require("../Sequelize/modèles/argent/bourse/MarketHistory"); // 🛠 Corrigé

// 👇 ID du salon où l'update de la bourse sera envoyé
const CHANNEL_ID = "1332381214836920380";

// Fonction pour mettre à jour le prix du marché (utilisable partout)
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

    // ✅ Historique
    await MarketHistory.create({
      price: market.price,
      recordedAt: new Date(),
    });

    console.log(
      `💰 Mise à jour boursière : ${market.price} pièces (${changePercent}%)`
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
    console.error("❌ Erreur lors de la mise à jour du marché : ", error);
  }
}

// Fonction pour automatiser la mise à jour toutes les 2 heures
function automajbourse(client) {
  console.log(
    "⏳ Lancement de la boucle de mise à jour boursière toutes les 2h..."
  );

  setInterval(async () => {
    console.log("🔁 Déclenchement de la mise à jour boursière planifiée.");
    try {
      await updateMarketPrice(client);
    } catch (err) {
      console.error("❌ Erreur dans l'intervalle boursier :", err);
    }
  }, 2 * 60 * 60 * 1000); // Toutes les 2 heures
}

module.exports = {
  automajbourse,
  updateMarketPrice, // ✅ Exportée pour réutilisation dans la commande slash
};
