const { SlashCommandBuilder } = require("discord.js");
const Inventaire = require("../../../Sequelize/modèles/argent/inventaire");
const Objets = require("../../../Sequelize/modèles/argent/objets");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("inventaire")
    .setDescription("Affiche la liste des objets que tu possèdes."),

  async execute(interaction) {
    try {
      // Récupérer l'inventaire de l'utilisateur avec les objets associés
      const userInventory = await Inventaire.findAll({
        where: { userId: interaction.user.id },
        include: [
          {
            model: Objets,
            as: "objet", // Utilisation de l'alias défini dans le modèle
            attributes: ["name", "description", "price"],
          },
        ],
      });

      if (userInventory.length === 0) {
        return interaction.reply({
          content: "Tu n'as aucun objet dans ton inventaire, sale pauvre.",
        });
      }

      // Construire la liste des objets possédés
      let objetsList = "";
      userInventory.forEach((item, index) => {
        const objet = item.objet; // L'objet associé grâce à l'alias "objet"
        objetsList += `${index + 1}. **${objet.name}** - ${
          objet.description || "Aucune description"
        }\nPrix : **${objet.price}** pièces\nQuantité : **${
          item.quantity
        }**\n\n`;
      });

      // Répondre avec la liste des objets de l'utilisateur
      await interaction.reply({
        content: `🎒 **Ton inventaire :**\n\n${objetsList}`,
      });
    } catch (error) {
      console.error(
        "Erreur lors de l'exécution de la commande inventaire :",
        error
      );
      await interaction.reply({
        content: "Une erreur est survenue en récupérant ton inventaire.",
      });
    }
  },
};
