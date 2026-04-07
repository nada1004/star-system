const fs = require('fs');

// Read the file
const content = fs.readFileSync('js/tier-tour.js', 'utf8');
const lines = content.split('\n');

let inFirstSyncSection = false;
const result = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Check if we're entering the first sync section (GitHub token section)
  if (line.includes('margin-bottom:10px;padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:8px') && 
      line.includes('GitHub token (support for thousands of viewers)')) {
    inFirstSyncSection = true;
    continue;
  }
  
  // If we're in the first sync section, skip all lines until we exit
  if (inFirstSyncSection) {
    // Exit when we find the closing div
    if (line.includes('</div>')) {
      inFirstSyncSection = false;
      // Skip the empty line too
      if (i + 1 < lines.length && lines[i + 1].trim() === '') {
        i++;
      }
    }
    continue;
  }
  
  result.push(line);
}

// Write the modified content back
fs.writeFileSync('js/tier-tour.js', result.join('\n'));
console.log('Removed duplicate GitHub token section successfully');
