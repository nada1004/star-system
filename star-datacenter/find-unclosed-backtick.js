const fs = require('fs');
const content = fs.readFileSync('js/cfg.js', 'utf8');
const lines = content.split('\n').slice(146, 770);
let backtick = 0;
let templateStart = null;
lines.forEach((l, i) => {
  const open = (l.match(/`/g) || []).length;
  if (backtick % 2 === 0 && open > 0) {
    templateStart = i + 147;
  }
  backtick += open;
  if (backtick % 2 !== 0 && i === lines.length - 1) {
    console.log(`Unclosed template literal starts at line ${templateStart}`);
    console.log(`Current backtick count at line ${i + 147}: ${backtick}`);
  }
});
