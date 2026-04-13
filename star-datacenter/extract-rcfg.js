const fs = require('fs');
const content = fs.readFileSync('js/tier-tour-orig.js', 'utf8');
const lines = content.split('\n');
// Extract entire rCfg function (852-1630, 0-indexed: 851-1629)
const rcfgLines = lines.slice(851, 1630);
const rcfgContent = rcfgLines.join('\n');
fs.writeFileSync('js/cfg.js', rcfgContent, 'utf8');
console.log('Extracted rCfg function from tier-tour-orig.js');
console.log('Total lines:', rcfgLines.length);
