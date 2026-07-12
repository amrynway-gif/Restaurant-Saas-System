const fs = require("fs");
const path = require("path");

const componentsDir = path.join(__dirname, "src", "components");
const files = fs.readdirSync(componentsDir).filter(f => f.startsWith("menu-") && f.endsWith(".tsx"));

const rules = [
  // Backgrounds
  [/bg-white(?:\/\d+)?(?!-)/g, "bg-[var(--bg-surface)]"],
  [/dark:bg-stone-900(?:\/\d+)?/g, ""],
  [/dark:bg-stone-950(?:\/\d+)?/g, ""],
  [/dark:bg-stone-800(?:\/\d+)?/g, ""],
  [/bg-stone-50(?:\/\d+)?(?!-)/g, "bg-[var(--bg-base)]"],
  [/bg-stone-100(?:\/\d+)?(?!-)/g, "bg-[var(--bg-surface-2)]"],
  [/bg-stone-200(?:\/\d+)?(?!-)/g, "bg-[var(--bg-surface-3)]"],
  
  // Gradients
  [/from-stone-100/g, "from-[var(--bg-base)]"],
  [/via-stone-50/g, "via-[var(--bg-base)]"],
  [/to-stone-100/g, "to-[var(--bg-base)]"],
  [/dark:from-stone-[0-9]+/g, ""],
  [/dark:via-stone-[0-9]+/g, ""],
  [/dark:to-stone-[0-9]+/g, ""],

  // Texts
  [/text-stone-900/g, "text-[var(--text-primary)]"],
  [/dark:text-stone-50/g, ""],
  [/dark:text-stone-100/g, ""],
  [/text-stone-800/g, "text-[var(--text-primary)]"],
  [/dark:text-stone-200(\/\d+)?/g, ""],
  [/text-stone-700/g, "text-[var(--text-secondary)]"],
  [/dark:text-stone-300/g, ""],
  [/text-stone-600/g, "text-[var(--text-secondary)]"],
  [/dark:text-stone-400/g, ""],
  [/text-stone-500/g, "text-[var(--text-muted)]"],
  [/dark:text-stone-500/g, ""],

  // Borders
  [/border-stone-[0-9]+(?:\/\d+)?/g, "border-[var(--border)]"],
  [/dark:border-white\/\d+/g, ""],
  [/dark:border-stone-[0-9]+(?:\/\d+)?/g, ""],
  
  // Rings
  [/ring-stone-[0-9]+(?:\/\d+)?/g, "ring-[var(--border-strong)]"],
  [/dark:ring-white\/\d+/g, ""],
  
  // Shadows (we can leave shadows alone or replace colors)
  [/shadow-stone-[0-9]+\/\d+/g, "shadow-black/10"],
  [/dark:shadow-black\/\d+/g, ""],
];

for (const file of files) {
  const filePath = path.join(componentsDir, file);
  let content = fs.readFileSync(filePath, "utf-8");
  for (const [regex, replacement] of rules) {
    content = content.replace(regex, replacement);
  }
  // cleanup multiple spaces left by removing dark: classes
  content = content.replace(/  +/g, " ");
  // fix template literal trailing spaces
  content = content.replace(/ \`/g, "`").replace(/\` /g, "`");
  
  fs.writeFileSync(filePath, content, "utf-8");
}
console.log("Replaced colors in menu components.");
