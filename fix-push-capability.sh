#!/bin/bash

echo "🔧 Adding Push Notifications capability to Xcode project..."

PROJECT_FILE="/Users/lallen30/Documents/bluestoneapps/clients/MIIN-Ojibwe/MIIN-Ojibwe-react-app/ios/LAReactNative.xcodeproj/project.pbxproj"

# Backup the project file
cp "$PROJECT_FILE" "$PROJECT_FILE.backup.$(date +%s)"

# Add Push Notifications capability
python3 << 'EOF'
import sys
import re

project_file = "/Users/lallen30/Documents/bluestoneapps/clients/MIIN-Ojibwe/MIIN-Ojibwe-react-app/ios/LAReactNative.xcodeproj/project.pbxproj"

try:
    with open(project_file, 'r') as f:
        content = f.read()
    
    # Find the target section for LAReactNative
    # Look for the main target configuration
    target_pattern = r'(13B07F861A680F5B00A75B9A[^}]+?isa = PBXNativeTarget[^}]+?name = LAReactNative[^}]+?)'
    
    if 'SystemCapabilities' not in content and 'com.apple.Push' not in content:
        # Find where to add the SystemCapabilities
        # Look for attributes section in the target
        attributes_pattern = r'(attributes = \{[^}]*?\};)'
        
        if re.search(attributes_pattern, content):
            # Add SystemCapabilities after attributes
            replacement = r'\1\n\t\t\tSystemCapabilities = {\n\t\t\t\t"com.apple.Push" = {\n\t\t\t\t\tenabled = 1;\n\t\t\t\t};\n\t\t\t};'
            new_content = re.sub(attributes_pattern, replacement, content)
            
            with open(project_file, 'w') as f:
                f.write(new_content)
            
            print("✅ Successfully added Push Notifications capability to project")
        else:
            print("❌ Could not find attributes section to add SystemCapabilities")
    else:
        print("✅ Push Notifications capability already exists in project")

except Exception as e:
    print(f"❌ Error modifying project file: {e}")
    sys.exit(1)
EOF

echo "✅ Push Notifications capability setup complete"
