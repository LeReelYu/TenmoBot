const { EmbedBuilder } = require("discord.js");
const { DateTime } = require("luxon");
const Market = require("../Sequelize/modèles/argent/bourse/Market");
const Investment = require("../Sequelize/modèles/argent/bourse/Investment");
const MarketHistory = require("../Sequelize/modèles/argent/bourse/MarketHistory");

const CHANNEL_ID = "1332381214836920380";
const BANKRUPTCY_THRESHOLD = -0.5;
const BANKRUPTCY_DURATION = 4 * 60 * 60 * 1000;

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
  try {
    let market = await Market.findOne();
    if (!market) {
      market = await Market.create({
        price: 1.0,
        trend: "up",
        isInBankruptcy: false,
        bankruptcySince: null,
      });
    }

    if (market.isInBankruptcy) {
      const timeSince =
        DateTime.now() - DateTime.fromJSDate(market.bankruptcySince);
      if (timeSince >= BANKRUPTCY_DURATION) {
        market.price = 1.0;
        market.isInBankruptcy = false;
        market.bankruptcySince = null;
        await market.save();

        await Investment.update({ amountInvested: 0 }, { where: {} });

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

    const totalInvested = (await Investment.sum("amountInvested")) || 0;

    let randomness = Math.random() * 1.6 - 0.8;
    const trendInfluence = 0.05 * (Math.random() - 0.5);
    if (market.trend === "up") randomness += trendInfluence;
    else randomness -= trendInfluence;

    const investmentImpact = totalInvested / 250000;
    const changeFactor = 1 + randomness + investmentImpact;

    let newPrice = parseFloat((market.price * changeFactor).toFixed(4));
    const changePercent = (
      ((newPrice - market.price) / market.price) *
      100
    ).toFixed(2);

    if (newPrice <= BANKRUPTCY_THRESHOLD) {
      market.isInBankruptcy = true;
      market.bankruptcySince = new Date();
      await market.save();

      const embed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle("💥 Faillite du Maocoin !")
        .setDescription(
          `Le cours est tombé à **${newPrice}**, ce qui déclenche une **faillite générale**.\n\n` +
            `💤 Le Maocoin est gelé pour 4h, puis repartira à un taux de base de **1.0**.`
        )
        .setTimestamp();

      const channel = await client.channels.fetch(CHANNEL_ID);
      if (channel && channel.isTextBased())
        await channel.send({ embeds: [embed] });

      console.log("❌ Faillite du Maocoin !");
      return;
    }

    const eventChance = Math.random();
    if (eventChance < 0.05) {
      const event = EVENTS[Math.floor(Math.random() * EVENTS.length)];

      if (event.type === "benediction") {
        const guild = await client.guilds.fetch("TON_GUILD_ID");
        const members = await guild.members.fetch();
        const randomMember = members.random();
        event.message = `${randomMember} a ouvert son compte OnlyFans !`;
      }

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

      console.log(`🚨 Événement économique déclenché : ${event.message}`);
    }

    market.trend = newPrice > market.price ? "up" : "down";
    market.price = newPrice;
    market.updatedAt = new Date();
    await market.save();

    await MarketHistory.create({
      price: market.price,
      recordedAt: new Date(),
    });

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
    if (channel && channel.isTextBased()) {
      await channel.send({ embeds: [embed] });
    }

    console.log(`💰 Nouveau prix : ${market.price} (${changePercent}%)`);
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour du marché : ", error);
  }
}

// ✅ VERSION MODIFIÉE : vérifie toutes les minutes + logs détaillés
function automajbourse(client) {
  console.log("⏳ Lancement de la vérification toutes les minutes...");

  setInterval(async () => {
    try {
      const market = await Market.findOne();
      const now = DateTime.now();

      if (!market?.updatedAt) {
        console.log("❗ Aucun updatedAt trouvé. Mise à jour immédiate.");
        await updateMarketPrice(client);
        return;
      }

      const lastUpdate = DateTime.fromJSDate(market.updatedAt);
      const nextUpdate = lastUpdate.plus({ hours: 2 });

      console.log("🔍 Vérification Bourse...");
      console.log(`🕓 Now            : ${now.toFormat("HH:mm:ss")}`);
      console.log(`📅 Dernière MAJ  : ${lastUpdate.toFormat("HH:mm:ss")}`);
      console.log(`⏭️ Prochaine MAJ : ${nextUpdate.toFormat("HH:mm:ss")}`);

      if (now >= nextUpdate) {
        console.log("✅ 2h écoulées, mise à jour déclenchée !");
        await updateMarketPrice(client);
      } else {
        console.log("🕒 Pas encore 2h, en attente...");
      }
    } catch (err) {
      console.error("❌ Erreur dans la vérification :", err);
    }
  }, 60 * 1000); // toutes les minutes
}

module.exports = {
  automajbourse,
  updateMarketPrice,
};
