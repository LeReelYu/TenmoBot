const Memory = require("./mémoireteemo");

// ID du salon que Teemo doit suivre (à modifier dans le code)
const ALLOWED_CHANNEL_ID = "1332366656428572693"; // Remplace par l'ID du salon voulu

// Sauvegarde un message dans la base de données
async function saveMessage(serverId, username, role, content, channelId) {
  // Ignore les messages qui ne proviennent pas du salon spécifié
  if (channelId !== ALLOWED_CHANNEL_ID) return;

  await Memory.create({ server_id: serverId, username, role, content });

  // Limite la mémoire à 200 messages par serveur
  const messages = await Memory.findAll({
    where: { server_id: serverId },
    order: [["createdAt", "DESC"]],
  });

  if (messages.length > 100) {
    await messages[messages.length - 1].destroy(); // Supprime l'ancien message
  }
}

// Récupère les 100 derniers messages d'un serveur (uniquement si dans le bon salon)
async function getChatMemory(serverId, channelId) {
  // Ignore les requêtes venant de salons non autorisés
  if (channelId !== ALLOWED_CHANNEL_ID) return [];

  const messages = await Memory.findAll({
    where: { server_id: serverId },
    order: [["createdAt", "DESC"]],
    limit: 50,
  });

  return messages.map((msg) => ({
    role: msg.role,
    username: msg.username,
    content: msg.content,
  }));
}

module.exports = { saveMessage, getChatMemory };
