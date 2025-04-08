const { DateTime } = require("luxon");
const MarketHistory = require("../Sequelize/modèles/argent/bourse/MarketHistory");

function resetHistoryScheduler() {
  const now = DateTime.local();
  const nextReset = now
    .startOf("week")
    .plus({ weeks: 1 }) // lundi suivant
    .set({ hour: 0, minute: 0, second: 0, millisecond: 0 });

  const delay = nextReset.toMillis() - now.toMillis();

  setTimeout(async () => {
    try {
      await MarketHistory.destroy({ where: {} });
      console.log("[BOURSE AUTO] Historique réinitialisé !");

      // Redémarrer la boucle pour la semaine suivante
      resetHistoryScheduler();
    } catch (error) {
      console.error(
        "Erreur lors de la réinitialisation de l'historique :",
        error
      );
    }
  }, delay);
}

module.exports = { resetHistoryScheduler };
