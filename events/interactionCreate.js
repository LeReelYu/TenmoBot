const { Events, MessageFlags } = require("discord.js");
// Assure-toi que le modèle est importé sous le bon nom (ModeTest)
const ModeTest = require("../Sequelize/modèles/modetest"); // Vérifie le chemin et le nom du modèle

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    // Vérifier si le mode test est activé
    const guildId = interaction.guild.id;
    const testMode = await ModeTest.findOne({ where: { guildId: guildId } });

    if (
      testMode &&
      testMode.enabled &&
      interaction.channel.id !== testMode.channelId
    ) {
      // Si le mode test est activé et que la commande est dans un autre salon
      return interaction.reply(
        "Je suis occupé ailleurs, laisse-moi tranquille !"
      );
    }

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.error(
        `Aucune commande ${interaction.commandName} n'a été trouvée`
      );
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "Il y a eu une erreur dans l'exécution de la commande",
          flags: MessageFlags.Ephemeral,
        });
      } else {
        await interaction.reply({
          content: "Il y a eu une erreur dans l'exécution de la commande",
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  },
};
