#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Validate the version number format (semantic versioning)
function isValidVersion(version) {
  const semverRegex =
    /^(\d+)\.(\d+)\.(\d+)(?:-([\da-z-]+(?:\.[\da-z-]+)*))?(?:\+([\da-z-]+(?:\.[\da-z-]+)*))?$/i;
  return semverRegex.test(version);
}

// Calculate the next version based on current version
function getNextVersion(version, type = 'patch') {
  const [major, minor, patch] = version.split('.').map(Number);

  switch (type.toLowerCase()) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
    default:
      return `${major}.${minor}.${patch + 1}`;
  }
}

// Get the new version from command line arguments
const newVersion = process.argv[2];
const updateType = process.argv[3] || 'patch';

// Validate the version
if (!newVersion) {
  console.error('❌ Error: Please provide a version number argument');
  console.error('Usage: npm run update-version <new-version> [update-type]');
  console.error('Example: npm run update-version 1.2.0 patch');
  process.exit(1);
}

if (!isValidVersion(newVersion)) {
  console.error(
    '❌ Error: Invalid version format. Please use semantic versioning (e.g., 1.2.3)'
  );
  process.exit(1);
}

// Keep track of results
const results = {
  packageJson: false,
  iosInfo: false,
  androidGradle: false,
  readme: false,
  versionHistory: false,
};

