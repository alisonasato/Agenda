// Extracts from the target's compiled CSS only the rules this clone's markup can match.
// Usage: node scripts/extract-css-eagenda.mjs <dashboard.css> <classes.txt> <out.css>
import fs from "node:fs";
import postcss from "postcss";

const [src, classesFile, out] = process.argv.slice(2);
const used = new Set(fs.readFileSync(classesFile, "utf8").split(/\s+/).filter(Boolean));
const root = postcss.parse(fs.readFileSync(src, "utf8"));

const unescape = (c) => c.replace(/\\(.)/g, "$1");
const classesOf = (sel) => [...sel.matchAll(/\.((?:\\.|[\w-])+)/g)].map((m) => unescape(m[1]));
const keepSelector = (sel) => {
  // Drop other themes, dark mode and unrelated attribute-driven states.
  if (/\[data-theme|\.dark\b|prefers-color-scheme/.test(sel)) return false;
  // Classes and ids ("#id" entries in the used list) must all be present in the markup.
  const names = [...classesOf(sel), ...[...sel.matchAll(/#([\w-]+)/g)].map((m) => `#${m[1]}`)];
  if (names.length) return names.every((c) => used.has(c));
  // Class-free selectors: only generic element / root selectors.
  return !/[#[]/.test(sel) || /^(:root|:host|\*|html|body)/.test(sel.trim());
};

root.walkRules((rule) => {
  if (rule.parent?.type === "atrule" && /keyframes/.test(rule.parent.name)) return;
  const kept = rule.selectors.filter(keepSelector);
  if (!kept.length) rule.remove();
  else rule.selectors = kept;
});
root.walkAtRules("import", (at) => at.remove());
// Drop now-empty containers (repeat for nesting).
for (let i = 0; i < 5; i++) {
  root.walkAtRules((at) => {
    if (at.nodes && at.nodes.length === 0) at.remove();
  });
}
// Keyframes nobody references anymore.
const css = root.toString();
root.walkAtRules(/keyframes$/, (at) => {
  const uses = css.split(at.params).length - 1;
  if (uses < 2) at.remove();
});
fs.writeFileSync(out, root.toString());
console.log("kept bytes:", root.toString().length);
