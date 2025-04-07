const { DateTime } = require("luxon");
const { commitDatabaseFile } = require("../events/github");

module.exports = function scheduleCommit() {
  let lastCommitTime = null;

  setInterval(() => {
    const now = DateTime.now().setZone("Europe/Paris");
    const currentTime = now.toFormat("HH:mm");

    // Vérifie que c’est minuit pile et que le commit n’a pas déjà été envoyé
    if (now.hour === 0 && now.minute === 0 && lastCommitTime !== currentTime) {
      console.log(
        `⏰ Il est ${now.toFormat("HH:mm:ss")}, lancement du commit !`
      );
      commitDatabaseFile(); // Appelle la fonction pour effectuer le commit
      lastCommitTime = currentTime; // Met à jour l'heure du dernier commit
    }
  }, 60 * 1000); // vérifie chaque minute
};
