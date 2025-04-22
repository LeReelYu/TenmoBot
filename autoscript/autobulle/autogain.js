const { DateTime } = require("luxon");
const BubbleProfile = require("../../Sequelize/modèles/argent/bulle/BubbleProfile");

async function updatePassiveBubbles() {
  console.log(
    "⏳ Lancement du système de bulles passives toutes les cinq minutes..."
  );

  await runPassiveTickOnce();

  setInterval(async () => {
    try {
      await runPassiveTickOnce();
    } catch (err) {
      console.error("❌ Erreur dans la mise à jour des bulles passives :", err);
    }
  }, 60 * 1000);

  async function runPassiveTickOnce() {
    const profiles = await BubbleProfile.findAll();

    for (const profile of profiles) {
      console.log(
        `➡️ Profil ${profile.userId} : passiveRate = ${profile.passiveRate}`
      );
      console.log(`🔍 lastPassiveTick brut =`, profile.lastPassiveTick);
      const lastTick = DateTime.fromJSDate(profile.lastPassiveTick);
      const now = DateTime.now();

      const diffInMinutes = now.diff(lastTick, "minutes").minutes;

      if (diffInMinutes >= 5) {
        const bubblesToAdd = Math.floor(
          profile.passiveRate * (diffInMinutes / 5)
        );

        profile.bubbles += bubblesToAdd;
        profile.lastPassiveTick = now.toJSDate();

        await profile.save();

        console.log(
          `✅ ${
            profile.userId
          } : +${bubblesToAdd} bulles ajoutées (inactivité de ${Math.floor(
            diffInMinutes
          )} min)`
        );
      }
    }
    console.log(`💙 Maj des bulles effectuée !`);
  }
}

module.exports = { updatePassiveBubbles };
