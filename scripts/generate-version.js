// scripts/generate-version.js
// Exécuter AVANT chaque build : node scripts/generate-version.js

const fs = require('fs');
const path = require('path');

const version = {
  version: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
  buildTime: new Date().toISOString(),
  buildNumber: Date.now()
};

// Écrire dans public/ pour qu'il soit copié dans build/
const outputPath = path.join(__dirname, '..', 'public', 'version.json');

fs.writeFileSync(outputPath, JSON.stringify(version, null, 2));

console.log('✅ version.json généré:', version.version);
