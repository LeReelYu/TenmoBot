const { SlashCommandBuilder, MessageEmbed } = require("discord.js");

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

      const embed = new MessageEmbed()
        .setColor("#28a745")
        .setTitle("Commandes Disponibles")
        .setDescription(
          currentCommands
            .map((c) => `**${c.name}** - ${c.description}`)
            .join("\n")
        )
        .setFooter(`Page ${page} / ${totalPages}`)
        .setImage("https://giffiles.alphacoders.com/529/52912.gif"); // Gif de l'aide générale

      return embed;
    };

    // Envoie la première page
    const initialEmbed = await interaction.reply({
      embeds: [createHelpEmbed(1)],
      fetchReply: true,
      ephemeral: true,
    });

    // Ajoute les réactions pour la navigation
    await initialEmbed.react("⬅️");
    await initialEmbed.react("➡️");

    const filter = (reaction, user) => {
      return (
        ["⬅️", "➡️"].includes(reaction.emoji.name) &&
        user.id === interaction.user.id
      );
    };

    const collector = initialEmbed.createReactionCollector({
      filter,
      time: 60000, // Temps en millisecondes (1 minute)
    });

    let currentPage = 1;

    collector.on("collect", async (reaction) => {
      // Retirer la réaction après que l'utilisateur l'ait utilisée
      await reaction.users.remove(interaction.user.id);

      if (reaction.emoji.name === "➡️" && currentPage < totalPages) {
        currentPage++;
      } else if (reaction.emoji.name === "⬅️" && currentPage > 1) {
        currentPage--;
      }

      // Mettre à jour l'embed pour la page suivante
      await initialEmbed.edit({
        embeds: [createHelpEmbed(currentPage)],
      });
    });

    collector.on("end", () => {
      initialEmbed.reactions.removeAll(); // Retirer toutes les réactions à la fin
    });
  },

  // Fonction pour afficher l'aide d'une commande spécifique
  async showCommandHelp(interaction, commandName) {
    switch (commandName.toLowerCase()) {
      case "infoutilisateur":
        return interaction.reply({
          content:
            "Commande `/infoutilisateur` :\n" +
            "Cette commande te donnera des informations sur le membre choisi comme la date à laquelle il a rejoint discord, le serveur ou encore son id et sa photo de profil !",
          ephemeral: true,
        });
      case "infoserveur":
        return interaction.reply({
          content:
            "Commande `/infoserveur` :\n" +
            "Cette commande te donnera des informations sur le serveur comme sa date de création, son nombre de membre, sa bannière ou sa photo de profil !",
          ephemeral: true,
        });
      case "solde":
        return interaction.reply({
          content:
            "Commande `/solde` :\n" +
            "Cette commande te permet de connaître ton solde bancaire\n Elle te présente ton nombre de pièces (monnaie courante) et de champignons (monnaie d'event) avec un message du banquier temmie",
        });
      case "nude":
        return interaction.reply({
          content:
            "Commande `/nude` :\n" +
            "Cette commande te permet de recevoir de tenmo une image ou un gif rigolo avec une petite chance que ce soit lui en petite tenue",
        });
      case "confess":
        return interaction.reply({
          content:
            "Commande `/confess` :\n" +
            "Cette commande te permet d'envoyer un message anonyme dans le salon spécifique !\n Cela te permet de parler à coeur ouvert sans peur du jugement car personne ne sait qui tu es !\n La commande possède trois formes :\nLa blague, pour plaisanter en anonyme\nLe sérieux, pour tout sujet qui le mérite\nLe vent, pour ouvrir ton sac quand ça ne va pas\nToute confession est entièrement anonyme est intraçable",
        });
      case "traduction":
        return interaction.reply({
          content:
            "Commande `/traduction` :\n" +
            "Cette commande te permet de traduire un texte.\nTu n'as qu'à choisir la langue de traduction et noter le message d'origine !",
        });
      case "rouletterusse":
        return interaction.reply({
          content:
            "Commande `/rouletterusse` :\n" +
            "Cette commande te permet de jouer à la roulette russe tout seul.\n Ton arme est un revolver avec 1 balle, à toi de voir jusqu'où tu es prêt à jouer.\n Les balles sont sauvegardées donc chaque choix a une conséquence.",
        });
      case "rouletteglobale":
        return interaction.reply({
          content:
            "Commande `/rouletteglobale` :\n" +
            "Cette commande te permet de jouer à la roulette avec les autres membres du serveur.\n Donc les balles sont sauvegardées pour tous.\n De plus, le nombre de balles est lui aussi aléatoire à chaque recharge.",
        });
      case "solde":
        return interaction.reply({
          content:
            "Commande `/solde` :\n" +
            "Cette commande te permet de voir ton compte bancaire.\n Tu y verras tes pièces et tes champignons.\n Les pièces sont une monnaie obtenable avec les commandes de jeux du bot et servent à s'amuser avec lui.\n Les champignons sont monnaie obtenable en event qui permet d'obtenir des objets particuliers dans la boutique itinérante.",
        });
      case "transfert":
        return interaction.reply({
          content:
            "Commande `/transfert` :\n" +
            "Cette commande te permet de transférer une partie de ta monnaie à un autre membre de ton choix dans la mesure du possible.",
        });
      case "crime":
        return interaction.reply({
          content:
            "Commande `/crime` :\n" +
            "Cette commande te permet d'essayer de gagner une bonne quantité d'argent chaque 45 minutes mais tu peux tout autant en perdre",
        });
      case "daily":
        return interaction.reply({
          content:
            "Commande `/daily` :\n" +
            "Cette commande te permet de recevoir une bonne quantité d'argent chaque 24 heures",
        });
      case "hourly":
        return interaction.reply({
          content:
            "Commande `/hourly` :\n" +
            "Cette commande te permet de recevoir une quantité d'argent plus faible que /daily mais chaque heure",
        });
      case "blackjack":
        return interaction.reply({
          content:
            "Commande `/blackjack` :\n" +
            "Cette commande te permet, échange d'une mise de pièces, de jouer au blackjack et de multiplier ta mise selon les règles classiques.",
        });
      case "roulette":
        return interaction.reply({
          content:
            "Commande `/roulette` :\n" +
            "Cette commande te permet, en échange d'une mise de pièces, de jouer à la roulette et de multiplier ta mise selon les règles de la roulette européenne.",
        });
      case "peche":
        return interaction.reply({
          content:
            "Commande `/peche` :\n" +
            "Cette commande te permet, en échange d'une mise de pièces, de jouer à un mini-jeu de pêche dans lequel **si** la goutte d'eau en réaction devient un poisson, tu dois cliquer dessus vite pour obtenir 75% de ta mise.\n Il n'est pas toujours possible qu'apparaisse un poisson, dans ce cas-là la mise est perdue.",
        });
      case "vol":
        return interaction.reply({
          content:
            "Commande `/vol` :\n" +
            "Cette commande te permet d'essayer de voler un membre chaque trois heures.\n Le vol fonctionne sur trois modes qui rapportent plus ou moins mais avec des risques différents d'échouer.\n Si quelqu'un a acheté une protection anti-vol, tu rates à coup sûr ta tentative.",
        });
      case "shop":
        return interaction.reply({
          content:
            "Commande `/shop` :\n" +
            "Cette commande te permet d'ouvrir le magasin Bonajade qui contient pleins d'objets achetable avec des pièces.\n Son contenu est changeant en permanence.",
        });
      case "inventaire":
        return interaction.reply({
          content:
            "Commande `/inventaire` :\n" +
            "Cette commande te permet d'accéder à ton inventaire.\n Ton inventaire contient tous les objets que tu as obtenu notamment du magasin Bonajade.",
        });
      case "forceroulette":
        return interaction.reply({
          content:
            "Commande `/forceroulette` :\n" +
            "Cette commande te permet de forcer une /rouletteglobale sur le membre de ton choix si tu as acheté l'objet forceroulette au préalable.",
        });
      default:
        return interaction.reply({
          content:
            "Commande inconnue. Utilise `/help` pour voir les commandes disponibles.",
          ephemeral: true,
        });
    }
  },
};
