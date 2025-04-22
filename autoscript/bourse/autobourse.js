const { EmbedBuilder } = require("discord.js");
const { DateTime } = require("luxon");
const Market = require("../../Sequelize/modèles/argent/bourse/Market");
const Investment = require("../../Sequelize/modèles/argent/bourse/Investment");

const CHANNEL_ID = "1332381214836920380";
const BANKRUPTCY_THRESHOLD = -0.5;
const BANKRUPTCY_DURATION = 4 * 60 * 60 * 1000;
const MARKET_HOURS = { start: 10, end: 22 };

const EVENTS = [
  {
    type: "tsunami",
    impact: -0.6,
    message:
      "🌊 Un tsunami a frappé l'île, le prix du Maocoin chute brutalement !",
  },
  {
    type: "benediction",
    impact: 0.3,
    message: "Mao a ouvert son compte OnlyFans !",
  },
];

async function updateMarketPrice(client) {
  const nowHour = DateTime.now().hour;
  if (nowHour < MARKET_HOURS.start || nowHour >= MARKET_HOURS.end) {
    console.log("🚫 Marché fermé, pas de mise à jour.");
    return;
  }

  try {
    let market = await Market.findOne();
    if (!market) {
      market = await Market.create({
        price: 1.0,
        trend: "up",
        isInBankruptcy: false,
        bankruptcySince: null,
        consecutiveUpCount: 0,
      });
    }

    if (market.isInBankruptcy) {
      const timeSince =
        DateTime.now() - DateTime.fromJSDate(market.bankruptcySince);
      if (timeSince >= BANKRUPTCY_DURATION) {
        market.price = 1.0;
        market.isInBankruptcy = false;
        market.bankruptcySince = null;
        market.consecutiveUpCount = 0;
        await market.save();

        const recoveryEmbed = new EmbedBuilder()
          .setColor(0x00ff00)
          .setTitle("🟢 Relance du Maocoin !")
          .setDescription(
            "Après une période de faillite, le **Maocoin** redémarre à un prix de **1.0 pièce**."
          )
          .setTimestamp();

        const channel = await client.channels.fetch(CHANNEL_ID);
        if (channel && channel.isTextBased())
          await channel.send({ embeds: [recoveryEmbed] });

        console.log("✅ Faillite terminée, le cours est revenu à 1.0");
        return;
      } else {
        console.log("⛔ Toujours en faillite, aucune évolution.");
        return;
      }
    }

    // Influence des investissements : plus il y en a, plus l'évolution tend vers le haut
    const totalInvested = (await Investment.sum("amountInvested")) || 0;
    const investInfluence = Math.min(totalInvested / 500000, 0.05); // max +5%
    const direction = market.trend === "up" ? 1 : -1;

    const randomPercent = (Math.random() * 20 - 10) / 100; // -10% à +10%
    const adjustedChange = randomPercent + direction * investInfluence;
    let newPrice = parseFloat((market.price * (1 + adjustedChange)).toFixed(4));

    // Événement surprise
    if (Math.random() < 0.05) {
      const event = EVENTS[Math.floor(Math.random() * EVENTS.length)];
      newPrice = parseFloat((newPrice + event.impact).toFixed(4));

      const eventEmbed = new EmbedBuilder()
        .setColor(event.type === "tsunami" ? 0xff0000 : 0x00ff00)
        .setTitle(
          event.type === "tsunami" ? "💥 Tsunami !" : "✨ Bénédiction de Mao !"
        )
        .setDescription(event.message)
        .setTimestamp();

      const channel = await client.channels.fetch(CHANNEL_ID);
      if (channel && channel.isTextBased())
        await channel.send({ embeds: [eventEmbed] });

      console.log(`🚨 Événement économique : ${event.message}`);
    }

    if (newPrice <= BANKRUPTCY_THRESHOLD) {
      market.isInBankruptcy = true;
      market.bankruptcySince = new Date();
      market.consecutiveUpCount = 0;
      await market.save();

      const embed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle("💥 Faillite du Maocoin !")
        .setDescription(
          `Le cours est tombé à **${newPrice}**, ce qui déclenche une **faillite générale**.\n\n💤 Le Maocoin est gelé pour 4h.`
        )
        .setTimestamp();

      const channel = await client.channels.fetch(CHANNEL_ID);
      if (channel && channel.isTextBased())
        await channel.send({ embeds: [embed] });

      console.log("❌ Faillite du Maocoin !");
      return;
    }

    const changePercent = (
      ((newPrice - market.price) / market.price) *
      100
    ).toFixed(2);
    market.trend = newPrice > market.price ? "up" : "down";
    market.consecutiveUpCount =
      market.trend === "up" ? (market.consecutiveUpCount || 0) + 1 : 0;
    market.price = newPrice;
    market.updatedAt = new Date();
    await market.save();

    const embed = new EmbedBuilder()
      .setColor(0xffa500)
      .setTitle("📈 Mise à jour automatique de la Bourse")
      .setDescription(
        `Le **nouveau prix** du Maocoin est de **${market.price} pièces**.\n` +
          `Variation : **${changePercent}%**\n` +
          `Tendance actuelle : **${
            market.trend === "up" ? "📈 Haussière" : "📉 Baissière"
          }**`
      )
      .setTimestamp(DateTime.now().toJSDate());

    const channel = await client.channels.fetch(CHANNEL_ID);
    if (channel && channel.isTextBased())
      await channel.send({ embeds: [embed] });

    console.log(
      `💰 Nouveau prix : ${market.price} (${changePercent}%) | Tendance : ${market.trend} | Hausses consécutives : ${market.consecutiveUpCount}`
    );
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour du marché : ", error);
  }
}

function automajbourse(client) {
  console.log(
    "⏳ Lancement de la vérification boursière toutes les vingt minutes..."
  );

  setInterval(async () => {
    try {
      const now = DateTime.now();
      const hour = now.hour;
      if (hour < MARKET_HOURS.start || hour >= MARKET_HOURS.end) {
        console.log("🚫 Marché fermé actuellement (entre 22h et 10h).");
        return;
      }

      const market = await Market.findOne();
      if (!market?.updatedAt) {
        console.log("❗ Aucun updatedAt trouvé. Mise à jour immédiate.");
        await updateMarketPrice(client);
        return;
      }

      const lastUpdate = DateTime.fromJSDate(market.updatedAt);
      const nextUpdate = lastUpdate.plus({ hours: 1 });
      if (now >= nextUpdate) {
        console.log("✅ 1h écoulée, mise à jour déclenchée !");
        await updateMarketPrice(client);
      } else {
        console.log(
          "🕒 Pas encore 1h, en attente pour l'évolution boursière..."
        );
      }
    } catch (err) {
      console.error("❌ Erreur dans la vérification :", err);
    }
  }, 20 * 60 * 1000);
}

module.exports = {
  automajbourse,
  updateMarketPrice,
};
