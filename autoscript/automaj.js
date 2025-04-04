const { Octokit } = require("@octokit/rest");
const fs = require("fs");
const path = require("path");
const config = require("../config.json");

// Configuration GitHub depuis config.json
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_OWNER = config.GITHUB_OWNER;
const GITHUB_REPO = config.GITHUB_REPO;
const BRANCH = config.BRANCH;

// Obtenir le chemin absolu vers le fichier database.sqlite dans le dossier Sequelize
const DB_FILE_PATH = path.resolve(__dirname, "../Sequelize/database.sqlite");

// Vérifier si le fichier existe
if (!fs.existsSync(DB_FILE_PATH)) {
  console.log(
    `Le fichier 'database.sqlite' n'existe pas à l'emplacement : ${DB_FILE_PATH}`
  );
  return;
} else {
  console.log(
    `Le fichier 'database.sqlite' existe à l'emplacement : ${DB_FILE_PATH}`
  );
}

// Initialiser Octokit avec le token d'authentification GitHub
const octokit = new Octokit({
  auth: GITHUB_TOKEN,
});

// Fonction pour effectuer un commit sur GitHub
async function commitDatabaseFile() {
  const fileContent = fs.readFileSync(DB_FILE_PATH, "base64");

  try {
    const {
      data: { sha },
    } = await octokit.repos.getContent({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: "Sequelize/database.sqlite", // Le chemin du fichier dans le dépôt GitHub
      ref: BRANCH,
    });

    await octokit.repos.createOrUpdateFileContents({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: "Sequelize/database.sqlite", // Le chemin du fichier dans le dépôt GitHub
      message: "Mise à jour quotidienne automatique du fichier database.sqlite",
      content: fileContent,
      sha, // Met à jour le fichier si SHA est trouvé
      branch: BRANCH,
    });

    console.log("Le commit a été effectué avec succès !");
  } catch (error) {
    if (error.status === 404) {
      // Si le fichier n'existe pas encore, créer un nouveau fichier
      await octokit.repos.createOrUpdateFileContents({
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        path: "Sequelize/database.sqlite", // Le chemin du fichier dans le dépôt GitHub
        message: "Création du fichier database.sqlite",
        content: fileContent,
        branch: BRANCH,
      });

      console.log(
        "Le fichier 'database.sqlite' a été créé et le commit effectué."
      );
    } else {
      console.error(
        "Erreur lors de la mise à jour du fichier sur GitHub :",
        error
      );
    }
  }
}

// Fonction pour exécuter le commit tous les jours à minuit
function scheduleCommit() {
  // Calculer le temps restant avant minuit
  const now = new Date();
  const nextMidnight = new Date(now);
  nextMidnight.setHours(24, 0, 0, 0);
  const timeUntilMidnight = nextMidnight - now;

  // Exécuter la fonction commitDatabaseFile à minuit
  setTimeout(() => {
    commitDatabaseFile(); // Faire le commit
    setInterval(commitDatabaseFile, 24 * 60 * 60 * 1000); // Replanifier tous les jours à 00h00
  }, timeUntilMidnight);
}

// Lancer la planification du commit
scheduleCommit();
