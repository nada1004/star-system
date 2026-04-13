const fs = require('fs');
const cfgContent = fs.readFileSync('js/cfg.js', 'utf8');
const tierContent = fs.readFileSync('js/tier-tour-orig.js', 'utf8');

const cfgLines = cfgContent.split('\n');
const tierLines = tierContent.split('\n');

console.log('전체 파일 크기 비교:');
console.log('cfg.js:', cfgLines.length, '줄');
console.log('tier-tour-orig.js:', tierLines.length, '줄');
console.log('');

// cfg.js의 rCfg 함수 찾기
let cfgRcfgStart = -1;
let cfgRcfgEnd = -1;

for (let i = 0; i < cfgLines.length; i++) {
  if (cfgLines[i].includes('function rCfg(')) {
    cfgRcfgStart = i;
  }
  if (cfgLines[i].includes('function renderStorageInfo(')) {
    cfgRcfgEnd = i;
    break;
  }
}

console.log('cfg.js rCfg 함수 범위:', cfgRcfgStart + 1, '~', cfgRcfgEnd);
console.log('rCfg 함수 길이:', cfgRcfgEnd - cfgRcfgStart, '줄');
console.log('');

// tier-tour-orig.js의 rCfg 함수 찾기
let tierRcfgStart = -1;
let tierRcfgEnd = -1;

for (let i = 0; i < tierLines.length; i++) {
  if (tierLines[i].includes('function rCfg(')) {
    tierRcfgStart = i;
  }
  if (tierLines[i].includes('function renderStorageInfo(')) {
    tierRcfgEnd = i;
    break;
  }
}

console.log('tier-tour-orig.js rCfg 함수 범위:', tierRcfgStart + 1, '~', tierRcfgEnd);
console.log('rCfg 함수 길이:', tierRcfgEnd - tierRcfgStart, '줄');
console.log('');

// rCfg 함수 내용 비교
const cfgRcfgLines = cfgLines.slice(cfgRcfgStart, cfgRcfgEnd);
const tierRcfgLines = tierLines.slice(tierRcfgStart, tierRcfgEnd);

console.log('rCfg 함수 길이 차이:', (tierRcfgEnd - tierRcfgStart) - (cfgRcfgEnd - cfgRcfgStart), '줄');
console.log('');

// cfg.js의 550~769줄 확인
console.log('cfg.js 550~769줄 내용:');
for (let i = 549; i < 770 && i < cfgLines.length; i++) {
  if (cfgLines[i].trim().length > 0) {
    console.log(`${i + 1}: ${cfgLines[i].trim().substring(0, 80)}`);
  }
}
