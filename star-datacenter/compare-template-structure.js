const fs = require('fs');
const cfgContent = fs.readFileSync('js/cfg.js', 'utf8');
const tierContent = fs.readFileSync('js/tier-tour-orig.js', 'utf8');

const cfgLines = cfgContent.split('\n').slice(146, 770);
const tierLines = tierContent.split('\n').slice(146, 770);

let cfgBacktick = 0;
let tierBacktick = 0;

console.log('Comparing backtick counts between cfg.js and tier-tour-orig.js:');
console.log('Line | cfg.js | tier-tour-orig.js | diff');
console.log('-----|--------|----------------|-----');

for (let i = 0; i < cfgLines.length; i++) {
  const cfgOpen = (cfgLines[i].match(/`/g) || []).length;
  const tierOpen = (tierLines[i].match(/`/g) || []).length;
  cfgBacktick += cfgOpen;
  tierBacktick += tierOpen;
  
  if (cfgOpen !== tierOpen) {
    console.log(`${i + 147} | ${cfgOpen} | ${tierOpen} | ${cfgOpen - tierOpen} | ${cfgLines[i].trim().substring(0, 50)}`);
  }
}

console.log('\nFinal counts:');
console.log('cfg.js:', cfgBacktick);
console.log('tier-tour-orig.js:', tierBacktick);
console.log('Difference:', cfgBacktick - tierBacktick);
