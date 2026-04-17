const fs = require('fs');
const content = fs.readFileSync('js/cfg.js', 'utf8');
const lines = content.split('\n').slice(772, 866);
let backtick = 0;
lines.forEach((l, i) => {
  const open = (l.match(/`/g) || []).length;
  backtick += open;
  if (backtick % 2 !== 0) {
    console.log(`${i + 773}: backtick=${backtick} ${l.trim().substring(0, 70)}`);
  }
});
console.log('Final backtick count:', backtick, ' (should be even)');
