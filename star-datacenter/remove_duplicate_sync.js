// Script to remove duplicate sync buttons from tier-tour.js
// This will remove the duplicate "data sync" sections

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'js', 'tier-tour.js');

try {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove duplicate sync button sections
  const originalLength = content.length;
  
  // Pattern to match the duplicate sync sections
  const pattern = /<div style="margin-bottom:10px;padding:12px;background:var\(--surface\);border:1px solid var\(--border\);border-radius:8px">\s*<div style="font-size:12px;font-weight:700;color:var\(--blue\);margin-bottom:8px">.*?<\/div>\s*<div style="font-size:11px;color:var\(--gray-l\);margin-bottom:10px">.*?<\/div>\s*<div style="display:flex;gap:8px;flex-wrap:wrap">.*?<\/div>\s*<\/div>/gs;
  
  // Keep only the first occurrence, remove others
  let matchCount = 0;
  content = content.replace(pattern, (match) => {
    matchCount++;
    if (matchCount === 1) {
      return match; // Keep the first one
    }
    return ''; // Remove duplicates
  });
  
  fs.writeFileSync(filePath, content, 'utf8');
  
  console.log(`Removed ${matchCount - 1} duplicate sync button sections`);
  console.log(`Original length: ${originalLength}, New length: ${content.length}`);
  
} catch (error) {
  console.error('Error:', error.message);
}
