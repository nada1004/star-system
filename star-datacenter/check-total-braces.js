const fs = require('fs');
const content = fs.readFileSync('js/cfg.js', 'utf8');
let open = 0, close = 0;
content.split('\n').forEach((l, i) => {
  open += (l.match(/{/g) || []).length;
  close += (l.match(/}/g) || []).length;
});
console.log(`Total open braces: ${open}`);
console.log(`Total close braces: ${close}`);
console.log(`Difference: ${open - close}`);
