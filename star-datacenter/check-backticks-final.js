const fs = require('fs');
const content = fs.readFileSync('js/cfg.js', 'utf8');
const lines = content.split('\n').slice(146, 770);
let backtick = 0;
lines.forEach((l, i) => {
  const open = (l.match(/`/g) || []).length;
  backtick += open;
  if (i > 0 && i % 100 === 0) {
    console.log(`${i + 147}: backtick=${backtick}`);
  }
});
console.log('Final backtick count at line 770:', backtick, 'odd?', backtick % 2 !== 0);
