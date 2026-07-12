const fs = require('fs');
const path = require('path');
const translate = require('google-translate-api-x');

function findSourceFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        findSourceFiles(filePath, fileList);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.css')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const arabicRegex = /[\u0600-\u06FF]/;

async function run() {
  const files = findSourceFiles('./src');
  
  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    // 1. Remove comments containing Arabic completely.
    // Single line comments
    content = content.replace(/\/\/.*[\u0600-\u06FF].*/g, '');
    // Multi line comments (naive, but mostly safe)
    content = content.replace(/\/\*[\s\S]*?\*\//g, (match) => {
      if (arabicRegex.test(match)) return '';
      return match;
    });

    // 2. Extract remaining text nodes (very roughly via regex for quotes/jsx)
    // Actually, doing this via regex is hard. Let's just use Google Translate on ANY line that STILL contains Arabic!
    const lines = content.split('\n');
    let changed = false;

    for (let i = 0; i < lines.length; i++) {
      if (arabicRegex.test(lines[i])) {
        // Find the Arabic chunks in the line. Because of the previous transliteration bugs like "UndAلUndقت",
        // we might have mangled words. Let's just translate the whole string literal or JSX part if we can,
        // or just send the whole line if it's safe (no code keywords in Arabic).
        
        // Wait, it's safer to extract text between quotes, or > < for JSX
        // Let's replace chunks of mixed Arabic/Latin that are clearly words
        // e.g. AلUndقت
        // Actually, just translating the line is dangerous if it translates code.
        
        let line = lines[i];
        
        // Find things inside quotes or JSX tags
        const strRegex = /(["'>`])([^"'>`<]*[\u0600-\u06FF][^"'>`<]*)(["'<`])/g;
        let match;
        const replacements = [];
        
        while ((match = strRegex.exec(line)) !== null) {
           const prefix = match[1];
           const textToTranslate = match[2];
           const suffix = match[3];
           
           try {
             const res = await translate(textToTranslate, { from: 'ar', to: 'de' });
             let translated = res.text;
             // Clean up grammar
             translated = translated.replace(/Ihr /g, "Dein ").replace(/Ihre /g, "Deine ");
             translated = translated.replace(/Sie /g, "Du ").replace(/Ihnen/g, "Dir");
             replacements.push({ original: textToTranslate, translated });
           } catch(e) {
             console.error("Translation error:", e);
           }
        }
        
        for (const r of replacements) {
           line = line.replace(r.original, r.translated);
        }
        
        lines[i] = line;
        changed = true;
      }
    }

    if (changed || content !== originalContent) {
      fs.writeFileSync(file, lines.join('\n'), 'utf8');
      console.log(`Cleaned and translated: ${file}`);
    }
  }
}

run();
