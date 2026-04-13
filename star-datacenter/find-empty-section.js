const fs = require('fs');
const content = fs.readFileSync('js/cfg.js', 'utf8');
const lines = content.split('\n');

console.log('cfg.js 백틱이 없는 구간 찾기:');
console.log('--------------------------------------------------');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const hasBacktick = line.includes('`');
  const hasBrace = line.includes('{') || line.includes('}');
  const hasContent = line.trim().length > 0;
  
  if (!hasBacktick && !hasBrace && hasContent) {
    console.log(`Line ${i + 1}: ${line.trim().substring(0, 80)}`);
  }
}

console.log('\n--------------------------------------------------');
console.log('전체 백틱 개수:', (content.match(/`/g) || []).length);
