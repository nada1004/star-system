const fs = require('fs');
const content = fs.readFileSync('js/cfg.js', 'utf8');
const lines = content.split('\n').slice(146, 770);
lines.forEach((l, i) => {
  if (l.includes('`')) {
    const count = (l.match(/`/g) || []).length;
    console.log(`${i + 147}: ${count} backticks - ${l.trim().substring(0, 70)}`);
  }
});
