const fs = require('fs');
const path = require('path');

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
  const files = findSourceFiles('./src');
  let totalFixed = 0;

  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    // Match words like Dein, Deine, Deiner, Deines, Deinem, Deinen
    // ONLY if they are preceded by a lowercase letter, comma, or space but NOT end of sentence punctuation.
    // Actually, simple regex: if preceded by anything other than a sentence ender (., !, ?, >, ", \n)
    // A simpler approach: replace space + Dein -> space + dein, but we need to exclude cases where 
    // it's the start of a string or tag like `> Dein` or `" Dein`.
    
    // Let's replace:
    // " Dein" -> " dein"
    // " Deine" -> " deine"
    // " Deinen" -> " deinen"
    // " Deinem" -> " deinem"
    // " Deiner" -> " deiner"
    // " Deines" -> " deines"
    // " Dir" -> " dir"
    // " Dich" -> " dich"
    // " Du" -> " du"
    
    // But we MUST avoid replacing it at the beginning of a sentence.
    // A sentence boundary is usually `.` or `!` or `?` followed by space.
    // So we can use a lookbehind if the environment supports it, or just a capturing group.
    
    const wordsToLower = ['Dein', 'Deine', 'Deinen', 'Deinem', 'Deiner', 'Deines', 'Dir', 'Dich', 'Du'];
    
    for (const word of wordsToLower) {
      // Regex matches:
      // Group 1: a word character or comma, then a space (or multiple spaces)
      // Group 2: the word itself
      const regex = new RegExp(`([a-zäöüß0-9,>]\\s+)${word}\\b`, 'g');
      content = content.replace(regex, (match, p1) => {
        // If it's preceded by > (HTML tag start) and it's the first word, we probably want it capitalized.
        // E.g. `> Deine Bestellungen`. So let's exclude `>` from the preceding characters.
        return match;
      });
      
      const regexSafe = new RegExp(`([a-zäöüß0-9,]\\s+)${word}\\b`, 'g');
      content = content.replace(regexSafe, (match, p1) => {
        return p1 + word.toLowerCase();
      });
      
      // Also catch cases where it's right after a quotation mark if it's mid sentence? Usually not needed.
      // What about `- Dein`? Like `Erstelle Dein Restaurant`
      const regexSafe2 = new RegExp(`([a-zäöüß0-9,]\\s+)-?\\s*${word}\\b`, 'g');
       content = content.replace(regexSafe2, (match) => {
        return match.toLowerCase(); // lowercases the letters inside
      });
    }

    if (content !== originalContent) {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`Fixed capitalization in: ${file}`);
      totalFixed++;
    }
  }

  console.log(`Capitalization fixes applied to ${totalFixed} files.`);
}

run();
