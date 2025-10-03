#!/usr/bin/env node

const { exec } = require("child_process");

// Récupère le port passé en argument (par défaut 3000)
const PORT = process.argv[2] || 3000;

// Cherche le PID qui occupe le port
exec(`lsof -ti:${PORT}`, (err, stdout) => {
  if (err) {
    console.log(`✅ Le port ${PORT} est déjà libre.`);
    return;
  }

  const pid = stdout.trim();
  if (!pid) {
    console.log(`✅ Le port ${PORT} est déjà libre.`);
    return;
  }

  console.log(`⚠️  Le port ${PORT} est occupé par le processus PID=${pid}.`);
  exec(`kill -9 ${pid}`, (killErr) => {
    if (killErr) {
      console.error(`❌ Impossible de tuer le process PID=${pid} :`, killErr.message);
    } else {
      console.log(`✅ Processus PID=${pid} tué. Le port ${PORT} est maintenant libre.`);
    }
  });
});
