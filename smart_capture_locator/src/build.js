// Build Script for Smart Locator Inspector
// Combines all modular files into a single injector.js for browser execution

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname);
const modulesDir = path.join(srcDir, 'modules');
const templateFile = path.join(srcDir, 'injector-modular-template.js');
const outputFile = path.join(srcDir, '../injector-modular.js');

console.log('📦 Building modular Smart Locator Inspector...');

// Read template file
let templateContent = fs.readFileSync(templateFile, 'utf8');

// Read all module files
const modules = [
    'config.js',
    'utils.js', 
    'styles.js',
    'hierarchy.js',
    'locators.js',
    'ui.js',
    'events.js'
];

const mainFile = path.join(srcDir, 'main.js');

// Start building the final content
let finalContent = templateContent;

// Process each module
modules.forEach(moduleFile => {
    const modulePath = path.join(modulesDir, moduleFile);
    let moduleContent = fs.readFileSync(modulePath, 'utf8');
    
    // Remove ES6 import/export statements
    moduleContent = moduleContent
        .replace(/import\s+{[^}]*}\s+from\s+['"][^'"]*['"];?\s*/g, '')
        .replace(/import\s+\w+\s+from\s+['"][^'"]*['"];?\s*/g, '')
        .replace(/export\s+class\s+/g, 'class ')
        .replace(/export\s+\{[^}]*\};?\s*/g, '')
        .replace(/export\s+default\s+/g, '')
        .replace(/export\s+/g, '');

    // Replace the placeholder for this module
    const placeholder = `    // MODULE_PLACEHOLDER: ${moduleFile}`;
    const moduleSection = `    // === ${moduleFile.toUpperCase()} ===\n${moduleContent}\n`;
    
    finalContent = finalContent.replace(placeholder, moduleSection);
});

// Add main module
let mainContent = fs.readFileSync(mainFile, 'utf8');
mainContent = mainContent
    .replace(/import\s+{[^}]*}\s+from\s+['"][^'"]*['"];?\s*/g, '')
    .replace(/export\s+class\s+/g, 'class ')
    .replace(/export\s+/g, '');

// Replace main module placeholder
const mainPlaceholder = `    // MODULE_PLACEHOLDER: main.js`;
const mainSection = `    // === MAIN.JS ===\n${mainContent}\n`;
finalContent = finalContent.replace(mainPlaceholder, mainSection);

// Write the combined file
fs.writeFileSync(outputFile, finalContent);

console.log('✅ Successfully built:', outputFile);
console.log('📏 Total size:', Math.round(fs.statSync(outputFile).size / 1024), 'KB');

// Compare with legacy backup if it exists
const legacyPath = path.join(srcDir, '../injector-legacy-backup.js');
if (fs.existsSync(legacyPath)) {
    console.log('🔧 Legacy injector size:', Math.round(fs.statSync(legacyPath).size / 1024), 'KB');
}

// Verify the file can be parsed
try {
    new Function(finalContent);
    console.log('✅ Generated code syntax is valid');
} catch (error) {
    console.error('❌ Generated code has syntax errors:', error.message);
    console.error('Error location:', error.stack);
}