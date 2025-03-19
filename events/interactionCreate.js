const { Events, MessageFlags } = require("discord.js");

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

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
