# **LAReactNative version 1.0.1**

A React Native mobile application with key features like calendar event management, posts, navigation, and more.

---

## **Prerequisites**

Before running the project, ensure you have the following installed:

- **Node.js** (v18 or higher recommended)
- **React Native CLI**  
  Install it globally (if not already installed):
  ```bash
  npm install -g react-native-cli
  ```
- **Xcode** (for iOS development)  
  Install from the [Mac App Store](https://apps.apple.com/us/app/xcode/id497799835).
- **Android Studio** (for Android development)  
  Install from the [Android Developers site](https://developer.android.com/studio).
- **Watchman** (to monitor file changes)  
  Install it using Homebrew:
  ```bash
  brew install watchman
  ```

---

## **Environment Setup**

To prevent file descriptor limit issues during development, set the limit using:

```bash
ulimit -n 1048575
```

For a detailed guide, follow the official [React Native - Environment Setup](https://reactnative.dev/docs/environment-setup).

---

## **Installation**

1. **Clone the repository**:

   ```bash
   git clone https://git.bluestoneapps.com/larry-bluestoneapps/reactnativetemplate.git
   cd reactnativetemplate
   ```

2. **Install dependencies**:

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Install iOS pods** (iOS only):
   ```bash
   cd ios
   pod install
   cd ..
   ```

---

## **Project Structure**

```
/src
 ├── /assets            # Static assets (images, fonts, etc.)
 ├── /components        # Reusable components
 ├── /config            # Configuration files
 ├── /helper            # Helper functions and utilities
 ├── /navigation        # Navigation configuration
 ├── /screens           # App screens
 └── /theme             # Theme and styling
```

---

## **Key Features**

- Calendar with event management
- Post creation and viewing
- Navigation drawer
- Async storage for offline data persistence
- API integration using `axios`

---

## **Dependencies**

Here are some key dependencies used in the project:

| **Package**                                 | **Purpose**                   |
| ------------------------------------------- | ----------------------------- |
| `react-native-calendars`                    | Calendar and event management |
| `@react-navigation/drawer`                  | Navigation drawer             |
| `@react-native-async-storage/async-storage` | Persistent offline storage    |
| `axios`                                     | API requests                  |
| `react-native-vector-icons`                 | Icons and UI components       |

For the complete list, check `package.json`.

---

## **Getting Started**

> **Note:** Complete the [React Native Environment Setup](https://reactnative.dev/docs/environment-setup) before proceeding.

### **Step 1: Start the Metro Server**

Metro Bundler is the development server for React Native. Run it using:

```bash
npm start
# or
yarn start
```

---

### **Step 2: Run the Application**

Open a **new terminal** and run the app on your preferred platform:

#### **For Android:**

```bash
npm run android
# or
yarn android
```

#### **For iOS:**

```bash
npm run ios
# or
yarn ios
```

> **Tip:** Alternatively, you can run the app directly from **Android Studio** (for Android) or **Xcode** (for iOS). To do this, open the project’s `.xcworkspace` file from the `ios` directory.

---

## **Modifying the App**

1. Open `App.tsx` in your code editor and make any changes.
2. To **reload the app**:
   - **Android:** Press <kbd>R</kbd> twice or use the **Developer Menu** (access via <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> on macOS or <kbd>Ctrl</kbd> + <kbd>M</kbd> on Windows/Linux).
   - **iOS:** Hit <kbd>Cmd ⌘</kbd> + <kbd>R</kbd> in the simulator.

---

## **Building for Android**

1. Create the assets directory (if it doesn’t already exist):

   ```bash
   mkdir -p android/app/src/main/assets
   ```

2. Generate the bundle:

   ```bash
   npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res
   ```

3. Clean and build the project:

   ```bash
   cd android
   ./gradlew clean
   ./gradlew assembleRelease
   cd ..
   ```

4. The release APK will be available at:
   ```
   open android/app/build/outputs/apk/release
   android/app/build/outputs/apk/release/app-release.apk
   ```

---

## **Troubleshooting**

### **Common Issues and Fixes:**

1. **Metro Bundler Cache Issues**
   If you encounter caching issues, try clearing the Metro cache:

   ```bash
   watchman watch-del-all
   rm -rf /tmp/metro-*
   npm start -- --reset-cache
   ```

2. **iOS Build Issues**  
   Make sure to run:
   ```bash
   cd ios
   pod install
   ```

For more troubleshooting, check the [React Native Troubleshooting Guide](https://reactnative.dev/docs/troubleshooting).

---

## **Thorough Cleanup Steps**

If you need to fully clean your environment:

```bash
# 1. Delete node modules and lock files
rm -rf node_modules package-lock.json yarn.lock

# 2. Delete iOS pods
cd ios
rm -rf Pods Podfile.lock
cd ..

# 3. Clear Metro cache
rm -rf "/tmp/metro-*"

# 4. Clear Watchman cache
watchman watch-del-all

# 5. Reinstall npm dependencies
npm install

# 6. Reinstall iOS pods
cd ios
pod install
cd ..

# 7. Clear Metro cache during startup
npm start -- --reset-cache

# 8. Clean Android (if using Android)
cd android
./gradlew clean
cd ..

# 9. Run the app
npx react-native run-ios    # Or manually open .xcworkspace in Xcode
npx react-native run-android
```

---

## **Learn More**

- [React Native Documentation](https://reactnative.dev)
- [Environment Setup Guide](https://reactnative.dev/docs/environment-setup)
- [Integration with Existing Apps](https://reactnative.dev/docs/integration-with-existing-apps)
- [React Native Blog](https://reactnative.dev/blog)

---

## **License**

This project is licensed under the [MIT License](LICENSE).

---

## **Contributing**

We welcome contributions! Feel free to submit issues or pull requests.

---

## **Recent Improvements**

The app has undergone significant improvements to enhance stability and error handling:

### **Blank Screen Issue Resolution**

We've resolved issues that were causing blank screens when launching the app by:
- Implementing comprehensive error handling throughout the application
- Adding fallback UI components when errors occur
- Improving component lifecycle management
- Enhancing API call error handling

### **Robust Implementation**

Key components have been improved for better stability:
- **App.tsx**: Enhanced with proper error boundaries and splash screen handling
- **NavigationWrapper.tsx**: Improved with better error handling for navigation
- **useAppUpdate.ts**: Optimized with proper error handling and memoization
- **UpdateService.ts**: Enhanced with robust error handling for API calls

### **Debugging Tools**

Several debugging tools are available to help identify and resolve issues:
- **debug-app.sh**: Checks for common issues and provides debugging tips
- **clean-and-restart.sh**: Cleans and restarts the app with a fresh state

For more details, see the `APP_MAINTENANCE_CHECKLIST.md` file, which provides guidance on maintaining the app.

---

## **Version Management**

This app implements a robust version management system that automatically checks for updates and notifies users when new versions are available. For more information about the version update feature, see the documentation in the `APPLICATION_DETAILS.md` file.
