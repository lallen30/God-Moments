const fs = require('fs');
const path = require('path');

// Files to remove (keeping their TypeScript counterparts)
const filesToRemove = [
    '../src/screens/PostLogin/AboutUs/Styles.js',
    '../src/screens/PostLogin/Calendar/Styles.js',
    '../src/screens/PostLogin/Calendar/Styles.tsx',
    '../src/screens/PreLogin/Login/Styles.js'
];

// Create backup directory
const backupDir = path.join(__dirname, '../style_backups');
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
}

// Backup and remove files
filesToRemove.forEach(file => {
    const fullPath = path.join(__dirname, file);
    const backupPath = path.join(backupDir, path.basename(file));
    
    if (fs.existsSync(fullPath)) {
        // Create backup with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFileName = `${path.parse(file).name}_${timestamp}${path.parse(file).ext}`;
        const finalBackupPath = path.join(backupDir, backupFileName);
        
        // Copy file to backup
        fs.copyFileSync(fullPath, finalBackupPath);
        console.log(`✓ Backed up ${file} to ${finalBackupPath}`);
        
        // Remove original file
        fs.unlinkSync(fullPath);
        console.log(`✓ Removed ${file}`);
    } else {
        console.log(`! File not found: ${file}`);
    }
});
