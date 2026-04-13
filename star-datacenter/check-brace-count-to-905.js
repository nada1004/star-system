const fs = require('fs');
const content = fs.readFileSync('js/cfg.js', 'utf8');
const lines = content.split('\n');
let brace = 0;
for (let i = 0; i < 905; i++) {
  const open = (lines[i].match(/{/g) || []).length;
  const close = (lines[i].match(/}/g) || []).length;
  brace += open - close;
}
console.log('128~905줄 중괄호 카운트:', brace);
