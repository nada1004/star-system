const fs = require('fs');
const content = fs.readFileSync('js/cfg.js', 'utf8');
const lines = content.split('\n').slice(146, 770);
let backtick = 0;
let unclosedLines = [];
lines.forEach((l, i) => {
  const open = (l.match(/`/g) || []).length;
  const prevBacktick = backtick;
  backtick += open;
  if (backtick % 2 !== 0) {
    unclosedLines.push({ line: i + 147, content: l.trim().substring(0, 60), backtick: backtick });
  }
});
console.log('Lines with odd backtick count (unclosed template literal):');
unclosedLines.forEach(item => {
  console.log(`Line ${item.line}: backtick=${item.backtick} | ${item.content}`);
});
console.log('\nFinal backtick count:', backtick, '(odd means unclosed)');