try {
  // Update package.json
  console.log(`📦 Updating package.json version to ${newVersion}`);
  const packageJsonPath = path.join(__dirname, 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    console.error('❌ Error: package.json not found');
    process.exit(1);
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const oldVersion = packageJson.version;
  packageJson.version = newVersion;
  fs.writeFileSync(
    packageJsonPath,
    JSON.stringify(packageJson, null, 2) + '\n'
  );
  results.packageJson = true;
  console.log(
    `✅ Updated package.json version from ${oldVersion} to ${newVersion}`
  );

  // Update iOS Info.plist if present
  const infoPlistPath = path.join(
    __dirname,
    'ios',
    'MIIN-Ojibwe',
    'Info.plist'
  );

  if (fs.existsSync(infoPlistPath)) {
    console.log('🍎 Updating iOS Info.plist version...');
    try {
      // For direct Info.plist modification
      let infoPlistContent = fs.readFileSync(infoPlistPath, 'utf8');
      const oldPlistVersion =
        infoPlistContent.match(
          /<key>CFBundleShortVersionString<\/key>\s*<string>(.*?)<\/string>/
        )?.[1] || 'unknown';
      const oldBuildNumber =
        infoPlistContent.match(
          /<key>CFBundleVersion<\/key>\s*<string>(.*?)<\/string>/
        )?.[1] || '1';

      // Update version string
      infoPlistContent = infoPlistContent.replace(
        /(<key>CFBundleShortVersionString<\/key>\s*<string>).*?(<\/string>)/g,
        `$1${newVersion}$2`
      );

      // Increment build number
      const newBuildNumber = parseInt(oldBuildNumber) + 1;
      infoPlistContent = infoPlistContent.replace(
        /(<key>CFBundleVersion<\/key>\s*<string>).*?(<\/string>)/g,
        `$1${newBuildNumber}$2`
      );

      fs.writeFileSync(infoPlistPath, infoPlistContent);
      console.log(
        `✅ Updated iOS version in Info.plist from ${oldPlistVersion} to ${newVersion}`
      );
      console.log(
        `✅ Updated iOS build number from ${oldBuildNumber} to ${newBuildNumber}`
      );
      results.iosInfo = true;

      // Update project.pbxproj file
      const projectPbxPath = path.join(
        __dirname,
        'ios',
        'MIIN-Ojibwe.xcodeproj',
        'project.pbxproj'
      );
      if (fs.existsSync(projectPbxPath)) {
        let projectContent = fs.readFileSync(projectPbxPath, 'utf8');

        // Update MARKETING_VERSION
        projectContent = projectContent.replace(
          /MARKETING_VERSION = .*;/g,
          `MARKETING_VERSION = ${newVersion};`
        );

        // Update CURRENT_PROJECT_VERSION
        projectContent = projectContent.replace(
          /CURRENT_PROJECT_VERSION = \d+;/g,
          `CURRENT_PROJECT_VERSION = ${newBuildNumber};`
        );

        fs.writeFileSync(projectPbxPath, projectContent);
        console.log(
          `✅ Updated iOS project settings with version ${newVersion} and build ${newBuildNumber}`
        );
      }

      // Using agvtool if available
      try {
        execSync(`cd ios && agvtool new-marketing-version ${newVersion}`);
        execSync(`cd ios && agvtool new-version -all ${newBuildNumber}`);
        console.log('✅ iOS version updated with agvtool');
      } catch (e) {
        console.log('ℹ️ agvtool not available, using manual update only');
      }
    } catch (error) {
      console.warn('⚠️ Could not update iOS version:', error.message);
    }
  } else {
    console.log('ℹ️ iOS Info.plist not found. Skipping iOS version update.');
  }

  // Update Android build.gradle
  const buildGradlePath = path.join(
    __dirname,
    'android',
    'app',
    'build.gradle'
  );

  if (fs.existsSync(buildGradlePath)) {
    console.log('🤖 Updating Android build.gradle version...');
    try {
      let buildGradleContent = fs.readFileSync(buildGradlePath, 'utf8');

      // Get old version
      const oldVersionName =
        buildGradleContent.match(/versionName\s+["'](.*)["']/)?.[1] ||
        'unknown';

      // Update versionName
      buildGradleContent = buildGradleContent.replace(
        /versionName\s+["'](.*)["']/,
        `versionName "${newVersion}"`
      );

      // Increase versionCode by 1
      const versionCodeMatch = buildGradleContent.match(/versionCode\s+(\d+)/);
      let newVersionCode = 1;

      if (versionCodeMatch) {
        const oldVersionCode = parseInt(versionCodeMatch[1]);
        newVersionCode = oldVersionCode + 1;
        buildGradleContent = buildGradleContent.replace(
          /versionCode\s+\d+/,
          `versionCode ${newVersionCode}`
        );
        console.log(
          `✅ Android versionCode increased from ${oldVersionCode} to ${newVersionCode}`
        );
      } else {
        console.warn('⚠️ Could not find versionCode in build.gradle');
      }

      fs.writeFileSync(buildGradlePath, buildGradleContent);
      console.log(
        `✅ Updated Android versionName from ${oldVersionName} to ${newVersion}`
      );
      results.androidGradle = true;
    } catch (error) {
      console.warn('⚠️ Could not update Android version:', error.message);
    }
  } else {
    console.log(
      'ℹ️ Android build.gradle not found. Skipping Android version update.'
    );
  }

  // Update the version in AppConst.VERSION
  const configPath = path.join(__dirname, 'src', 'helper', 'config.ts');
  if (fs.existsSync(configPath)) {
    console.log('🔄 Updating version in config.ts...');
    try {
      let configContent = fs.readFileSync(configPath, 'utf8');
      const oldConfigVersion =
        configContent.match(/VERSION:\s+['"](.*)['"],?/)?.[1] || 'unknown';

      configContent = configContent.replace(
        /VERSION:\s+['"](.*)['"],?/,
        `VERSION: '${newVersion}',`
      );

      fs.writeFileSync(configPath, configContent);
      console.log(
        `✅ Updated version in config.ts from ${oldConfigVersion} to ${newVersion}`
      );
    } catch (error) {
      console.warn('⚠️ Could not update version in config.ts:', error.message);
    }
  }

  // Update README.md
  const readmePath = path.join(__dirname, 'README.md');
  if (fs.existsSync(readmePath)) {
    console.log('📄 Updating version in README.md...');
    try {
      let readmeContent = fs.readFileSync(readmePath, 'utf8');
      const oldReadmeVersion =
        readmeContent.match(/version\s+(\d+\.\d+\.\d+)/)?.[1] || 'unknown';

      readmeContent = readmeContent.replace(
        /version\s+(\d+\.\d+\.\d+)/g,
        `version ${newVersion}`
      );

      fs.writeFileSync(readmePath, readmeContent);
      console.log(
        `✅ Updated version in README.md from ${oldReadmeVersion} to ${newVersion}`
      );
      results.readme = true;
    } catch (error) {
      console.warn('⚠️ Could not update version in README.md:', error.message);
    }
  } else {
    console.log('ℹ️ README.md not found. Skipping README update.');
  }

  // Update version history
  const versionHistoryPath = path.join(__dirname, 'VERSION_HISTORY.md');
  if (fs.existsSync(versionHistoryPath)) {
    console.log('📄 Updating version history...');
    try {
      let versionHistoryContent = fs.readFileSync(versionHistoryPath, 'utf8');

      const newVersionHistoryEntry = `## ${newVersion}\n\n* Update type: ${updateType}\n\n`;
      versionHistoryContent = newVersionHistoryEntry + versionHistoryContent;

      fs.writeFileSync(versionHistoryPath, versionHistoryContent);
      console.log(`✅ Updated version history with ${newVersion}`);
      results.versionHistory = true;
    } catch (error) {
      console.warn('⚠️ Could not update version history:', error.message);
    }
  } else {
    console.log(
      'ℹ️ VERSION_HISTORY.md not found. Skipping version history update.'
    );
  }

  // Summary of results
  console.log('\n📋 Version Update Summary:');
  console.log(
    `📦 Package.json: ${results.packageJson ? '✅ Updated' : '❌ Failed'}`
  );
  console.log(
    `🍎 iOS Info.plist: ${
      results.iosInfo
        ? '✅ Updated'
        : fs.existsSync(infoPlistPath)
        ? '❌ Failed'
        : '⚠️ Not Found'
    }`
  );
  console.log(
    `🤖 Android build.gradle: ${
      results.androidGradle
        ? '✅ Updated'
        : fs.existsSync(buildGradlePath)
        ? '❌ Failed'
        : '⚠️ Not Found'
    }`
  );
  console.log(
    `📄 README.md: ${
      results.readme
        ? '✅ Updated'
        : fs.existsSync(readmePath)
        ? '❌ Failed'
        : '⚠️ Not Found'
    }`
  );
  console.log(
    `📄 VERSION_HISTORY.md: ${
      results.versionHistory
        ? '✅ Updated'
        : fs.existsSync(versionHistoryPath)
        ? '❌ Failed'
        : '⚠️ Not Found'
    }`
  );
  console.log(`\n✨ Version successfully updated to ${newVersion}`);
} catch (error) {
  console.error('❌ An error occurred during version update:', error);
  process.exit(1);
}
