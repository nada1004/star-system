const fs = require('fs');
const content = fs.readFileSync('js/cfg.js', 'utf8');
const lines = content.split('\n').slice(772, 866);
let brace = 0;
lines.forEach((l, i) => {
  const open = (l.match(/{/g) || []).length;
  const close = (l.match(/}/g) || []).length;
  brace += open - close;
  if (brace < 0 || (i > 0 && i % 50 === 0)) {
    console.log(`${i + 773}: brace=${brace}`);
  }
});
console.log('Final brace count at line 866:', brace);
