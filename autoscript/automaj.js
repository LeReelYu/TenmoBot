const { DateTime } = require("luxon");

let lastCommitTime = null;

function scheduleCommit() {
  setInterval(() => {
    const now = DateTime.now().setZone("Europe/Paris");
    const hours = now.hour;
    const minutes = now.minute;

    if ((hours === 0 || hours === 12) && minutes === 20) {
      const currentKey = `${hours}:${minutes}`;
      if (lastCommitTime !== currentKey) {
        lastCommitTime = currentKey;
        commitDatabaseFile();
      }
    }
  }, 30 * 1000);
}

scheduleCommit();
