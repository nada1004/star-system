const fs = require('fs');
const cfgContent = fs.readFileSync('js/cfg.js', 'utf8');
const tierContent = fs.readFileSync('js/tier-tour-orig.js', 'utf8');

const cfgLines = cfgContent.split('\n');
const tierLines = tierContent.split('\n');

// cfg.js와 tier-tour-orig.js의 rCfg 함수 시작/끝 찾기
let cfgRcfgStart = -1;
let cfgRcfgEnd = -1;
let tierRcfgStart = -1;
let tierRcfgEnd = -1;

for (let i = 0; i < cfgLines.length; i++) {
  if (cfgLines[i].includes('function rCfg(')) {
    cfgRcfgStart = i;
  }
  if (cfgLines[i].includes('function renderStorageInfo(')) {
    cfgRcfgEnd = i;
    break;
  }
}

for (let i = 0; i < tierLines.length; i++) {
  if (tierLines[i].includes('function rCfg(')) {
    tierRcfgStart = i;
  }
  if (tierLines[i].includes('function renderStorageInfo(')) {
    tierRcfgEnd = i;
    break;
  }
}

console.log('cfg.js rCfg:', cfgRcfgStart + 1, '~', cfgRcfgEnd, '(길이:', cfgRcfgEnd - cfgRcfgStart, '줄)');
console.log('tier-tour-orig.js rCfg:', tierRcfgStart + 1, '~', tierRcfgEnd, '(길이:', tierRcfgEnd - tierRcfgStart, '줄)');
console.log('');

// cfg.js의 770줄(`;) 위치 확인
let cfg770 = -1;
for (let i = 0; i < cfgLines.length; i++) {
  if (cfgLines[i].trim() === '`;') {
    if (cfg770 === -1) cfg770 = i + 1;
    else if (cfg770 === 770) break;
  }
}

console.log('cfg.js 770줄(`;) 위치:', cfg770);
console.log('');

// tier-tour-orig.js의 1494줄(`;) 위치 확인
let tier1494 = -1;
for (let i = 0; i < tierLines.length; i++) {
  if (tierLines[i].trim() === '`;') {
    if (tier1494 === -1) tier1494 = i + 1;
    else if (tier1494 === 1494) break;
  }
}

console.log('tier-tour-orig.js 1494줄(`;) 위치:', tier1494);
console.log('');

// cfg.js에서 770줄(`;)부터 rCfg 끝까지 줄 수
const cfgAfter770 = cfgRcfgEnd - (cfg770 - 1);
console.log('cfg.js 770줄(`;)부터 rCfg 끝까지:', cfgAfter770, '줄');

// tier-tour-orig.js에서 1494줄(`;)부터 rCfg 끝까지 줄 수
const tierAfter1494 = tierRcfgEnd - (tier1494 - 1);
console.log('tier-tour-orig.js 1494줄(`;)부터 rCfg 끝까지:', tierAfter1494, '줄');
