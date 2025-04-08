const { EmbedBuilder } = require("discord.js");
const { DateTime } = require("luxon");
const Market = require("../Sequelize/modèles/argent/bourse/Market");
const Investment = require("../Sequelize/modèles/argent/bourse/Investment");
const MarketHistory = require("../Sequelize/modèles/argent/bourse/MarketHistory");

const CHANNEL_ID = "1332381214836920380";

async function updateMarketPrice(client) {
  try {
    let market = await Market.findOne();
    if (!market) {
      market = await Market.create({ price: 1.0, lastUpdatedAt: new Date() });
    }

    const totalInvested = (await Investment.sum("amountInvested")) || 0;
    const randomness = Math.random() * 1.8 - 0.9;
    const changeFactor = 1 + randomness + totalInvested / 1000000;
    const newPrice = Math.max(0.01, market.price * changeFactor);
    const changePercent = (
      ((newPrice - market.price) / market.price) *
      100
    ).toFixed(2);

    market.price = parseFloat(newPrice.toFixed(4));
    market.updatedAt = new Date(); // 👈 On met à jour la date
    await market.save();

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

function automajbourse(client) {
  console.log(
    "⏳ Lancement de la boucle de vérification toutes les 20 minutes..."
  );

  setInterval(async () => {
    try {
      const market = await Market.findOne();
      const now = DateTime.now();

      if (
        !market?.updatedAt ||
        DateTime.fromJSDate(market.updatedAt).plus({ hours: 2 }) <= now
      ) {
        console.log(
          "⏰ Plus de 2h depuis la dernière mise à jour, on met à jour !"
        );
        await updateMarketPrice(client);
      } else {
        const nextUpdate = DateTime.fromJSDate(market.updatedAt)
          .plus({ hours: 2 })
          .toRelative();
        console.log(`🕒 Prochaine mise à jour dans ${nextUpdate}`);
      }
    } catch (err) {
      console.error("❌ Erreur dans la vérification boursière :", err);
    }
  }, 20 * 60 * 1000); // Toutes les 20 minutes
}

module.exports = {
  automajbourse,
  updateMarketPrice,
};
