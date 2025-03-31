const fs = require("node:fs");
const path = require("node:path");
const { Client, Collection, GatewayIntentBits } = require("discord.js");
const { token } = require("./config.json");
const autofeur = require("./autoscript/autofeur"); // Si autofeur.js est dans le même dossier que index.js
const bjorn = require("./autoscript/bjorn");
const sequelize = require("./Sequelize/sequelize"); // Importation de la connexion Sequelize
const tenmoai = require("./iatenmo/tenmoai");
const { saveMessage } = require("./Sequelize/modèles/ia/cerveauteemo"); // Assure-toi que saveMessage est importé
const autochannel = require("./autoscript/autochannel");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers,
  ],
});

client.commands = new Collection();
const foldersPath = path.join(__dirname, "commandes");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[ALERTE] La commande ${filePath} manque son 'data' ou son 'execute'`
      );
    }
  }
}

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
