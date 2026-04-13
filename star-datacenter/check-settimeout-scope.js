const fs = require('fs');
const content = fs.readFileSync('js/cfg.js', 'utf8');
const lines = content.split('\n').slice(772, 867);
let brace = 0;
lines.forEach((l, i) => {
  const open = (l.match(/{/g) || []).length;
  const close = (l.match(/}/g) || []).length;
  brace += open - close;
  console.log(`${i + 773}: brace=${brace} ${l.trim().substring(0, 50)}`);
});
console.log('Final brace count at line 866:', brace);
