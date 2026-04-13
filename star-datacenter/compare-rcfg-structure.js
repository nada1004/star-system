const fs = require('fs');
const cfgContent = fs.readFileSync('js/cfg.js', 'utf8');
const tierContent = fs.readFileSync('js/tier-tour-orig.js', 'utf8');

const cfgLines = cfgContent.split('\n');
const tierLines = tierContent.split('\n');

// rCfg 함수 시작 찾기
let cfgRcfgStart = -1;
let tierRcfgStart = -1;

for (let i = 0; i < cfgLines.length; i++) {
  if (cfgLines[i].includes('function rCfg(')) {
    cfgRcfgStart = i;
    break;
  }
}

for (let i = 0; i < tierLines.length; i++) {
  if (tierLines[i].includes('function rCfg(')) {
    tierRcfgStart = i;
    break;
  }
}

console.log('cfg.js rCfg 시작 줄:', cfgRcfgStart + 1);
console.log('tier-tour-orig.js rCfg 시작 줄:', tierRcfgStart + 1);
console.log('');

// rCfg 함수에서 h+=` 찾기
let cfgHplusStart = -1;
let tierHplusStart = -1;

for (let i = cfgRcfgStart; i < cfgLines.length; i++) {
  if (cfgLines[i].includes("h+=`")) {
    cfgHplusStart = i;
    break;
  }
}

for (let i = tierRcfgStart; i < tierLines.length; i++) {
  if (tierLines[i].includes("h+=`")) {
    tierHplusStart = i;
    break;
  }
}

console.log('cfg.js h+=` 시작 줄:', cfgHplusStart + 1);
console.log('tier-tour-orig.js h+=` 시작 줄:', tierHplusStart + 1);
console.log('');

// 템플릿 리터럴 끝 찾기
let cfgTemplateEnd = -1;
let tierTemplateEnd = -1;

for (let i = cfgHplusStart; i < cfgLines.length; i++) {
  if (cfgLines[i].trim() === '`;') {
    cfgTemplateEnd = i;
    break;
  }
}

for (let i = tierHplusStart; i < tierLines.length; i++) {
  if (tierLines[i].trim() === '`;') {
    tierTemplateEnd = i;
    break;
  }
}

console.log('cfg.js 템플릿 리터럴 끝 줄:', cfgTemplateEnd + 1);
console.log('tier-tour-orig.js 템플릿 리터럴 끝 줄:', tierTemplateEnd + 1);
console.log('');

// 템플릿 리터럴 길이
const cfgTemplateLength = cfgTemplateEnd - cfgHplusStart;
const tierTemplateLength = tierTemplateEnd - tierHplusStart;

console.log('cfg.js 템플릿 리터럴 길이:', cfgTemplateLength, '줄');
console.log('tier-tour-orig.js 템플릿 리터럴 길이:', tierTemplateLength, '줄');
console.log('차이:', tierTemplateLength - cfgTemplateLength, '줄');
console.log('');

// 백틱 개수
const cfgTemplateLines = cfgLines.slice(cfgHplusStart, cfgTemplateEnd + 1);
const tierTemplateLines = tierLines.slice(tierHplusStart, tierTemplateEnd + 1);

const cfgTemplateContent = cfgTemplateLines.join('\n');
const tierTemplateContent = tierTemplateLines.join('\n');

const cfgBacktickCount = (cfgTemplateContent.match(/`/g) || []).length;
const tierBacktickCount = (tierTemplateContent.match(/`/g) || []).length;

console.log('cfg.js 템플릿 리터럴 백틱 개수:', cfgBacktickCount);
console.log('tier-tour-orig.js 템플릿 리터럴 백틱 개수:', tierBacktickCount);
console.log('차이:', tierBacktickCount - cfgBacktickCount, '개');
