const { SlashCommandBuilder } = require("discord.js");
const Objets = require("../../../Sequelize/modèles/argent/objets"); // Le modèle des objets

module.exports = {
  data: new SlashCommandBuilder()
    .setName("inventaire")
    .setDescription(
      "Affiche la liste des objets disponibles dans l'inventaire."
    ),

  async execute(interaction) {
    try {
      // Récupérer tous les objets de la table "Objets"
      const objets = await Objets.findAll();

      if (objets.length === 0) {
        return interaction.reply({
          content: "Il n'y a actuellement aucun objet dans l'inventaire.",
        });
      }

      // Créer un message avec la liste des objets
      let objetsList = "";
      objets.forEach((objet, index) => {
        objetsList += `${index + 1}. **${objet.name}** - ${
          objet.description || "Aucune description"
        }\nPrix : **${objet.price}** pièces\nStock : **${objet.stock}**\n\n`;
      });

      // Répondre avec la liste d'objets
      await interaction.reply({
        content: `Voici les objets disponibles dans l'inventaire :\n\n${objetsList}`,
      });
    } catch (error) {
      console.error(
        "Erreur lors de l'exécution de la commande inventaire : ",
        error
      );
      await interaction.reply({
        content: "Une erreur est survenue en récupérant l'inventaire.",
      });
    }
  },
};
