const fs = require('fs');
const path = require('path');

// TypeScript template for style files
const tsTemplate = `import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';

type Styles = {
    [key: string]: ViewStyle | TextStyle | ImageStyle;
};

export const styles = StyleSheet.create<Styles>({
    // Style definitions will be inserted here
});
`;

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

function convertFileToTypeScript(filePath) {
    // Only process .js style files
    if (!filePath.endsWith('Styles.js')) return;
    
    const tsFilePath = filePath.replace('.js', '.ts');
    
    // Skip if .ts file already exists
    if (fs.existsSync(tsFilePath)) {
        console.log(`! Skipping ${filePath} - TypeScript version already exists`);
        return;
    }
    
    try {
        // Read the original file
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Extract the style definitions
        const styleMatch = content.match(/StyleSheet\.create\({([\s\S]*?)}\);/);
        if (!styleMatch) {
            console.log(`! Could not find style definitions in ${filePath}`);
            return;
        }
        
        // Create the new TypeScript content
        const newContent = tsTemplate.replace('    // Style definitions will be inserted here', styleMatch[1].trim());
        
        // Create backup of original file
        const backupDir = path.join(__dirname, '../style_backups');
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir);
        }
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(backupDir, `${path.basename(filePath, '.js')}_${timestamp}.js`);
        fs.copyFileSync(filePath, backupPath);
        
        // Write the new TypeScript file
        fs.writeFileSync(tsFilePath, newContent);
        console.log(`✓ Converted ${filePath} to TypeScript`);
        
        // Remove the original .js file
        fs.unlinkSync(filePath);
        console.log(`✓ Removed original ${filePath}`);
        
    } catch (error) {
        console.error(`! Error converting ${filePath}:`, error);
    }
}

// Start the conversion process
const screensDir = path.join(__dirname, '../src/screens');
walkDir(screensDir, convertFileToTypeScript);
