const { EmbedBuilder } = require("discord.js");
const { DateTime } = require("luxon"); // Importation de Luxon
const Market = require("../Sequelize/modèles/argent/bourse/Market");
const Investment = require("../Sequelize/modèles/argent/bourse/Investment");

// 👇 Remplace par le vrai ID de ton salon
const CHANNEL_ID = "1332381214836920380"; // Salon où l'update de la bourse sera envoyé

// Fonction pour mettre à jour le prix du marché
async function updateMarketPrice(client) {
  try {
    let market = await Market.findOne();
    // Si le marché n'existe pas, on le crée avec un prix de départ
    if (!market) {
      market = await Market.create({ price: 1.0 });
    }

    // Récupère le total des investissements
    const totalInvested = (await Investment.sum("amountInvested")) || 0;

    // Calcul de la variation aléatoire entre -90% et +90%
    const randomness = Math.random() * 1.8 - 0.9; // Variation entre [-0.9, +0.9]
    const changeFactor = 1 + randomness + totalInvested / 1000000;

    // Calcul du nouveau prix, avec un minimum de 0.01
    const newPrice = Math.max(0.01, market.price * changeFactor);
    const changePercent = (
      ((newPrice - market.price) / market.price) *
      100
    ).toFixed(2); // Calcul du pourcentage de variation

    // Mise à jour du prix dans la base de données
    market.price = parseFloat(newPrice.toFixed(4));
    await market.save();

    // Affichage dans la console
    console.log(
      `[BOURSE AUTO] Nouveau prix du Maocoin : ${market.price} (${changePercent}%)`
    );

    // ➕ Envoi d'un message embed dans le salon
    const embed = new EmbedBuilder()
      .setColor(0xffa500)
      .setTitle("📈 Mise à jour automatique de la Bourse")
      .setDescription(
        `Le **nouveau prix** du Maocoin est de **${market.price} pièces**.\n` +
          `Variation : **${changePercent}%**`
      )
      .setTimestamp(DateTime.now().toJSDate()); // Utilisation de Luxon pour l'horodatage

    // Récupère le salon où l'embed sera envoyé
    const channel = await client.channels.fetch(CHANNEL_ID);
    if (channel && channel.isTextBased()) {
      // Envoie l'embed dans le salon
      await channel.send({ embeds: [embed] });
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour du marché : ", error);
  }
}

// Fonction pour automatiser la mise à jour de la bourse
function automajbourse(client) {
  try {
    // Mise à jour immédiate au démarrage
    updateMarketPrice(client);

    // Ensuite, on fait une mise à jour toutes les 2 heures (2 * 60 * 60 * 1000 ms)
    setInterval(() => updateMarketPrice(client), 2 * 60 * 60 * 1000);
  } catch (error) {
    console.error(
      "Erreur dans la mise à jour automatique de la bourse : ",
      error
    );
  }
}

module.exports = { automajbourse };
