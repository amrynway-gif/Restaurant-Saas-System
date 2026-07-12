const fs = require('fs');
const path = require('path');

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function findSourceFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        findSourceFiles(filePath, fileList);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

function run() {
  const dictionary = JSON.parse(fs.readFileSync('translated-strings.json', 'utf8'));
  const arabicStrings = Object.keys(dictionary).sort((a, b) => b.length - a.length);

  const files = findSourceFiles('./src');

  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    // 1. Replace RTL attributes
    content = content.replace(/dir="rtl"/g, 'dir="ltr"');
    content = content.replace(/lang="ar"/g, 'lang="de"');

    // 2. Replace RTL Tailwind classes
    const classReplacements = {
      'text-right': 'text-left',
      'ml-': 'mr-',
      'mr-': 'ml-',
      'pl-': 'pr-',
      'pr-': 'pl-',
      'space-x-reverse': ''
    };

    content = content.replace(/\b(text-right|ml-|mr-|pl-|pr-|space-x-reverse)\b/g, match => {
      return classReplacements[match] !== undefined ? classReplacements[match] : match;
    });

    // 3. Replace Arabic text
    for (const arStr of arabicStrings) {
      if (content.includes(arStr)) {
        const deStr = dictionary[arStr] || arStr;
        // Global replace
        content = content.replace(new RegExp(escapeRegExp(arStr), 'g'), deStr);
      }
    }

    if (content !== originalContent) {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`Updated: ${file}`);
    }
  }

  console.log('Replacement complete.');
}

run();
