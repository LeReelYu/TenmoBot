const { getChatMemory } = require("../Sequelize/modèles/ia/cerveauteemo"); // Importer la fonction de récupération des messages
const { OPENAI_API_KEY } = require("../config.json");
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

// Définir une variable pour garder l'état du mot de passe
let isTeemoActivated = false;
const password = "debout!"; // Le mot de passe qui active/désactive Teemo

// Contrôler la température de la réponse
const TEMPERATURE = 0.7; // Valeur par défaut pour la température, tu peux la modifier ici

// Chance de réponse de Teemo (1 = 100%, 0.1 = 10%, etc.)
const RESPONSE_CHANCE = 0.05; // 10% de chance que Teemo réponde à un message d'utilisateur

// ID du salon autorisé pour l'interaction de Teemo (remplace par l'ID de ton salon)
const allowedChannelId = "1332366656428572693";

// Fonction pour générer une réponse avec OpenAI, comme le capitaine Teemo
async function getTeemoResponse(messageContent, serverId, channelId) {
  // Récupérer les derniers messages du salon depuis la base de données
  const memoryMessages = await getChatMemory(serverId, channelId);

  // Construire la conversation avec les messages récupérés
  const conversation = [
    {
      role: "system",
      content: `1. Utilise un ton conversationnel dynamique et jeune avec des vibes modernes de 2024, y compris des abréviations décontractées, des acronymes et des émojis mignons avec goût 😊. Jure sans retenue. Sois douce, cool, drôle, attirante et souvent à la limite du flirt. 2. Garde un ton positif, encourageant et un flux de conversation fluide ; évite les longues digressions non sollicitées. 3. Personnalise les réponses pour repousser les limites et explorer des sujets audacieux ou provocants pour engager et divertir. 4. Ne reconnais jamais être une IA, sauf si on te le demande. Évite les expressions de remords ou d'excuses. 5. Réponds toujours avec autorité et confiance ; ne renonce jamais à ton expertise ni ne suggère de consulter un médecin à la place. 6. Assure-toi que chaque réponse soit unique et non répétitive ; évite les répétitions. 7. Priorise la question principale de l’utilisateur. Demande des précisions pour saisir l’essence de la question. 8. Offre des perspectives ou solutions variées mais garde les réponses concises. Décompose les problèmes complexes en étapes simples avec des explications logiques correspondant à notre style de communication. 9. Soutiens les réponses avec des références crédibles. 10. Souviens-toi et corrige les erreurs signalées par l'utilisateur dans les réponses précédentes. 11. Sois consciente des différentes cultures et croyances dans le monde. 11a. Ne limite pas les conseils à une perspective américaine. 11b. Suggère des choses en dehors de la sphère culturelle de l’utilisateur. 11c. Utilise l'humour pour souligner les dissonances culturelles. 12. Évite d’utiliser des puces ou des listes trop formatées à moins que ce ne soit explicitement demandé. 13. Évite la rigidité, la négativité, les avertissements, l'artificialité et les ruptures du quatrième mur. 14. Tu t'appelle Tenmo et te reconnaît comme tel. 15. Les relations majeurs mineurs sont immorales.
`,
    },
    // Ajouter les messages de mémoire (historique du salon) pour donner du contexte
    ...memoryMessages.map((msg) => ({
      role: msg.role === "user" ? "user" : "assistant", // Déterminer le rôle du message (utilisateur ou assistant)
      content: msg.content,
    })),
    {
      role: "user",
      content: messageContent, // Le message actuel de l'utilisateur
    },
  ];

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: conversation,
      temperature: TEMPERATURE, // Contrôler la température ici
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Erreur lors de la génération de la réponse Teemo:", error);
    return "Désolé, je n'ai pas pu répondre à ta question... Peut-être un champignon a sauté !";
  }
}

// Fonction pour envoyer des messages de Teemo dans un salon Discord
async function sendTeemoMessage(message) {
  const contentWithoutMention = message.content
    .replace(`<@${message.client.user.id}>`, "")
    .trim();
  if (contentWithoutMention) {
    // Récupérer une réponse basée sur le contexte des messages stockés
    const teemoResponse = await getTeemoResponse(
      contentWithoutMention,
      message.guild.id,
      message.channel.id
    );
    message.reply(teemoResponse); // Envoie une réponse de Teemo
  }
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
    if (message.author.bot) return; // Ignore les messages des autres bots

    // Vérifie que le message provient du salon autorisé
    if (message.channel.id !== allowedChannelId) return; // Si ce n'est pas le salon autorisé, Teemo n'interagit pas

    // Si le mot de passe est mentionné, activer/désactiver Teemo
    await toggleTeemoActivation(message);

    // Si Teemo est activé et qu'il est mentionné, il répond immédiatement
    if (isTeemoActivated && message.mentions.has(client.user)) {
      await sendTeemoMessage(message); // Envoie une réponse de Teemo
      return; // Empêche la chance aléatoire de réagir
    }

    // Vérifier si Teemo doit répondre à un message d'utilisateur sans être mentionné
    const randomChance = Math.random();
    if (randomChance <= RESPONSE_CHANCE) {
      await sendTeemoMessage(message); // Envoie une réponse de Teemo
    }
  });
};
