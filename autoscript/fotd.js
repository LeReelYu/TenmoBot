const axios = require("axios");
const config = require("../config.json");

// 🔹 Change ici l'ID du salon où envoyer le message
const CHANNEL_ID = "1332366656428572693"; // Remplace par l'ID du salon Discord

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
  try {
    const response = await axios.post(
      "https://api-free.deepl.com/v2/translate", // URL fixée directement ici
      new URLSearchParams({
        auth_key: config.deepl_api_key, // Clé API récupérée depuis config.json
        text: text,
        target_lang: "FR",
      }).toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    return response.data.translations[0].text;
  } catch (error) {
    console.error("❌ Erreur lors de la traduction avec DeepL :", error);
    return text; // En cas d'erreur, retourne le texte original
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
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi du message :", error);
  }
}

module.exports = (client) => {
  console.log("💌 Planification du message quotidien activée.");

  setInterval(async () => {
    const now = new Date();
    if (now.getHours() === 12 && now.getMinutes() === 30) {
      await sendFactOfTheDay(client);
    }
  }, 60 * 1000);
};
