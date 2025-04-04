let lastCommitTime = null;

function scheduleCommit() {
  setInterval(() => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    // Si on est à 00:10 ou 12:10
    if ((hours === 0 || hours === 12) && minutes === 10) {
      // Vérifie si on n'a pas déjà commit dans cette même minute
      const currentKey = `${hours}:${minutes}`;
      if (lastCommitTime !== currentKey) {
        lastCommitTime = currentKey;
        commitDatabaseFile();
      }
    }
  }, 30 * 1000); // Vérifie toutes les 30 secondes
}

// Lancer la planification du commit
scheduleCommit();
