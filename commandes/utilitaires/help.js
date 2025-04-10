const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Affiche de l'aide pour les commandes disponibles")
    .addStringOption((option) =>
      option
        .setName("commande")
        .setDescription("Le nom de la commande pour plus d'infos")
        .setRequired(false)
    ),

  async execute(interaction) {
    const commandName = interaction.options.getString("commande");

    // Liste des commandes avec leurs descriptions et emojis
    const commands = [
      {
        name: "/infoutilisateur",
        description:
          "🧑‍💻 Permet d'obtenir des informations sur le membre choisi !",
      },
      {
        name: "/infoserveur",
        description: "💬 Permet d'obtenir des informations sur le serveur !",
      },
      {
        name: "/confess",
        description:
          "🤫 Permet d'envoyer un message anonyme (drôle ou sérieux) dans le salon prévu à cet effet !",
      },
      {
        name: "/nude",
        description: "😏 Recevoir un DM de Tenmo avec une photo aléatoire !",
      },
      {
        name: "/traduction",
        description:
          "🌍 Permet de traduire le texte que tu souhaites dans une autre langue !",
      },
      {
        name: "/rouletterusse",
        description:
          "🔫 Permet de tenter ta chance avec une roulette russe qui se souvient du nombre de tirs effectués !",
      },
      {
        name: "/rouletteglobale",
        description:
          "🎰 Permet de tenter ta chance avec une roulette russe mais avec la même arme pour tout le monde !",
      },
      {
        name: "/solde",
        description: "💰 Permet de voir ton compte bancaire !",
      },
      {
        name: "/transfert",
        description: "🔄 Permet de transférer tes pièces à un autre membre !",
      },
      {
        name: "/crime",
        description: "💸 Permet d'obtenir de l'argent grâce au crime !",
      },
      {
        name: "/daily",
        description: "🕐 Permet d'obtenir des pièces chaque jour !",
      },
      {
        name: "/hourly",
        description: "⏳ Permet d'obtenir quelques pièces chaque heure !",
      },
      {
        name: "/blackjack",
        description: "🃏 Permet de jouer au blackjack en pariant tes pièces !",
      },
      {
        name: "/roulette",
        description: "🎲 Permet de jouer à la roulette en pariant tes pièces !",
      },
      {
        name: "/peche",
        description:
          "🎣 Permet de pêcher des poissons en misant de l'argent en échange !",
      },
      {
        name: "/vol",
        description:
          "💼 Permet d'essayer de voler les pièces d'un autre joueur !",
      },
      {
        name: "/bourse",
        description: "📈 Permet de miser ton argent en bourse !",
      },
      {
        name: "/shop",
        description: "🛒 Permet d'accéder au magasin du serveur !",
      },
      {
        name: "/inventaire",
        description: "📦 Permet d'accéder à ton inventaire !",
      },
      {
        name: "/forceroulette",
        description: "🔫 Permet de forcer la roulette russe sur un membre !",
      },
    ];

    const commandsPerPage = 6; // Nombre de commandes par page
    const totalPages = Math.ceil(commands.length / commandsPerPage);

    // Si une commande spécifique est demandée
    if (commandName) {
      return this.showCommandHelp(interaction, commandName);
    }

    // Fonction pour créer l'embed avec pagination
    const createHelpEmbed = (page) => {
      const start = (page - 1) * commandsPerPage;
      const end = start + commandsPerPage;
      const currentCommands = commands.slice(start, end);

      const embed = new EmbedBuilder()
        .setColor("#28a745")
        .setTitle("Commandes Disponibles")
        .setDescription(
          currentCommands
            .map((c) => `**${c.name}** - ${c.description}`)
            .join("\n")
        )
        .setFooter({ text: `Page ${page} / ${totalPages}` })
        .setImage("https://giffiles.alphacoders.com/529/52912.gif"); // Gif de l'aide générale

      return embed;
    };

    // Crée des boutons pour la navigation
    const createNavigationButtons = (page) => {
      const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("previous")
          .setLabel("⬅️ Précédent")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(page === 1), // Désactive si on est à la première page
        new ButtonBuilder()
          .setCustomId("next")
          .setLabel("Suivant ➡️")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(page === totalPages) // Désactive si on est à la dernière page
      );

      return buttons;
    };

    try {
      // Réponse initiale avec l'embed et les boutons
      await interaction.reply({
        embeds: [createHelpEmbed(1)],
        components: [createNavigationButtons(1)],
      });

      let currentPage = 1;

      // Collecteur de boutons
      const filter = (button) => button.user.id === interaction.user.id;

      const collector = interaction.channel.createMessageComponentCollector({
        filter,
        time: 60000, // Temps en millisecondes (1 minute)
      });

      collector.on("collect", async (button) => {
        await button.deferUpdate(); // Confirme la réception du bouton avant la modification

        if (button.customId === "next" && currentPage < totalPages) {
          currentPage++;
        } else if (button.customId === "previous" && currentPage > 1) {
          currentPage--;
        }

        // Mettre à jour l'embed et les boutons pour la page suivante
        await interaction.editReply({
          embeds: [createHelpEmbed(currentPage)],
          components: [createNavigationButtons(currentPage)],
        });
      });

      collector.on("end", () => {
        // Retirer tous les boutons lorsque le temps est écoulé
        interaction.editReply({
          components: [],
        });
      });
    } catch (error) {
      console.error(
        "Erreur lors de l'envoi du message ou des boutons : ",
        error
      );
      interaction.reply({
        content: "Une erreur s'est produite lors de l'envoi des informations.",
      });
    }
  },

  // Fonction pour afficher l'aide d'une commande spécifique
  async showCommandHelp(interaction, commandName) {
    let description = "";

    switch (commandName.toLowerCase()) {
      case "infoutilisateur":
        description =
          "Cette commande te donnera des informations sur le membre choisi, telles que la date à laquelle il a rejoint Discord, le serveur, son ID et sa photo de profil !";
        break;
      case "infoserveur":
        description =
          "Cette commande te donnera des informations sur le serveur, telles que la date de création, le nombre de membres, la bannière ou la photo de profil !";
        break;
      case "solde":
        description =
          "Cette commande te permet de connaître ton solde bancaire. Elle te montre ton nombre de pièces (monnaie courante) et de champignons (monnaie d'event) avec un message du banquier Temmie.";
        break;
      case "nude":
        description =
          "Cette commande te permet de recevoir de Tenmo une image ou un gif rigolo avec une petite chance que ce soit lui en petite tenue.";
        break;
      case "confess":
        description =
          "Cette commande te permet d'envoyer un message anonyme dans le salon spécifique ! Cela te permet de parler à cœur ouvert sans peur du jugement car personne ne sait qui tu es !";
        break;
      case "traduction":
        description =
          "Cette commande te permet de traduire un texte. Tu n'as qu'à choisir la langue de traduction et noter le message d'origine !";
        break;
      case "rouletterusse":
        description =
          "Cette commande te permet de jouer à la roulette russe tout seul. Ton arme est un revolver avec 1 balle, à toi de voir jusqu'où tu es prêt à jouer. Les balles sont sauvegardées, donc chaque choix a une conséquence.";
        break;
      case "rouletteglobale":
        description =
          "Cette commande te permet de jouer à la roulette avec les autres membres du serveur. Les balles sont sauvegardées pour tous. Le nombre de balles est aléatoire à chaque recharge.";
        break;
      case "shop":
        description =
          "Cette commande te permet d'accéder au magasin du serveur ! Tu peux acheter des items et des accessoires pour personnaliser ton expérience !";
        break;
      // Ajoutez d'autres commandes ici
      default:
        description = "Désolé, je ne connais pas cette commande.";
        break;
    }

    const embed = new EmbedBuilder()
      .setColor("#28a745")
      .setTitle(`Aide pour la commande : ${commandName}`)
      .setDescription(description);

    return interaction.reply({ embeds: [embed] });
  },
};
