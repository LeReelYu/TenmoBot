const axios = require("axios");
const config = require("../../config.json");

const CHANNEL_ID = "1332366656428572693";
let hasSentFactToday = false;
let lastSentTime = null;

async function getFact() {
  try {
    const response = await axios.get(
      "https://uselessfacts.jsph.pl/random.json"
    );
    return response.data.text;
  } catch (error) {
    console.error("❌ Erreur lors de la récupération du fait :(", error);
    return null;
  }
}

async function translateToFrench(text) {
  if (!text) {
    console.error("❌ Le texte à traduire est vide !");
    return "Erreur : aucun texte à traduire.";
  }

  try {
    const response = await axios.post(
      "https://api-free.deepl.com/v2/translate",
      {
        auth_key: config.deepl_api_key,
        text: [text],
        target_lang: "FR",
      },
      { headers: { "Content-Type": "application/json" } }
    );

    return response.data.translations[0].text;
  } catch (error) {
    console.error(
      "❌ Erreur lors de la traduction avec DeepL :",
      error.response?.data || error.message
    );
    return text;
  }
}

async function sendFactOfTheDay(client) {
  try {
    const channel = await client.channels.fetch(CHANNEL_ID);
    if (!channel) {
      console.error(`❌ Salon non trouvé (ID: ${CHANNEL_ID}) !`);
      return;
    }

    const fact = await getFact();
    if (!fact) return;

    const translatedFact = await translateToFrench(fact);
    await channel.send(`📢 **Le savais-tu ?** ${translatedFact}`);

    hasSentFactToday = true;
    lastSentTime = new Date().toISOString().slice(0, 16); // yyyy-MM-ddTHH:mm
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi du message :", error);
  }
}

module.exports = (client) => {
  console.log("💌 Planification du message quotidien activée !");

  setInterval(async () => {
    const now = new Date();
    const currentTime = now.toISOString().slice(11, 16); // HH:mm

    if (
      now.getHours() === 9 &&
      now.getMinutes() === 5 &&
      !hasSentFactToday &&
      lastSentTime !== currentTime
    ) {
      await sendFactOfTheDay(client);
    }
  }, 60 * 1000); // vérifie chaque minute

  // Réinitialisation quotidienne à minuit
  setInterval(() => {
    hasSentFactToday = false;
  }, 24 * 60 * 60 * 1000);
};
