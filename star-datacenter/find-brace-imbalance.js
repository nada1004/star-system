const fs = require('fs');
const content = fs.readFileSync('js/cfg.js', 'utf8');
const lines = content.split('\n');
let brace = 0;
console.log('128~906줄 중괄호 카운트 변화:');
for (let i = 127; i < 906; i++) {
  const open = (lines[i].match(/{/g) || []).length;
  const close = (lines[i].match(/}/g) || []).length;
  const prev = brace;
  brace += open - close;
  if (brace !== prev) {
    console.log(`${i + 1}: ${prev} → ${brace} (${open - close > 0 ? '+' : ''}${open - close})`);
  }
}
console.log('\n최종 중괄호 카운트:', brace);
