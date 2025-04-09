/*const OpenAI = require("openai");
const { OPENAI_API_KEY } = require("../config.json");

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY, // Assurez-vous que l'API KEY est définie dans votre environnement
});

const zodiacSigns = [
  "Bélier",
  "Taureau",
  "Gémeaux",
  "Cancer",
  "Lion",
  "Vierge",
  "Balance",
  "Scorpion",
  "Sagittaire",
  "Capricorne",
  "Verseau",
  "Poissons",
];

// Générer un horoscope pour chaque signe (format court et humoristique)
async function generateHoroscopes() {
  const horoscopes = [];

  for (let i = 0; i < zodiacSigns.length; i++) {
    const sign = zodiacSigns[i];
    const horoscope = await getHoroscopeForSign(sign);
    horoscopes.push(`${sign.toUpperCase()} ${horoscope}`);
  }

  return horoscopes.join("\n\n");
}

// Fonction pour générer un horoscope pour un signe spécifique
async function getHoroscopeForSign(sign) {
  const conversation = [
    {
      role: "system",
      content: `
      Tu es un astrologue décalé et humoristique. Chaque horoscope doit être rempli de surprises, de mystères, et une bonne dose de rigolade ! Garde en tête que chaque signe du zodiaque mérite une prévision farfelue mais crédible, avec des emojis. Sois fun et un peu décalé, mais reste dans le ton du zodiaque. 
      La réponse doit forcément être un seul court paragraphe, avec des suggestions amusantes, des références farfelues, des emojis, et une touche légère mais significative.
      Le texte doit être structuré comme une prévision comique et doit être d'environ 3 phrases.
      Tu ne dois que donner l'horoscope du jour pas du mois. 
      `,
    },
    {
      role: "user",
      content: `Fais-moi l'horoscope pour le signe ${sign} avec une touche d'humour et d'originalité, s'il te plaît !`,
    },
  ];

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: conversation,
    });

    // Retourner la réponse générée par OpenAI
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("Erreur lors de la génération de l'horoscope:", error);
    return "Désolé, l'horoscope est en pause... Les champignons se sont rebellés ! 🍄";
  }
}

// Fonction pour envoyer l'horoscope complet dans le salon Discord
async function sendHoroscope(channel) {
  let horoscopeMessage = await generateHoroscopes();

  const maxMessageLength = 2000;
  while (horoscopeMessage.length > maxMessageLength) {
    await channel.send(horoscopeMessage.slice(0, maxMessageLength));
    horoscopeMessage = horoscopeMessage.slice(maxMessageLength);
  }

  await channel.send(horoscopeMessage);
}

// Fonction principale appelée dans le ready.js
module.exports = async function tenmohoroscope(client) {
  const channelId = "1332366656428572693"; // Remplacez par l'ID de votre salon Discord

  try {
    const channel = await client.channels.fetch(channelId);
    if (!channel) {
      console.error("❌ Salon introuvable !");
      return;
    }

    let lastSentTime = null;
    let isPaused = false; // Indicateur pour savoir si on est en pause

    setInterval(async () => {
      if (isPaused) return; // Si on est en pause, ne pas vérifier

      const now = new Date();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const currentTime = `${hours}:${minutes}`;

      // Vérifie si l'heure est 12:00 (ou toute autre heure de votre choix)
      if (hours === "11" && minutes === "51" && lastSentTime !== currentTime) {
        try {
          // Vérifie que le channel est de type textuel
          if (channel.type === "text" || channel.isTextBased()) {
            await sendHoroscope(channel);
            console.log(`✅ Horoscope envoyé à ${currentTime}`);
            lastSentTime = currentTime; // Empêche les doublons pour cette heure

            isPaused = true; // Active la pause après l'envoi de l'horoscope
            console.log("⏸️ Pause d'horoscope activée");

            // Réactive la vérification après 20 minutes
            setTimeout(() => {
              isPaused = false;
              console.log("▶️ Pause terminée, reprise des vérifications.");
            }, 20 * 60 * 1000); // 20 minutes en millisecondes
          } else {
            console.error("❌ Le canal n'est pas un canal textuel.");
          }
        } catch (error) {
          console.error("❌ Erreur lors de l'envoi de l'horoscope :", error);
        }
      }
    }, 30 * 1000); // Vérifie toutes les 3 secondes
  } catch (error) {
    console.error("❌ Erreur lors de la récupération du salon :", error);
  }
};
*/
