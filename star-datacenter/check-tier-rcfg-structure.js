const fs = require('fs');
const content = fs.readFileSync('js/tier-tour-orig.js', 'utf8');
const lines = content.split('\n');

// tier-tour-orig.js의 rCfg 함수 시작/끝 찾기
let rcfgStart = -1;
let rcfgEnd = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('function rCfg(')) {
    rcfgStart = i;
  }
  if (lines[i].includes('function renderStorageInfo(')) {
    rcfgEnd = i;
    break;
  }
}

console.log('tier-tour-orig.js rCfg 함수 범위:', rcfgStart + 1, '~', rcfgEnd);
console.log('rCfg 함수 길이:', rcfgEnd - rcfgStart, '줄');
console.log('');

// 1494줄(`;) 이후 코드가 rCfg 내부에 있는지 확인
let brace = 0;
for (let i = rcfgStart; i < rcfgEnd; i++) {
  const open = (lines[i].match(/{/g) || []).length;
  const close = (lines[i].match(/}/g) || []).length;
  brace += open - close;
}

console.log('tier-tour-orig.js rCfg 함수 중괄호 카운트:', brace);
console.log('');

// 1494줄에서 rCfg 끝까지 중괄호 카운트
let brace2 = 0;
for (let i = 1493; i < rcfgEnd; i++) {
  const open = (lines[i].match(/{/g) || []).length;
  const close = (lines[i].match(/}/g) || []).length;
  brace2 += open - close;
}

console.log('tier-tour-orig.js 1494줄(`;)부터 rCfg 끝까지 중괄호 카운트:', brace2);
