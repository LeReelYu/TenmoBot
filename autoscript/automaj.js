const { DateTime } = require("luxon");

function scheduleCommit() {
  // Vérification toutes les 30 secondes
  setInterval(() => {
    const now = DateTime.now().setZone("Europe/Paris");

    // On regarde si l'heure actuelle est 12:10 ou 00:10
    if (now.minute === 10 && (now.hour === 12 || now.hour === 35)) {
      console.log(
        `⏰ Il est ${now.toFormat("HH:mm:ss")}, lancement du commit !`
      );
      commitDatabaseFile(); // Remplace avec ta fonction de commit
    }
  }, 1000); // Vérification toutes les 30 secondes
}

// Fonction de commit
function commitDatabaseFile() {
  console.log("💾 Commit effectué !");
  // Ici, tu mets la logique de commit pour ta base de données ou ce que tu veux faire
}

// Lancer la planification du commit
scheduleCommit();
