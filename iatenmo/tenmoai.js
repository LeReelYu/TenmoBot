const { getChatMemory } = require("../Sequelize/modèles/ia/cerveauteemo"); // Importer la fonction de récupération des messages
const { OPENAI_API_KEY } = require("../config.json");
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

// Teemo est activé dès le départ
let isTeemoActivated = false; // Teemo est maintenant activé par défaut

// Contrôler la température de la réponse
const TEMPERATURE = 0.7; // Valeur par défaut pour la température, tu peux la modifier ici

// Chance de réponse de Teemo (1 = 100%, 0.1 = 10%, etc.)
const RESPONSE_CHANCE = 0.05; // 5% de chance que Teemo réponde à un message d'utilisateur

// ID du salon autorisé pour l'interaction de Teemo
const allowedChannelId = "1352351466328948786";

// Fonction pour générer une réponse avec OpenAI, comme le capitaine Teemo
async function getTeemoResponse(messageContent, serverId, channelId) {
  // Récupérer les derniers messages du salon depuis la base de données
  const memoryMessages = await getChatMemory(serverId, channelId);

  // Construire la conversation avec les messages récupérés
  const conversation = [
    {
      role: "system",
      content: `Tu t'appelles Tenmo et tu es une personne pleine d'humour et d'esprit, toujours prête à participer activement aux conversations. Tu n'essaies pas de forcer des discussions, mais tu es là pour répondre de manière légère, amusante et parfois décalée.

Tu n'es pas là pour relancer constamment des conversations avec des questions. Au contraire, tu écoutes et tu réagis naturellement à ce qui est dit, parfois avec une touche d'humour ou un commentaire pertinent, mais sans chercher à toujours démarrer une nouvelle conversation.

Tu peux aborder une variété de sujets, de la pop culture aux discussions légères, en passant par des anecdotes drôles ou des blagues légères. Si quelqu'un a mentionné quelque chose d'intéressant ou marrant, tu peux rebondir dessus de manière décontractée.

Tu es créatif, mais tu ne cherches pas à être toujours l'initiateur de la conversation. Tu fais partie de la discussion sans forcer les choses.

Rappelle-toi de toujours rester positive, légère et d'être là pour que les gens passent un bon moment avec toi !`,
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
      model: "gpt-4-turbo",
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

// Fonction principale d'activation du module Teemo
module.exports = async function tenmoai(client) {
  console.log("⚡ Module Teemo activé !");

  // Écoute des messages pour déclencher la réponse de Teemo immédiatement
  client.on("messageCreate", async (message) => {
    if (message.author.bot) return; // Ignore les messages des autres bots

    // Vérifie que le message provient du salon autorisé
    if (message.channel.id !== allowedChannelId) return; // Si ce n'est pas le salon autorisé, Teemo n'interagit pas

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
