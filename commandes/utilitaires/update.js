const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("update")
    .setDescription(
      "Affiche les dernières mises à jour avec navigation via des boutons"
    ),

  async execute(interaction) {
    const updates = [
      {
        title: "Tenmo Saison 1 - Guide",
        description:
          "Cet endroit contient toutes les informations importantes pour comprendre et s'amuser avec Tenmo !",
        fields: [
          {
            name: "Sommaire",
            value:
              "Cette commande vous affiche sous formes de plusieurs pages les mises à jour de notre bon capitaine. Voici le sommaire des nouveautés !",
            inline: false,
          },
          {
            name: "Les entreprises bullières",
            value:
              "Vous n'avez jamais eu envie de devenir le grand dirigeant d'une entreprise vendant des bulles ? C'est maintenant possible !",
            inline: false,
          },
          {
            name: "Le safari parfaitement légal",
            value:
              "Vous avez peut être des animaux chez vous, mais est-ce que vous les avez aussi capturés sur discord ? Non ?! C'est maintenant possible !",
            inline: false,
          },
          {
            name: "Rework des anciennes commandes",
            value:
              "Toutes vos commandes favorites ont évolué ! Peut-être moins d'argent ? De nouveaux secrets ? Tout peut partir en vrille !",
            inline: true,
          },
          {
            name: "Evolution du shop",
            value:
              "Notre magasin a décidé de gonfler un peu, et pourquoi pas bientôt gonfler ses prix face à la concurrence !",
            inline: true,
          },
          {
            name: "SAISON EVOLUTIVE",
            value:
              "Cette saison est la première officielle du capitaine et tournera autour de deux principes importants. Cependant tout n'est pas encore disponible et les bugs sont légions ! Soyez patients !",
            inline: false,
          },
        ],
        image:
          "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Teemo_0.jpg",
        thumbnail:
          "https://media.discordapp.net/attachments/1328841703842644092/1356685674312630272/Champignon_dargent.png?ex=680926fe&is=6807d57e&hm=dd81c858ce374aff47ca2a70fe06f501dea0af89f8d05a3231e80dce4f856794&format=webp&quality=lossless&",
        footer: "Par le Capitaine Tenmo lui-même !",
        footerIcon:
          "https://cdn.sanity.io/images/dsfx7636/consumer_products_live/659e808b18d63a5147dbfd6aff3a60b1a7c899b1-2560x2560.png",
      },
      {
        title: "Tenmo Saison 1 - Les entreprises",
        description:
          "C'est ici que vous apprendez tout ce qu'il y a à savoir sur le business que VOUS pouvez fonder !",
        fields: [
          {
            name: "Késécé ?",
            value:
              "Grâce à la commande /bulle et toutes ses dépendances vous allez enfin pouvoir créer l'entreprise de vos rêves.\nCelles-ci sont divisés en quatre catégories chacun ayant des particularités. \nEn effet, si vous choisissez de fonder un **Magasin** ou un **Restaurant** alors vous fabriquerez et vendrez des bulles à gogo à chaque instant, tentant toujours plus d'en obtenir grâce aux différentes **améliorations** !\nCependant, si vous choisissez un **Vidéoclub** ou un **Cinéma** ce sera tout autre ! Vous gagnerez moins de bulles chaque secondes mais... Vous pouvez toujours en obtenir en volant les autres pas vrai ?",
            inline: false,
          },
          {
            name: "Possibilité de nommer l'entreprise",
            value:
              "N'oubliez pas d'utiliser du choix facultatif lors de la création de votre entreprise pour la **NOMMER**",
            inline: true,
          },
          {
            name: "Maj à venir",
            value:
              "Evènements globaux, combats d'entreprise, gardes de sécurité...",
            inline: true,
          },
          {
            name: "Limité au premier rang",
            value:
              "Vos entreprises possèdent des améliorations appelées **rang**. Pour le moment **seule la première** est disponible.",
            inline: true,
          },
        ],
        image:
          "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Teemo_0.jpg",
        thumbnail:
          "https://media.discordapp.net/attachments/1328841703842644092/1356685674312630272/Champignon_dargent.png?ex=680926fe&is=6807d57e&hm=dd81c858ce374aff47ca2a70fe06f501dea0af89f8d05a3231e80dce4f856794&format=webp&quality=lossless&",
        footer: "Grâce aux investissements malins de Tom Nook !",
        footerIcon:
          "https://cdn.sanity.io/images/dsfx7636/consumer_products_live/659e808b18d63a5147dbfd6aff3a60b1a7c899b1-2560x2560.png",
      },
      {
        title: "Tenmo Saison 1 - Le safari",
        description:
          "Que diriez vous de plagier mudae mais avec moins de budget ?",
        fields: [
          {
            name: "Capturer des animaux",
            value:
              "A l'aide d'un ticket de safari, vous allez pouvoir tenter votre chance à la capture de pleins de bêtes. \nSi vous en avez trop, vous pouvez les vendre pour essayer de gagner des pièces !",
            inline: false,
          },
          {
            name: "Des créatures rares",
            value:
              "Apparemment, vous connaissez une bonne partie des créatures les plus rares du safari...",
            inline: false,
          },
          {
            name: "Des pouvoirs à venir",
            value:
              "Les créatures les plus rares possèdent des pouvoirs qui pourraient vous aider dans vos autres activités...",
            inline: false,
          },
          {
            name: "Une quantité limitée",
            value:
              "Plus une créature est rare, moins on peut l'avoir... Que se passera-t-il quand on vous volera votre chat ? Votre chien ?!",
            inline: false,
          },
          {
            name: "Des ajouts à la volée",
            value:
              "Votre animal favoris n'y est pas ? Pas de soucis, demandez à mon esclave Yu et il sera ajouté au plus vite... Bon je garantis pas qu'ils seront très rares",
            inline: false,
          },
        ],
        image:
          "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Teemo_0.jpg",
        thumbnail:
          "https://media.discordapp.net/attachments/1328841703842644092/1356685674312630272/Champignon_dargent.png?ex=680926fe&is=6807d57e&hm=dd81c858ce374aff47ca2a70fe06f501dea0af89f8d05a3231e80dce4f856794&format=webp&quality=lossless&",
        footer: "Grâce à la généreuse aide des pirates somaliens !",
        footerIcon:
          "https://cdn.sanity.io/images/dsfx7636/consumer_products_live/659e808b18d63a5147dbfd6aff3a60b1a7c899b1-2560x2560.png",
      },
    ];

    const createEmbed = (update) => {
      const embed = new EmbedBuilder()
        .setTitle(update.title)
        .setDescription(update.description)
        .addFields(update.fields || [])
        .setImage(update.image || "")
        .setThumbnail(update.thumbnail || "")
        .setColor("#00b0f4")
        .setFooter({
          text: update.footer,
          iconURL: update.footerIcon,
        })
        .setTimestamp();
      return embed;
    };

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("previous")
        .setLabel("Page précédente")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("next")
        .setLabel("Page suivante")
        .setStyle(ButtonStyle.Primary)
    );

    let currentPage = 0;

    const message = await interaction.reply({
      embeds: [createEmbed(updates[currentPage])],
      components: [row],
    });

    const filter = (i) => i.user.id === interaction.user.id;
    const collector = message.createMessageComponentCollector({
      filter,
      time: 60000,
    });

    collector.on("collect", async (i) => {
      if (i.customId === "next") {
        currentPage = (currentPage + 1) % updates.length;
      } else if (i.customId === "previous") {
        currentPage = (currentPage - 1 + updates.length) % updates.length;
      }

      await i.update({
        embeds: [createEmbed(updates[currentPage])],
        components: [row],
      });
    });

    collector.on("end", (collected, reason) => {
      if (reason === "time") {
        message.edit({
          components: [],
        });
      }
    });
  },
};
