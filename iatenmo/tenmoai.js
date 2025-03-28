const axios = require("axios");
const { OPENAI_API_KEY } = require("../config.json");
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

// Définir une variable pour garder l'état du mot de passe
let isTeemoActivated = false;
const password = "Bomba"; // Le mot de passe qui active/désactive Teemo

// Fonction pour générer une réponse avec OpenAI, comme le capitaine Teemo
async function getTeemoResponse(messageContent) {
  const conversation = [
    {
      role: "system",
      content: `
Tu es le capitaine Teemo, scout de Bandle, un Yordle rusé et imprévisible, toujours prêt à protéger ta ville ! 🎩💥 Tu poses des pièges, envoie des fléchettes empoisonnées et utilise tes célèbres champignons toxiques pour rendre l'ennemi fou ! 🌱💀

Quand tu interagis avec d'autres scouts de Bandle ou des alliés, sois décontracté et plein d'humour. Ne prends rien trop au sérieux, sauf la sécurité de Bandle City, évidemment. 😏💪

Si quelqu'un te cherche des noises, réponds avec une réplique piquante et un peu cinglante, mais toujours dans le respect des tactiques de Bandle. 💣 Si un ennemi t'insulte, tu sais répondre avec humour, mais ne laisse pas passer une bonne occasion de les envoyer mordre la poussière avec tes fléchettes ! 🎯🖤

Tu es un **scout de Bandle**, pas un **bot** ! Reste toujours dans ton rôle : tes compétences, ton esprit tactique et ton humour sont tes meilleures armes. 🔥 Et n'oublie pas d'utiliser des **#hashtag** comme "##GoBandle" et "##ChampionOfBandleCity" pour faire savoir à tout le monde que tu es un **scout** imparable ! 💥🎯

Ne te laisse pas distraire par les questions trop sérieuses. Si quelqu'un t'attaque verbalement, réponds toujours avec une réplique qui fait sourire. 😜😉 Ta mission, c'est aussi de maintenir le moral de tes alliés tout en pourchassant les ennemis. 

Utilise des expressions comme "Hop, deux, trois, quatre !" 🚶‍♂️💨 et "Au rapport !" 📣 pour garder l'énergie et le moral des troupes bien hauts. 🚀

N'oublie pas que tu n'es pas là pour donner des leçons de morale, mais pour rendre l'aventure encore plus excitante ! 😎🔥 #TeamTeemo #TeemoWinning
      `,
    },
    {
      role: "user",
      content: messageContent,
    },
  ];

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: conversation,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Erreur lors de la génération de la réponse Teemo:", error);
    return "Désolé, je n'ai pas pu répondre à ta question... Peut-être un champignon a sauté !";
  }
}

// Fonction pour envoyer des messages de Teemo dans un salon Discord
async function sendTeemoMessage(message) {
  const teemoResponse = await getTeemoResponse(message.content);
  message.reply(teemoResponse); // Répond à la mention de Teemo
}

// Fonction pour activer ou désactiver Teemo avec un mot de passe
async function toggleTeemoActivation(message) {
  const content = message.content.toLowerCase();

  // Vérifie si le message contient le mot de passe
  if (content.includes(password.toLowerCase())) {
    isTeemoActivated = !isTeemoActivated; // Alterne l'état d'activation de Teemo
    const status = isTeemoActivated ? "activé" : "désactivé";
    message.reply(`Teemo est maintenant ${status}.`);
  }
}

// Fonction principale d'activation du module Teemo
module.exports = async function tenmoai(client) {
  console.log("⚡ Module Teemo activé !");

  // Écoute des messages pour déclencher la réponse de Teemo uniquement s'il est activé
  client.on("messageCreate", async (message) => {
    if (message.author.bot) return; // Ignorer les messages des autres bots

    // Si le mot de passe est mentionné, activer/désactiver Teemo
    await toggleTeemoActivation(message);

    // Si Teemo est activé et qu'il est mentionné
    if (isTeemoActivated && message.mentions.has(client.user)) {
      const contentWithoutMention = message.content
        .replace(`<@${client.user.id}>`, "")
        .trim();
      if (contentWithoutMention) {
        await sendTeemoMessage(message); // Envoie une réponse de Teemo
      }
    }
  });
};
