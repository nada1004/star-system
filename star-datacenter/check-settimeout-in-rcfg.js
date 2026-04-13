const fs = require('fs');
const content = fs.readFileSync('js/cfg.js', 'utf8');
const lines = content.split('\n');

// 770줄 이후 setTimeout이 rCfg 내부에 있는지 확인
let brace = 0;
let rcfgEnd = -1;

for (let i = 127; i < lines.length; i++) {
  const open = (lines[i].match(/{/g) || []).length;
  const close = (lines[i].match(/}/g) || []).length;
  brace += open - close;
  if (i >= 128 && brace === 0 && rcfgEnd === -1) {
    rcfgEnd = i + 1;
    console.log(`rCfg 함수 끝: Line ${rcfgEnd}`);
    break;
  }
}

console.log('770줄(`;)부터 rCfg 끝까지의 중괄호 카운트:');
let brace2 = 0;
for (let i = 769; i < rcfgEnd && i < lines.length; i++) {
  const open = (lines[i].match(/{/g) || []).length;
  const close = (lines[i].match(/}/g) || []).length;
  brace2 += open - close;
  console.log(`${i + 1}: ${brace2} (${lines[i].trim().substring(0, 50)})`);
}

console.log('\n최종 중괄호 카운트:', brace2);
