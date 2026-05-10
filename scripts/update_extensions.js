const fs = require('fs');
const path = require('path');

// Read the sorted extensions file
const sortedPath = path.join(__dirname, '..', 'src', 'renderer', 'components', 'Sidebar', 'extensions_sorted.txt');
const sortedContent = fs.readFileSync(sortedPath, 'utf8');

// Extract just the array body (without the const declaration and the closing ])
const arrayMatch = sortedContent.match(/const ALL_EXTENSIONS: ExtensionItem\[\] = \[([\s\S]*?)\];/);
if (!arrayMatch) {
  console.error('Could not extract array from sorted file');
  process.exit(1);
}
const newArrayContent = `const ALL_EXTENSIONS: ExtensionItem[] = [${arrayMatch[1]}];`;

// Read the ExtensionsPanel.tsx file
const panelPath = path.join(__dirname, '..', 'src', 'renderer', 'components', 'Sidebar', 'ExtensionsPanel.tsx');
let panelContent = fs.readFileSync(panelPath, 'utf8');

// Replace the ALL_EXTENSIONS array
const oldArrayRegex = /const ALL_EXTENSIONS: ExtensionItem\[\] = \[[\s\S]*?\];/;
if (!oldArrayRegex.test(panelContent)) {
  console.error('Could not find ALL_EXTENSIONS array in ExtensionsPanel.tsx');
  process.exit(1);
}

panelContent = panelContent.replace(oldArrayRegex, newArrayContent);

// Add Gaming to ICON_COLORS if not present
if (!panelContent.includes("Gaming:")) {
  panelContent = panelContent.replace(
    /(const ICON_COLORS: Record<string, string> = \{[\s\S]*?)(\};)/,
    (match, p1, p2) => {
      // Add Gaming to the ICON_COLORS
      return `${p1}  Gaming: '#ff6b6b',\n${p2}`;
    }
  );
}

// Update the search placeholder
panelContent = panelContent.replace(
  /placeholder="Search \d+\+ extensions\.\.\."/,
  'placeholder="Search 550+ extensions..."'
);

// Write the updated content back
fs.writeFileSync(panelPath, panelContent, 'utf8');

console.log('ExtensionsPanel.tsx updated successfully!');
console.log('Total extensions: 559');
