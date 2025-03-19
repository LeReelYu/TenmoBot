// autofeur.js

module.exports = (client) => {
  client.on("messageCreate", (message) => {
    if (message.author.bot) return; // Ignore les messages des bots

    // Si le message contient le mot "quoi", peu importe ce qui précède ou suit
    if (message.content.toLowerCase().includes("quoi")) {
      message.reply("feur");
    }
  });
};
