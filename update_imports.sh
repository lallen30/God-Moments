#!/bin/bash

# Script to update all import references to the new file locations

# Update references to helper/axiosRequest.ts
find ./src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|from "../helper/axiosRequest"|from "../utils/axiosUtils"|g'
find ./src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|from "../../helper/axiosRequest"|from "../../utils/axiosUtils"|g'
find ./src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|from "../../../helper/axiosRequest"|from "../../../utils/axiosUtils"|g'
find ./src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|from "./axiosRequest"|from "../utils/axiosUtils"|g'

# Update references to helper/config.ts
find ./src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|from "../helper/config"|from "../config/apiConfig"|g'
find ./src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|from "../../helper/config"|from "../../config/apiConfig"|g'
find ./src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|from "../../../helper/config"|from "../../../config/apiConfig"|g'
find ./src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|from "./config"|from "../config/apiConfig"|g'

# Update references to helper/types.ts
find ./src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|from "../helper/types"|from "../config/types"|g'
find ./src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|from "../../helper/types"|from "../../config/types"|g'
find ./src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|from "../../../helper/types"|from "../../../config/types"|g'
find ./src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|from "./types"|from "../config/types"|g'

# Update references to helper/storageService.ts
find ./src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|from "../helper/storageService"|from "../services/storageService"|g'
find ./src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|from "../../helper/storageService"|from "../../services/storageService"|g'
find ./src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|from "../../../helper/storageService"|from "../../../services/storageService"|g'
find ./src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|from "./storageService"|from "../services/storageService"|g'

# Update references to helper/authService.ts
find ./src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|from "../helper/authService"|from "../services/authService"|g'
find ./src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|from "../../helper/authService"|from "../../services/authService"|g'
find ./src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|from "../../../helper/authService"|from "../../../services/authService"|g'
find ./src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|from "./authService"|from "../services/authService"|g'

# Update references to helper/userService.ts
find ./src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|from "../helper/userService"|from "../services/userService"|g'
find ./src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|from "../../helper/userService"|from "../../services/userService"|g'
find ./src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|from "../../../helper/userService"|from "../../../services/userService"|g'
find ./src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|from "./userService"|from "../services/userService"|g'

# Update references to helper/NavigationMonitorService.ts
find ./src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|from "../helper/NavigationMonitorService"|from "../services/NavigationMonitorService"|g'
find ./src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|from "../../helper/NavigationMonitorService"|from "../../services/NavigationMonitorService"|g'
find ./src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|from "../../../helper/NavigationMonitorService"|from "../../../services/NavigationMonitorService"|g'
find ./src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|from "./NavigationMonitorService"|from "../services/NavigationMonitorService"|g'

# Update references to helper/apiService.ts
find ./src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|from "../helper/apiService"|from "../services/apiService"|g'
find ./src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|from "../../helper/apiService"|from "../../services/apiService"|g'
find ./src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|from "../../../helper/apiService"|from "../../../services/apiService"|g'
find ./src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|from "./apiService"|from "../services/apiService"|g'

echo "Import references updated successfully!"
