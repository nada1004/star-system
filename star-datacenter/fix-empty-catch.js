#!/usr/bin/env node
/**
 * Empty catch 블록을 자동으로 로깅 추가 형태로 변환
 * 사용: node fix-empty-catch.js
 */

const fs = require('fs');
const path = require('path');

const jsDir = './js';
const files = fs.readdirSync(jsDir).filter(f => f.endsWith('.js'));

let totalFixed = 0;
let totalFiles = 0;

files.forEach(file => {
  const filePath = path.join(jsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // 패턴 1: } catch(e) {} 또는 } catch(err) {}
  content = content.replace(/\}[\s]*catch[\s]*\(([a-zA-Z_$][a-zA-Z0-9_$]*)\)[\s]*\{[\s]*\}/g, (match, paramName) => {
    return `} catch(${paramName}) { console.warn('[${file}] Caught error:', ${paramName}.message || ${paramName}); }`;
  });

  // 패턴 2: } catch() {} (파라미터 없음)
  content = content.replace(/\}[\s]*catch[\s]*\(\)[\s]*\{[\s]*\}/g, () => {
    return `} catch(e) { console.warn('[${file}] Caught error without details'); }`;
  });

  // 패턴 3: } catch {}  (no parens)
  content = content.replace(/\}[\s]*catch[\s]*\{[\s]*\}/g, () => {
    return `} catch(e) { console.warn('[${file}] Caught error without details'); }`;
  });

  if (content !== original) {
    const count = (content.match(/console\.warn\(\'\[/g) || []).length - (original.match(/console\.warn\(\'\[/g) || []).length;
    totalFixed += count;
    totalFiles++;
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ ${file}: +${count} logging statements`);
  }
});

console.log(`\n✅ 완료: ${totalFiles}개 파일에서 ${totalFixed}개 catch 블록 수정`);
