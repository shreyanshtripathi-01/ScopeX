const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx')) results.push(file);
    }
  });
  return results;
}

const files = walk('src/app');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/bg-\[#161b22\]/g, 'bg-card');
  content = content.replace(/border-\[#30363d\]/g, 'border-border');
  content = content.replace(/bg-\[#0d1117\]/g, 'bg-background');
  content = content.replace(/text-\[#8b949e\]/g, 'text-muted');
  content = content.replace(/text-\[#e6edf3\]/g, 'text-foreground');
  content = content.replace(/text-white/g, 'text-foreground');
  content = content.replace(/text-\[#58a6ff\]/g, 'text-accent');
  content = content.replace(/bg-\[#58a6ff\]/g, 'bg-accent');
  content = content.replace(/text-\[#3fb950\]/g, 'text-success');
  content = content.replace(/bg-\[#3fb950\]/g, 'bg-success');
  content = content.replace(/border-\[#3fb950\]\/30/g, 'border-success/30');
  content = content.replace(/text-\[#f85149\]/g, 'text-danger');
  content = content.replace(/bg-\[#f85149\]/g, 'bg-danger');
  content = content.replace(/border-\[#f85149\]\/30/g, 'border-danger/30');
  content = content.replace(/bg-\[#238636\]/g, 'bg-primary');
  content = content.replace(/hover:bg-\[#2ea043\]/g, 'hover:bg-primary-hover');
  content = content.replace(/bg-\[#21262d\]/g, 'bg-muted/20');
  content = content.replace(/placeholder-\[#8b949e\]/g, 'placeholder-muted');
  content = content.replace(/focus:border-\[#58a6ff\]/g, 'focus:border-accent');
  content = content.replace(/focus:ring-\[#58a6ff\]/g, 'focus:ring-accent');
  content = content.replace(/stroke="#8b949e"/g, 'stroke="currentColor" className="text-muted"');
  fs.writeFileSync(file, content);
});
console.log('Replacements completed successfully.');
