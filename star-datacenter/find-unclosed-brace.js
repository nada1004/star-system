const fs = require('fs');
const content = fs.readFileSync('js/cfg.js', 'utf8');
const lines = content.split('\n');
let brace = 0;
let unclosedLine = -1;

for (let i = 127; i < 905; i++) {
  const open = (lines[i].match(/{/g) || []).length;
  const close = (lines[i].match(/}/g) || []).length;
  brace += open - close;
  if (brace < 0) {
    console.log(`Line ${i + 1}: 음수 중괄호 카운트 ${brace}`);
  }
  if (unclosedLine === -1 && brace > 0) {
    unclosedLine = i + 1;
  }
}

console.log('\n결과:');
console.log('128~905줄 중괄호 카운트:', brace);
console.log('첫 번째 열린 블록 위치:', unclosedLine);
console.log('\n770줄(`;) 주변 구간:');
for (let i = 765; i < 775 && i < lines.length; i++) {
  console.log(`${i + 1}: ${lines[i].trim().substring(0, 60)}`);
}
