const { SlashCommandBuilder } = require("discord.js");

// Liste des GIFs de Teemo
const TEEMO_GIFS = [
  "https://tenor.com/view/teemo-chibi-teemo-teemo-chibi-buff-teemo-teemo-mamado-gif-18149521734693201341",
  "https://tenor.com/view/creepy-bush-league-of-legends-teemo-gif-23177392",
  "https://tenor.com/view/teemo2-teemo1-teemo-dancing-shake-it-gif-12473757",
  "https://tenor.com/view/teemo-teemo-harmonica-gif-13828961716057023529",
  "https://tenor.com/view/welcome-teemo-legends-of-runeterra-give-me-a-hug-im-glad-to-see-you-gif-24803058",
  "https://tenor.com/view/tahm-kench-league-of-legends-laugh-3d-mushroom-gif-26083942",
  "https://tenor.com/view/teemo-gif-19065277",
  "https://tenor.com/view/teemo-teemo-kick-rip-rip-teemo-pentakill-mv-gif-3681809263374489617",
  "https://tenor.com/view/teemo-chibi-teemo-teemo-chibi-dance-teemo-dance-gif-7520434862044215667",
  "https://tenor.com/view/teemo-league-of-legends-wild-rift-cute-yordle-gif-18977750",
  "https://tenor.com/view/teemo-dodge-evade-league-of-legends-lol-gif-17387796",
  "https://tenor.com/view/league-of-legends-teemo-omega-gif-18984250",
  "https://tenor.com/view/league-of-legends-teemo-tuesday-gif-6193779851349854820",
  "https://tenor.com/view/teemo-league-of-legends-roblox-twice-likey-teemo-league-gif-8689797147983071272",
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("nude")
    .setDescription("Pour obtenir un petit cadeau de tenmo en privé"),

  async execute(interaction) {
    const randomGif = TEEMO_GIFS[Math.floor(Math.random() * TEEMO_GIFS.length)];

    try {
      await interaction.user.send(`🌡️ Voici mon paf !\n${randomGif}`);
      await interaction.reply({
        content: "🥵 Je t'ai envoyé mon paf en MP !",
      });
    } catch (error) {
      console.error("Erreur lors de l'envoi du paf :", error);
      await interaction.reply({
        content: "Menteur.euse t'es pas vraiment intéressé.e c'est ça",
      });
    }
  },
};
