const fs = require("node:fs");
const path = require("node:path");
const { Client, Collection, GatewayIntentBits } = require("discord.js");
const { token } = require("./config.json");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

client.commands = new Collection();

// Fonction récursive pour récupérer tous les fichiers de commande
const getAllCommandFiles = (dir) => {
  const files = fs.readdirSync(dir);
  let commandFiles = [];

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Si c'est un dossier, on appelle récursivement pour ce dossier
      commandFiles = commandFiles.concat(getAllCommandFiles(filePath));
    } else if (file.endsWith(".js")) {
      // Si c'est un fichier .js, on l'ajoute à la liste des fichiers de commandes
      commandFiles.push(filePath);
    }
  });

  return commandFiles;
};

// On récupère tous les fichiers de commandes, y compris ceux dans les sous-dossiers
const commandFiles = getAllCommandFiles(path.join(__dirname, "commandes"));

// On charge les commandes
for (const filePath of commandFiles) {
  const command = require(filePath);
  if ("data" in command && "execute" in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(
      `[ALERTE] La commande ${filePath} manque son 'data' ou son 'execute'`
    );
  }
}

// Chargement des événements
const eventsPath = path.join(__dirname, "events");
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

// Ajout de la gestion des messages et de l'enregistrement dans la base de données
const ALLOWED_CHANNEL_ID = "1332366656428572693"; // Remplace par l'ID du salon voulu

client.on("messageCreate", async (message) => {
  if (message.author.bot) return; // Ignore les messages des autres bots

  // Vérifie si le message provient du bon salon
  if (message.channel.id === ALLOWED_CHANNEL_ID) {
    await saveMessage(
      message.guild.id, // ID du serveur
      message.author.username, // Nom de l'auteur
      message.author.bot ? "assistant" : "user", // Rôle
      message.content, // Contenu du message
      message.channel.id // ID du salon
    );
  }
});

client.login(token); // On laisse juste client.login ici, il se déclenche automatiquement
