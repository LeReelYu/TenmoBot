const { REST, Routes } = require("discord.js");
const { clientId, guildId, token } = require("./config.json");
const fs = require("node:fs");
const path = require("node:path");

const commands = [];

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

// On récupère les commandes slashs de chaque fichier
for (const filePath of commandFiles) {
  const command = require(filePath);
  if ("data" in command && "execute" in command) {
    commands.push(command.data.toJSON());
  } else {
    console.log(
      `[ALERTE] La commande ${filePath} manque sa valeur 'data' ou 'execute' pour bien fonctionner`
    );
  }
}

const rest = new REST().setToken(token);

// déploie les commandes
(async () => {
  try {
    console.log(`Je commence à rafraîchir ${commands.length} commandes`);

    // Rafraîchi toutes les commandes possibles
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
