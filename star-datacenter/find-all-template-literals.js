const fs = require('fs');
const content = fs.readFileSync('js/cfg.js', 'utf8');
const lines = content.split('\n');

console.log('cfg.js 모든 h+=` 블록 찾기:');
console.log('--------------------------------------------------');

let hplusBlocks = [];
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('h+=`')) {
    hplusBlocks.push({ line: i + 1, content: lines[i].trim().substring(0, 60) });
  }
}

console.log(`총 ${hplusBlocks.length}개의 h+=\` 블록 발견:`);
hplusBlocks.forEach((block, idx) => {
  console.log(`${idx + 1}. Line ${block.line}: ${block.content}`);
});

console.log('\n--------------------------------------------------');
console.log('모든 `; 블록 찾기:');
console.log('--------------------------------------------------');

let semicolonBlocks = [];
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim() === '`;') {
    semicolonBlocks.push({ line: i + 1 });
  }
}

console.log(`총 ${semicolonBlocks.length}개의 \`; 블록 발견:`);
semicolonBlocks.forEach((block, idx) => {
  console.log(`${idx + 1}. Line ${block.line}`);
});
