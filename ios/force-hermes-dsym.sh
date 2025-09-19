#!/bin/bash

# Force Hermes dSYM generation by modifying the build process
# This script ensures Hermes framework is built with debug symbols

set -e

echo "🔧 Force Hermes dSYM generation..."

# Step 1: Clean everything
echo "🧹 Cleaning all build artifacts..."
cd ios
rm -rf build
rm -rf Pods
rm -f Podfile.lock

# Step 2: Create a modified Podfile that forces Hermes debug symbols
echo "📝 Creating modified Podfile..."
cat > Podfile.modified << 'EOF'
# Resolve react_native_pods.rb with node to allow for hoisting
require Pod::Executable.execute_command('node', ['-p',
  'require.resolve(
    "react-native/scripts/react_native_pods.rb",
    {paths: [process.argv[1]]},
  )', __dir__]).strip

platform :ios, min_ios_version_supported
prepare_react_native_project!

# Force Hermes to be built with debug symbols
ENV['HERMES_ENGINE_TARBALL_PATH'] = nil
ENV['HERMES_ENGINE_TARBALL_URL'] = nil

# Enable modular headers for Swift dependencies
pod 'FirebaseCoreInternal', :modular_headers => true
pod 'GoogleUtilities', :modular_headers => true

target 'LAReactNative' do
  config = use_native_modules!

  use_react_native!(
    :path => config[:reactNativePath],
    # An absolute path to your application root.
    :app_path => "#{Pod::Config.instance.installation_root}/.."
  )

  pod 'RNVectorIcons', :path => '../node_modules/react-native-vector-icons'
  pod 'RNFBApp', :path => '../node_modules/@react-native-firebase/app'

  target 'LAReactNativeTests' do
    inherit! :complete
    # Pods for testing
  end

  post_install do |installer|
    # https://github.com/facebook/react-native/blob/main/packages/react-native/scripts/react_native_pods.rb#L197-L202
    react_native_post_install(
      installer,
      config[:reactNativePath],
      :mac_catalyst_enabled => false
    )
    
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        # Force debug symbols for ALL targets
        config.build_settings['DEBUG_INFORMATION_FORMAT'] = 'dwarf-with-dsym'
        config.build_settings['COPY_PHASE_STRIP'] = 'NO'
        config.build_settings['STRIP_INSTALLED_PRODUCT'] = 'NO'
        config.build_settings['STRIP_SWIFT_SYMBOLS'] = 'NO'
        config.build_settings['GCC_GENERATE_DEBUGGING_SYMBOLS'] = 'YES'
        config.build_settings['DEBUGGING_SYMBOLS'] = 'YES'
        config.build_settings['ONLY_ACTIVE_ARCH'] = 'NO'
        
        config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '13.4'
        config.build_settings['ENABLE_BITCODE'] = 'NO'
        config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] ||= ['$(inherited)']
        config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] << 'FOLLY_NO_CONFIG=1'
        config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] << 'FOLLY_MOBILE=1'
        config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] << 'FOLLY_USE_LIBCPP=1'
        
        # Fix for non-modular-include-in-framework-module errors
        if target.name == 'glog' || target.name == 'fmt' || target.name == 'Yoga'
          config.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'
        end
        
        # Special handling for Hermes engine
        if target.name == 'hermes-engine'
          config.build_settings['DEBUG_INFORMATION_FORMAT'] = 'dwarf-with-dsym'
          config.build_settings['STRIP_STYLE'] = 'debugging'
          config.build_settings['COPY_PHASE_STRIP'] = 'NO'
          config.build_settings['STRIP_INSTALLED_PRODUCT'] = 'NO'
          config.build_settings['STRIP_SWIFT_SYMBOLS'] = 'NO'
          config.build_settings['GENERATE_INFOPLIST_FILE'] = 'YES'
          config.build_settings['GCC_GENERATE_DEBUGGING_SYMBOLS'] = 'YES'
          config.build_settings['DEBUGGING_SYMBOLS'] = 'YES'
          config.build_settings['ONLY_ACTIVE_ARCH'] = 'NO'
          config.build_settings['GCC_OPTIMIZATION_LEVEL'] = '0'  # Disable optimization for debug symbols
        end
      end
    end
    
    # Add script phase to ensure dSYM files are properly generated for Hermes
    installer.pods_project.targets.each do |target|
      if target.name == 'hermes-engine'
        # Add a script phase to ensure dSYM generation
        script_phase = target.new_shell_script_build_phase('Force Hermes dSYM Generation')
        script_phase.shell_script = <<~SCRIPT
          # Force dSYM generation for Hermes framework
          echo "🔧 Force generating dSYM for Hermes framework..."
          
          # Find the Hermes framework
          HERMES_FRAMEWORK="${BUILT_PRODUCTS_DIR}/hermes.framework"
          HERMES_DSYM="${BUILT_PRODUCTS_DIR}/hermes.framework.dSYM"
          
          if [ -d "$HERMES_FRAMEWORK" ]; then
            echo "✅ Found Hermes framework at: $HERMES_FRAMEWORK"
            
            # Remove existing dSYM if it exists
            if [ -d "$HERMES_DSYM" ]; then
              echo "🗑️ Removing existing dSYM..."
              rm -rf "$HERMES_DSYM"
            fi
            
            # Generate dSYM from the framework
            echo "📋 Generating dSYM from Hermes framework..."
            dsymutil "$HERMES_FRAMEWORK/hermes" -o "$HERMES_DSYM"
            
            if [ -d "$HERMES_DSYM" ]; then
              echo "✅ Hermes dSYM generated successfully at: $HERMES_DSYM"
              
              # Verify UUIDs match
              FRAMEWORK_UUID=$(dwarfdump --uuid "$HERMES_FRAMEWORK/hermes" 2>/dev/null | grep -o '[0-9A-F]\{8\}-[0-9A-F]\{4\}-[0-9A-F]\{4\}-[0-9A-F]\{4\}-[0-9A-F]\{12\}' | head -1)
              DSYM_UUID=$(dwarfdump --uuid "$HERMES_DSYM" 2>/dev/null | grep -o '[0-9A-F]\{8\}-[0-9A-F]\{4\}-[0-9A-F]\{4\}-[0-9A-F]\{4\}-[0-9A-F]\{12\}' | head -1)
              
              echo "🔍 Framework UUID: $FRAMEWORK_UUID"
              echo "🔍 dSYM UUID: $DSYM_UUID"
              
              if [ "$FRAMEWORK_UUID" = "$DSYM_UUID" ]; then
                echo "✅ UUIDs match - dSYM is valid"
              else
                echo "❌ UUIDs don't match - regenerating..."
                rm -rf "$HERMES_DSYM"
                dsymutil "$HERMES_FRAMEWORK/hermes" -o "$HERMES_DSYM"
              fi
            else
              echo "❌ Failed to generate Hermes dSYM"
              exit 1
            fi
          else
            echo "⚠️ Hermes framework not found at $HERMES_FRAMEWORK"
          fi
        SCRIPT
        script_phase.input_paths = ['$(BUILT_PRODUCTS_DIR)/hermes.framework/hermes']
        script_phase.output_paths = ['$(BUILT_PRODUCTS_DIR)/hermes.framework.dSYM']
      end
    end
  end
end
EOF

# Step 3: Replace the original Podfile with the modified version
echo "📝 Replacing Podfile with modified version..."
cp Podfile.modified Podfile

# Step 4: Install pods with the modified configuration
echo "📦 Installing pods with forced dSYM configuration..."
pod install

cd ..

echo "✅ Force Hermes dSYM fix applied!"
echo ""
echo "📋 Next steps:"
echo "1. Open Xcode workspace: open ios/LAReactNative.xcworkspace"
echo "2. Select 'Any iOS Device (arm64)' as target"
echo "3. Go to Product → Archive"
echo "4. The archive should now include proper Hermes dSYM files"
echo ""
echo "🔧 Key changes made:"
echo "   - Forced Hermes to be built with debug symbols"
echo "   - Added build script phase to ensure dSYM generation"
echo "   - Disabled optimization for Hermes to preserve debug info"
echo "   - Added comprehensive dSYM settings for all targets"
echo ""
echo "🎯 This should definitively resolve the Hermes dSYM issue!" 