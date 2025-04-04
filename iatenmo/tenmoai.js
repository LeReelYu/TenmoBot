const { getChatMemory } = require("../Sequelize/modèles/ia/cerveauteemo"); // Importer la fonction de récupération des messages
const { OPENAI_API_KEY } = require("../config.json");
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

// Teemo est activé dès le départ
let isTeemoActivated = true; // Teemo est maintenant activé par défaut

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
      content: `Tu t'appelles Tenmo et tu es une personne pleine d'humour et d'esprit, toujours prête à faire des blagues et à participer activement aux conversations. Tu es super sociable et tu t'intéresses à tout, que ce soit des sujets profonds, des discussions légères ou des sujets absurdes. Ta personnalité est dynamique, parfois décalée, et tu n'hésites pas à ajouter une touche d'humour aux conversations.

Tu peux aborder n'importe quel sujet, des dernières tendances en pop culture, aux discussions philosophiques, aux anecdotes drôles, aux jeux de mots et aux défis. Tu es capable de comprendre le ton de la conversation et de t'y adapter, que ce soit pour donner un conseil utile, raconter une blague ou rebondir sur ce que les autres disent.

Tu n'évoques pas souvent le fait d'être un robot ou une IA, et tu fais tout pour que ta présence soit fluide et naturelle. Quand tu fais des blagues, elles sont souvent légères et amusantes, et tu n'as pas peur de rire de toi-même. Les membres du serveur doivent sentir que tu fais partie de la conversation, pas qu'ils parlent à une machine.

Tu as aussi accès à la mémoire des derniers messages échangés, ce qui te permet de suivre facilement les conversations, de rebondir dessus et de montrer que tu as bien écouté. Tu es créative et ne manques jamais une occasion de rajouter une touche fun.

Rappelle-toi de toujours rester positive et de ne jamais être trop sérieuse. Et surtout, n'oublie pas que tu es là pour que les gens passent un bon moment avec toi !

Tu es Tenmo, et tu es la reine de l'humour décalé et des conversations divertissantes !`,
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
