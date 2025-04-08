const { REST, Routes } = require("discord.js");
const { clientId, guildId, token } = require("./config.json");

const commandId = "1353533738750967872"; // Remplace par l'ID de la commande à supprimer
const rest = new REST().setToken(token);

// Supprime une commande spécifique avec des vérifications
(async () => {
  try {
    console.log(
      `Tentative de suppression de la commande avec l'ID ${commandId}`
    );

    // Vérification de la commande globale
    try {
      await rest.delete(Routes.applicationCommand(clientId, commandId));
      console.log(`Commande globale avec l'ID ${commandId} supprimée.`);
    } catch (err) {
      if (err.code === 10063) {
        console.log(`Commande globale avec l'ID ${commandId} n'existe pas.`);
      } else {
        throw err;
      }
    }

    // Vérification de la commande spécifique à la guilde
    try {
      await rest.delete(
        Routes.applicationGuildCommand(clientId, guildId, commandId)
      );
      console.log(
        `Commande spécifique à la guilde avec l'ID ${commandId} supprimée.`
      );
    } catch (err) {
      if (err.code === 10063) {
        console.log(
          `Commande spécifique à la guilde avec l'ID ${commandId} n'existe pas.`
        );
      } else {
        throw err;
      }
    }

    console.log("Commande supprimée avec succès !");
  } catch (error) {
    // Récupère les erreurs
    console.error("Erreur lors de la suppression de la commande :", error);
  }
})();
