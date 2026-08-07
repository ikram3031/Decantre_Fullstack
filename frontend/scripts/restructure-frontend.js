import fs from 'fs';
import path from 'path';

// Dynamically resolve frontend directory path
const frontendDir = process.cwd();
const srcDir = path.join(frontendDir, 'src');
const coreDir = path.join(srcDir, 'core');

// Helper to recursively copy directories
function copySync(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src);
    for (let entry of entries) {
      copySync(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

// Helper to recursively delete directories
function deleteSync(src) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    const entries = fs.readdirSync(src);
    for (let entry of entries) {
      deleteSync(path.join(src, entry));
    }
    fs.rmdirSync(src);
  } else {
    fs.unlinkSync(src);
  }
}

// 1. Create target core directory structures
const coreSubDirs = ['store', 'lib', 'context', 'utils'];
coreSubDirs.forEach(sub => {
  const target = path.join(coreDir, sub);
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }
});

// 2. Move files from store, lib, context into core/
const entireFoldersToMove = ['store', 'lib', 'context'];
entireFoldersToMove.forEach(folder => {
  const oldPath = path.join(srcDir, folder);
  const newPath = path.join(coreDir, folder);
  if (fs.existsSync(oldPath) && oldPath !== newPath) {
    console.log(`Moving src/${folder} to src/core/${folder}...`);
    copySync(oldPath, newPath);
    deleteSync(oldPath);
  }
});

// 3. Move purely functional utils (formatCurrency, utilityFunctions) to core/utils
const utilsToMove = ['formatCurrency.js', 'utilityFunctions.js'];
utilsToMove.forEach(file => {
  const oldPath = path.join(srcDir, 'utils', file);
  const newPath = path.join(coreDir, 'utils', file);
  if (fs.existsSync(oldPath)) {
    console.log(`Moving src/utils/${file} to src/core/utils/${file}...`);
    fs.copyFileSync(oldPath, newPath);
    fs.unlinkSync(oldPath);
  }
});

// 4. Update imports inside files
function updateImportsInFile(filePath, isInsideCore) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  if (isInsideCore) {
    // Files inside core are now 1 level deeper under core/
    // Any relative imports referencing "../utils/config" or "../utils/theme" need to go 1 level higher to "../../utils/config"
    content = content.replace(/(from\s+['"])\.\.\/utils\/(config|theme)(['"])/g, '$1../../utils/$2$3');
  } else {
    // Files outside core need to resolve relocated folders to core/
    // Match "from '../store/..." and change to "from '../core/store/..."
    // Match "from '../../lib/..." and change to "from '../../core/lib/..."
    // Make sure config and theme imports in utils are EXCLUDED (they stay in src/utils/)
    content = content.replace(/(from\s+['"])((\.\.\/)+)(store|lib|context)\/([^'"]+['"])/g, '$1$2core/$4/$5');
    
    // For utils imports, rewrite only those that moved (formatCurrency, utilityFunctions)
    // and preserve config/theme pointing to src/utils/
    content = content.replace(/(from\s+['"])((\.\.\/)+)utils\/(formatCurrency|utilityFunctions)([^'"]+['"])/g, '$1$2core/utils/$4$5');
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

function processFilesRecursively(dirPath, isInsideCore) {
  if (!fs.existsSync(dirPath)) return;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (let entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      // If we enter the core directory, mark isInsideCore as true
      const nextIsInsideCore = isInsideCore || entry.name === 'core';
      processFilesRecursively(fullPath, nextIsInsideCore);
    } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.jsx'))) {
      updateImportsInFile(fullPath, isInsideCore);
    }
  }
}

// Process the whole src directory
processFilesRecursively(srcDir, false);

console.log('Frontend core code isolation completed successfully!');
