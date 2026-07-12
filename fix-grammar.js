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

const fixes = [
  [/Melden Du sich/g, "Melde dich"],
  [/melden Du sich/g, "melde dich"],
  [/Erstellen Du/g, "Erstelle"],
  [/erstellen Du/g, "erstelle"],
  [/Verwenden Du/g, "Verwende"],
  [/verwenden Du/g, "verwende"],
  [/Aktivieren Du/g, "Aktiviere"],
  [/aktivieren Du/g, "aktiviere"],
  [/Du haben/g, "Hast du"],
  [/Wählen Du/g, "Wähle"],
  [/wählen Du/g, "wähle"],
  [/Gehen Du/g, "Gehe"],
  [/gehen Du/g, "gehe"],
  [/Lassen Du/g, "Lasse"],
  [/lassen Du/g, "lasse"],
  [/Teilen Du/g, "Teile"],
  [/teilen Du/g, "teile"],
  [/Geben Du/g, "Gib"],
  [/geben Du/g, "gib"],
  [/Steuern Du/g, "Steuere"],
  [/steuern Du/g, "steuere"],
  [/Fügen Du/g, "Füge"],
  [/fügen Du/g, "füge"],
  [/Bearbeiten Du/g, "Bearbeite"],
  [/bearbeiten Du/g, "bearbeite"],
  [/Verwalten Du/g, "Verwalte"],
  [/verwalten Du/g, "verwalte"],
  [/Sammeln Du/g, "Sammle"],
  [/sammeln Du/g, "sammle"],
  [/Schließen Du/g, "Schließe"],
  [/schließen Du/g, "schließe"],
  [/Reduzieren Du/g, "Reduziere"],
  [/reduzieren Du/g, "reduziere"],
  [/Überprüfen Du/g, "Überprüfe"],
  [/überprüfen Du/g, "überprüfe"],
  [/Stellen Du/g, "Stelle"],
  [/stellen Du/g, "stelle"],
  [/Wenden Du/g, "Wende"],
  [/wenden Du/g, "wende"],
  [/Zeigen Du/g, "Zeige"],
  [/zeigen Du/g, "zeige"],
  [/Klicken Du/g, "Klicke"],
  [/klicken Du/g, "klicke"],
  [/Laden Du/g, "Lade"],
  [/laden Du/g, "lade"],
  [/Speichern Du/g, "Speichere"],
  [/speichern Du/g, "speichere"],
  [/Ziehen Du/g, "Ziehe"],
  [/ziehen Du/g, "ziehe"],
  [/Ändern Du/g, "Ändere"],
  [/ändern Du/g, "ändere"],
  [/Entfernen Du/g, "Entferne"],
  [/entfernen Du/g, "entferne"],
  [/Drücken Du/g, "Drücke"],
  [/drücken Du/g, "drücke"],
  [/Benutzen Du/g, "Benutze"],
  [/benutzen Du/g, "benutze"],
  [/Machen Du/g, "Mache"],
  [/machen Du/g, "mache"],
  [/Sehen Du/g, "Sieh"],
  [/sehen Du/g, "sieh"],
  [/Du sich/g, "dich"],
  [/Du Dein/g, "dein"],
  [/Du Deine/g, "deine"],
  [/Du Ihren/g, "deinen"],
  [/Du Ihre/g, "deine"],
  [/Du Ihr/g, "dein"],
  [/Ihren /g, "deinen "],
  [/Ihre /g, "deine "],
  [/Ihr /g, "dein "],
  [/Ihnen/g, "dir"],
  [/\b([A-ZÄÖÜ][a-zäöüß]+)en Du\b/g, "$1e"],
  [/\b([a-zäöüß]+)en Du\b/g, "$1e"]
];

function run() {
  const files = findSourceFiles('./src');
  let totalFixed = 0;

  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    for (const [regex, replacement] of fixes) {
      content = content.replace(regex, replacement);
    }

    if (content !== originalContent) {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`Fixed grammar in: ${file}`);
      totalFixed++;
    }
  }

  console.log(`Grammar fixes applied to ${totalFixed} files.`);
}

run();
