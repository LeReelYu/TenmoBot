const { DateTime } = require("luxon");
const BubbleProfile = require("../../Sequelize/modèles/argent/bulle/BubbleProfile");

async function updatePassiveBubbles() {
  console.log(
    "⏳ Lancement du système de bulles passives toutes les cinq minutes..."
  );

  // Tick une première fois immédiatement
  await runPassiveTickOnce();

  // Puis boucle toutes les minutes pour vérifier les mises à jour
  setInterval(async () => {
    try {
      await runPassiveTickOnce();
    } catch (err) {
      console.error("❌ Erreur dans la mise à jour des bulles passives :", err);
    }
  }, 60 * 1000); // 1 minute
}

async function runPassiveTickOnce() {
  const profiles = await BubbleProfile.findAll();

  for (const profile of profiles) {
    console.log(
      `➡️ Profil ${profile.userId} : passiveRate = ${profile.passiveRate}`
    );
    console.log(`🔍 lastPassiveTick brut =`, profile.lastPassiveTick);

    // Vérification si lastPassiveTick est valide
    const lastTick = DateTime.fromJSDate(profile.lastPassiveTick);
    if (!lastTick.isValid) {
      console.error(
        `❌ lastPassiveTick invalide pour l'utilisateur ${profile.userId}`
      );
      continue; // Si la date est invalide, on passe au prochain profil
    }

    const now = DateTime.now();
    const diffInMinutes = now.diff(lastTick, "minutes").minutes;

    console.log(
      `⏳ Temps écoulé depuis dernier tick : ${diffInMinutes} minutes`
    );

    // Vérifier si 5 minutes se sont écoulées
    if (diffInMinutes >= 5) {
      const bubblesToAdd = Math.floor(
        profile.passiveRate * (diffInMinutes / 5)
      );

      console.log(
        `🧮 Calcul des bulles : passiveRate = ${profile.passiveRate}, diffInMinutes = ${diffInMinutes}, bulles à ajouter = ${bubblesToAdd}`
      );

      profile.bubbles += bubblesToAdd;
      profile.lastPassiveTick = now.toJSDate();

      // Sauvegarde du profil avec la mise à jour
      await profile.save();

      console.log(
        `✅ ${
          profile.userId
        } : +${bubblesToAdd} bulles ajoutées (inactivité de ${Math.floor(
          diffInMinutes
        )} min)`
      );
    } else {
      console.log(
        `⏰ Pas de mise à jour des bulles pour l'utilisateur ${
          profile.userId
        } (inactivité de ${Math.floor(diffInMinutes)} min)`
      );
    }
  }
  console.log(`💙 Maj des bulles effectuée !`);
}

module.exports = { updatePassiveBubbles };
