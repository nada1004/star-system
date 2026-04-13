const fs = require('fs');
const content = fs.readFileSync('js/cfg.js', 'utf8');
const lines = content.split('\n');
let brace = 0;
lines.forEach((l, i) => {
  const open = (l.match(/{/g) || []).length;
  const close = (l.match(/}/g) || []).length;
  brace += open - close;
});
console.log('Total open braces:', (content.match(/{/g) || []).length);
console.log('Total close braces:', (content.match(/}/g) || []).length);
console.log('Final brace count:', brace);
