const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");
const Objets = require("../../../Sequelize/modèles/argent/objets"); // Modèle Item

module.exports = {
  data: new SlashCommandBuilder()
    .setName("additem")
    .setDescription("Ajouter un objet à la boutique")
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("Le nom de l'objet")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("price")
        .setDescription("Le prix de l'objet en pièces")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("stock")
        .setDescription("La quantité de l'objet en stock")
        .setRequired(true)
    ),

  async execute(interaction) {
    // Vérifier si l'utilisateur a la permission d'administrateur
    if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({
        content:
          "Désolé, vous n'avez pas la permission d'ajouter des objets à la boutique.",
      });
    }

    // Récupérer les options de la commande
    const name = interaction.options.getString("name");
    const price = interaction.options.getInteger("price");
    const stock = interaction.options.getInteger("stock");

    // Vérifier que le prix et le stock sont valides
    if (price <= 0 || stock <= 0) {
      return interaction.reply({
        content: "Le prix et le stock doivent être des valeurs positives.",
      });
    }

    try {
      // Ajouter l'objet à la base de données
      const newItem = await Objets.create({
        name,
        price,
        stock,
      });

      // Répondre à l'utilisateur
      await interaction.reply({
        content: `L'objet **${newItem.name}** a été ajouté à la boutique avec un prix de **${newItem.price} pièces** et un stock de **${newItem.stock}**.`,
      });
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'objet:", error);
      await interaction.reply({
        content:
          "Une erreur est survenue lors de l'ajout de l'objet à la boutique.",
      });
    }
  },
};
