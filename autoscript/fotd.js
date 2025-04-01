const axios = require("axios");
const config = require("../config.json");

const CHANNEL_ID = "1332366656428572693"; // ID du salon Discord

let hasSentFactToday = false; // Indicateur pour savoir si le fait du jour a été envoyé

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
        text: [text], // 🔹 Envoyer le texte sous forme de tableau
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

    hasSentFactToday = true; // Marquer comme envoyé pour la journée
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi du message :", error);
  }
}

module.exports = (client) => {
  console.log("💌 Planification du message quotidien activée !");

  // Vérifier si l'envoi automatique doit être fait à 13h15
  setInterval(async () => {
    const now = new Date();
    if (now.getHours() === 9 && now.getMinutes() === 5 && !hasSentFactToday) {
      await sendFactOfTheDay(client);
    }
  }, 30 * 1000);

  // Réinitialisation quotidienne à minuit
  setInterval(() => {
    hasSentFactToday = false;
  }, 24 * 60 * 60 * 1000);
};
