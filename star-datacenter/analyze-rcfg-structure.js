const fs = require('fs');
const content = fs.readFileSync('js/cfg.js', 'utf8');
const lines = content.split('\n');

console.log('cfg.js rCfg 함수 구조 분석:');
console.log('--------------------------------------------------');

let rCfgStart = -1;
let hPlusStart = -1;
let templateEnd = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('function rCfg(')) {
    rCfgStart = i + 1;
    console.log(`rCfg 함수 시작: Line ${rCfgStart}`);
  }
  if (lines[i].includes("h+=`")) {
    hPlusStart = i + 1;
    console.log(`h+=\` 시작: Line ${hPlusStart}`);
  }
  if (lines[i].trim() === '`;') {
    templateEnd = i + 1;
    console.log(`\`; (템플릿 리터럴 끝): Line ${templateEnd}`);
  }
}

console.log('\n--------------------------------------------------');
console.log(`rCfg 시작: ${rCfgStart}`);
console.log(`h+=\` 시작: ${hPlusStart}`);
console.log(`템플릿 리터럴 끝: ${templateEnd}`);
console.log(`템플릿 리터럴 길이: ${templateEnd - hPlusStart} 줄`);

// 템플릿 리터럴 내부 백틱 개수 확인
if (hPlusStart > 0 && templateEnd > 0) {
  const templateLines = lines.slice(hPlusStart - 1, templateEnd);
  const templateContent = templateLines.join('\n');
  const backtickCount = (templateContent.match(/`/g) || []).length;
  console.log(`템플릿 리터럴 내부 백틱 개수: ${backtickCount}`);
  console.log(`백틱 개수 ${backtickCount % 2 === 0 ? '짝수 (정상)' : '홀수 (비정상)'}`);
}
