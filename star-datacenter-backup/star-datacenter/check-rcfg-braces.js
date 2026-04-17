const fs = require('fs');
const content = fs.readFileSync('js/cfg.js', 'utf8');
const lines = content.split('\n').slice(127, 905);
let brace = 0;
lines.forEach((l, i) => {
  const open = (l.match(/{/g) || []).length;
  const close = (l.match(/}/g) || []).length;
  brace += open - close;
  if (brace < 0 || (i > 0 && i % 100 === 0)) {
    console.log(`${i + 128}: brace=${brace}`);
  }
});
console.log('Final brace count at line 905:', brace);
