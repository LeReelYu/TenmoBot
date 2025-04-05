const { DateTime } = require("luxon");
const { commitDatabaseFile } = require("../../events/github");

function scheduleCommit() {
  let lastCommitTime = null;

  setInterval(() => {
    const now = DateTime.now().setZone("Europe/Paris");
    const currentTime = now.toFormat("HH:mm");

    // Vérifie que c’est minuit pile et que le commit n’a pas déjà été envoyé
    if (now.hour === 0 && now.minute === 0 && lastCommitTime !== currentTime) {
      console.log(
        `⏰ Il est ${now.toFormat("HH:mm:ss")}, lancement du commit !`
      );
      commitDatabaseFile();
      lastCommitTime = currentTime;
    }
  }, 60 * 1000); // vérifie chaque minute
}

// Fonction de commit
function commitDatabaseFile() {
  console.log("💾 Commit effectué !");
  // Ta logique de commit ici
}

// Lancer la planification du commit
scheduleCommit();
