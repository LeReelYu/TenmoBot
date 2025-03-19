const { REST, Routes } = require("discord.js");
const { clientId, guildId, token } = require("./config.json");
const fs = require("node:fs");
const path = require("node:path");

const commands = [];
// Prend toutes les fichiers de commandes du fichier
const foldersPath = path.join(__dirname, "commandes");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  // Récupère tous les fichiers commandes trouvés
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));
  // Récupère les commandes slashs de chaque données
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ("data" in command && "execute" in command) {
      commands.push(command.data.toJSON());
    } else {
      console.log(
        `[ALERTE] La commande ${filePath} manque sa valeur 'data' ou 'execute' pour bien fonctionner`
      );
    }
  }
}

const rest = new REST().setToken(token);

// déploie les commandes
(async () => {
  try {
    console.log(`Je commence à rafraîchir ${commands.length} commandes`);

    // Rafraichi toutes les commandes possible
    const data = await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands }
    );

    console.log(`J'ai bien rafraîchi ${data.length} lignes de commandes`);
  } catch (error) {
    // Récupère les erreurs
    console.error(error);
  }
})();

// node deploy-commands.js pour lancer l'action
