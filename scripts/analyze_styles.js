const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

const screensDir = path.join(__dirname, '../src/screens');
const styleFiles = new Map();

// Collect all style files
walkDir(screensDir, (filePath) => {
    if (path.basename(filePath).startsWith('Styles.')) {
        const dir = path.dirname(filePath);
        if (!styleFiles.has(dir)) {
            styleFiles.set(dir, []);
        }
        styleFiles.get(dir).push(path.basename(filePath));
    }
});

// Analyze and report
console.log('Style Files Analysis:\n');
styleFiles.forEach((files, dir) => {
    console.log(`Directory: ${path.relative(screensDir, dir)}`);
    console.log('Files:', files.join(', '));
    if (files.length > 1) {
        console.log('⚠️  Needs cleanup - multiple style files');
    }
    if (!files.some(f => f.endsWith('.ts') || f.endsWith('.tsx'))) {
        console.log('⚠️  Needs conversion to TypeScript');
    }
    console.log('---\n');
});
