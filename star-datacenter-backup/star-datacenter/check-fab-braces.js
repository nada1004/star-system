const fs = require('fs');
const content = fs.readFileSync('js/cfg.js', 'utf8');
const lines = content.split('\n').slice(870, 906);
let brace = 0;
lines.forEach((l, i) => {
  const open = (l.match(/{/g) || []).length;
  const close = (l.match(/}/g) || []).length;
  brace += open - close;
  console.log(`${i + 871}: brace=${brace} ${l.trim().substring(0, 60)}`);
});
console.log('Final brace count at line 906:', brace);
