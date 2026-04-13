const fs = require('fs');
const content = fs.readFileSync('js/cfg.js', 'utf8');
const lines = content.split('\n').slice(146, 770);
let backtick = 0;
lines.forEach((l, i) => {
  const open = (l.match(/`/g) || []).length;
  const prevBacktick = backtick;
  backtick += open;
  if (open > 0) {
    console.log(`${i + 147}: ${open} backtick(s) - count ${prevBacktick} → ${backtick} - ${l.trim().substring(0, 60)}`);
  }
});
console.log('Final backtick count:', backtick);
