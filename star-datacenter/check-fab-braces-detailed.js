const fs = require('fs');
const content = fs.readFileSync('js/cfg.js', 'utf8');
const lines = content.split('\n').slice(870, 905);
let brace = 0;
lines.forEach((l, i) => {
  const open = (l.match(/{/g) || []).length;
  const close = (l.match(/}/g) || []).length;
  const prevBrace = brace;
  brace += open - close;
  if (prevBrace !== brace) {
    console.log(`${i + 871}: brace ${prevBrace} → ${brace} ${l.trim().substring(0, 60)}`);
  }
});
console.log('Final brace count at line 905:', brace);
