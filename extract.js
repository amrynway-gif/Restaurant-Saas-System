const { Project, SyntaxKind } = require('ts-morph');
const fs = require('fs');

const project = new Project();
project.addSourceFilesAtPaths("src/**/*.ts");
project.addSourceFilesAtPaths("src/**/*.tsx");

const arabicRegex = /[\u0600-\u06FF]/;
const strings = new Set();

for (const sourceFile of project.getSourceFiles()) {
  sourceFile.forEachDescendant(node => {
    let text = null;
    if (node.getKind() === SyntaxKind.StringLiteral || node.getKind() === SyntaxKind.NoSubstitutionTemplateLiteral) {
      text = node.getLiteralValue();
    } else if (node.getKind() === SyntaxKind.JsxText) {
      text = node.getText(); // JSX text might have newlines and spaces
      // Clean up JSX text formatting
      text = text.replace(/^{['"]|['"]}$/g, '').trim(); 
    }

    if (text && arabicRegex.test(text)) {
      // For JSX Text, we might get multiple lines with spacing. Let's keep it as is, or trim it.
      const cleaned = text.trim();
      if (cleaned) {
        strings.add(cleaned);
      }
    }
  });
}

const stringsArray = Array.from(strings);
fs.writeFileSync('arabic-strings.json', JSON.stringify(stringsArray, null, 2));
console.log(`Extracted ${stringsArray.length} unique Arabic strings.`);
