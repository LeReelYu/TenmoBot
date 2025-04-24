const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} = require("discord.js");
const Inventaire = require("../../Sequelize/modèles/argent/vente/inventaire");
const Pets = require("../../Sequelize/modèles/argent/vente/animaux/pets");
const { Op } = require("sequelize");
const UserPets = require("../../Sequelize/modèles/argent/vente/animaux/userpets");
const Economie = require("../../Sequelize/modèles/argent/économie");
const { fn, col, where: sequelizeWhere } = require("sequelize");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("safari")
    .setDescription("Système de capture de pets")
    .addSubcommand((sub) =>
      sub
        .setName("chasse")
        .setDescription(
          "Utilise un ticket safari pour partir à la chasse aux pets !"
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("équiper")
        .setDescription("Équipe un pet")
        .addStringOption((option) =>
          option
            .setName("pet_nom")
            .setDescription("Nom du pet à équiper")
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub.setName("profil").setDescription("Affiche ta liste de pets")
    )
    .addSubcommand((sub) =>
      sub
        .setName("pet")
        .setDescription("Affiche les infos détaillées d’un pet")
        .addStringOption((option) =>
          option
            .setName("pet_nom")
            .setDescription("Nom du pet à afficher")
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("déchiqueter")
        .setDescription("Relâche un ou plusieurs pets")
        .addStringOption((option) =>
          option
            .setName("pet_nom")
            .setDescription("Nom du pet à relâcher")
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const userId = interaction.user.id;

    if (subcommand === "chasse") {
      const TICKET_ID = 5;

      const ticket = await Inventaire.findOne({
        where: {
          userId: userId,
          itemId: TICKET_ID,
          quantity: {
            [Op.gt]: 0,
          },
        },
      });

      if (!ticket) {
        return interaction.reply({
          content:
            "❌ Tu n'as pas de ticket safari ! J'ai entendu dire que Madame Bonajade en vendait en ce moment !",
        });
      }

      ticket.quantity -= 1;

      if (ticket.quantity <= 0) {
        await ticket.destroy();
      } else {
        await ticket.save();
      }

      await interaction.deferReply();

      const chanceNoAnimal = Math.random();
      if (chanceNoAnimal <= 0.1) {
        return interaction.editReply(
          "❌ Tu n'as trouvé aucun animal... Tu es rentré bredouille !"
        );
      }

      const getRandomRarity = () => {
        const roll = Math.random();
        const chances = {
          commun: 0.8,
          rare: 0.14,
          légendaire: 0.05,
          mythique: 0.01,
        };
        let total = 0;
        for (const [rarity, chance] of Object.entries(chances)) {
          total += chance;
          if (roll <= total) return rarity;
        }
        return "commun";
      };

      const weightedRandomPet = (pets) => {
        const total = pets.reduce((acc, pet) => acc + pet.drop_rate, 0);
        let roll = Math.random() * total;
        for (const pet of pets) {
          roll -= pet.drop_rate;
          if (roll <= 0) return pet;
        }
        return pets[0];
      };

      const emojisByRarity = {
        commun: "🐾",
        rare: "🦊",
        légendaire: "🦁",
        mythique: "🐉",
      };

      const drawnRarity = getRandomRarity();
      const petsOfRarity = await Pets.findAll({
        where: { rarity: drawnRarity },
      });

      if (petsOfRarity.length === 0) {
        return interaction.editReply(
          "❌ Aucun pet disponible dans cette rareté !"
        );
      }

      // Filtrer les pets déjà trop capturés
      const filteredPets = [];
      for (const pet of petsOfRarity) {
        const captureCount = await UserPets.count({
          where: { petId: pet.id },
        });
        if (captureCount < pet.max_captures) {
          filteredPets.push(pet);
        }
      }

      if (filteredPets.length === 0) {
        // Si aucun pet n'est capturable, relancer automatiquement la chasse
        return interaction.editReply(
          "❌ Aucune cible disponible pour cette chasse, relance la chasse."
        );
      }

      const drawnPet = weightedRandomPet(filteredPets);
      const finalEmoji = emojisByRarity[drawnRarity];

      const embed = new EmbedBuilder()
        .setTitle("🌿 Safari en cours...")
        .setDescription("Tu marches dans la savane... 👣")
        .setColor("Green");

      const message = await interaction.editReply({
        embeds: [embed],
        fetchReply: true,
      });

      const animations = ["🌿🦓🌿", "🌴🪵🌾", "🌾🪲🌿", "🌱🐜🍃", "🍃🦎🌴"];
      for (const line of animations) {
        await new Promise((r) => setTimeout(r, 1000));
        embed.setDescription(`Tu marches dans la savane...\n${line}`);
        await message.edit({ embeds: [embed] });
      }

      await new Promise((r) => setTimeout(r, 1000 + Math.random() * 2000));

      embed.setDescription(
        `Un animal surgit ! Clique vite sur le ${finalEmoji} pour le capturer !`
      );
      embed.setColor("Orange");
      await message.edit({ embeds: [embed] });
      await message.react(finalEmoji);

      const filter = (reaction, user) => {
        return reaction.emoji.name === finalEmoji && user.id === userId;
      };

      try {
        const collected = await message.awaitReactions({
          filter,
          max: 1,
          time: 5000,
          errors: ["time"],
        });

        await UserPets.create({
          userId: userId,
          petId: drawnPet.id,
        });

        embed.setDescription(
          `🎉 Tu as capturé **${drawnPet.name}** (${drawnRarity}) !`
        );
        embed.setImage(drawnPet.image_url || null);
        embed.setColor("Gold");
        await message.edit({ embeds: [embed] });
      } catch (err) {
        embed.setDescription(
          "❌ L'animal s'est enfui... tu as raté ta chance !"
        );
        embed.setColor("Red");
        await message.edit({ embeds: [embed] });
      }
    }
    // Profil des pets
    if (subcommand === "profil") {
      const userPets = await UserPets.findAll({
        where: { userId },
        include: [{ model: Pets, as: "pet" }],
      });

      if (userPets.length === 0) {
        return interaction.reply({
          content: "❌ Tu n'as pas encore de pets !",
        });
      }

      const emojisByRarity = {
        commun: "🐾",
        rare: "🦊",
        légendaire: "🦁",
        mythique: "🐉",
      };

      const petsList = userPets
        .map((userPet, index) => {
          const pet = userPet.pet;
          const emoji = emojisByRarity[pet.rarity] || "";
          // Si le pet est équipé, on ajoute " **✨**" (l'emoji en gras) après le nom
          const equippedMark = userPet.is_equipped ? " **✨**" : "";
          return `**${index + 1}.** ${emoji} **${pet.name}**${equippedMark} (${
            pet.rarity
          })`;
        })
        .join("\n");

      const embed = new EmbedBuilder()
        .setTitle("📜 Liste de tes pets")
        .setDescription(petsList)
        .setColor("#57d53b");

      return interaction.reply({ embeds: [embed] });
    }

    if (subcommand === "équiper") {
      const petNom = interaction.options.getString("pet_nom");

      const userPet = await UserPets.findOne({
        where: { userId },
        include: [
          {
            model: Pets,
            as: "pet",
            where: { name: petNom },
          },
        ],
      });

      if (!userPet) {
        return interaction.reply({
          content: "❌ Ce pet ne t'appartient pas !",
        });
      }

      // Déséquipe tous les autres pets
      await UserPets.update(
        { is_equipped: false },
        {
          where: {
            userId,
            is_equipped: true,
          },
        }
      );

      // Équipe le pet choisi
      userPet.is_equipped = true;
      await userPet.save();

      return interaction.reply(`⚔️ Tu as équipé **${petNom}** !`);
    }

    // Déchiqueter (relâcher) un pet
    if (subcommand === "déchiqueter") {
      const petNom = interaction.options.getString("pet_nom");

      const userPet = await UserPets.findOne({
        where: { userId: userId },
        include: [
          {
            model: Pets,
            as: "pet",
            where: { name: petNom },
          },
        ],
      });

      if (!userPet) {
        return interaction.reply({
          content: "❌ Ce pet ne t'appartient pas !",
        });
      }

      const pet = userPet.pet; // Récupérer l'objet 'pet' associé

      // Définir le nombre de pièces par rareté
      const rewardByRarity = {
        commun: 200,
        rare: 500,
        légendaire: 1500,
        mythique: 50000,
      };

      // Récupérer le nombre de pièces en fonction de la rareté
      const reward = rewardByRarity[pet.rarity] || 0;

      // Ajouter les pièces à l'utilisateur
      const userEconomy = await Economie.findOne({
        where: { userId: userId },
      });

      if (!userEconomy) {
        return interaction.reply({
          content:
            "❌ Impossible de trouver ton compte d'économie. Contacte un administrateur.",
        });
      }

      userEconomy.pièces += reward;

      await userEconomy.save();

      // Supprimer le pet de l'utilisateur
      await userPet.destroy();

      // Mettre à jour la quantité de l'objet dans l'inventaire (si applicable)
      const inventoryItem = await Inventaire.findOne({
        where: { userId, itemId: pet.id }, // Assurez-vous que l'itemId soit correctement lié ici
      });

      if (inventoryItem) {
        inventoryItem.quantity -= 1;
        if (inventoryItem.quantity <= 0) {
          await inventoryItem.destroy();
        } else {
          await inventoryItem.save();
        }
      }

      // Répondre à l'utilisateur
      return interaction.reply(
        `❌ Tu as "relâché" **${petNom}** et trouvé **${reward} pièces** dans ses restes !`
      );
    }

    if (subcommand === "pet") {
      const petNom = interaction.options.getString("pet_nom");

      const pet = await Pets.findOne({
        where: sequelizeWhere(fn("lower", col("name")), fn("lower", petNom)),
      });

      if (!pet) {
        return interaction.reply({
          content: "❌ Ce pet n'existe pas.",
        });
      }

      const totalDresseurs = await UserPets.count({
        where: { petId: pet.id },
        distinct: true,
        col: "userId",
      });

      const emojisByRarity = {
        commun: "🐾",
        rare: "🦊",
        légendaire: "🦁",
        mythique: "🐉",
      };

      const emoji = emojisByRarity[pet.rarity] || "";

      const embed = new EmbedBuilder()
        .setTitle(`${emoji} ${pet.name}`)
        .setDescription(
          `**Rareté** : ${pet.rarity}
          **Pouvoir** : ${pet.effect_type || "Aucun"}
          **Capturé par** : ${totalDresseurs} dresseur${
            totalDresseurs > 1 ? "s" : ""
          }`
        )
        .setColor("#ffaa00")
        .setImage(pet.image_url || null)
        .setFooter({ text: `Demande faite par ${interaction.user.username}` });

      return interaction.reply({ embeds: [embed] });
    }
  },
};
