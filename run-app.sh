#!/bin/bash

# Kill existing processes
echo "Killing existing processes..."
pkill -f "node.*metro" || true
killall node 2>/dev/null || true
killall "Simulator" 2>/dev/null || true

# Start the simulator
echo "Starting simulator..."
open -a Simulator

# Wait for simulator to start
echo "Waiting for simulator to start..."
sleep 5

# Start Metro bundler in a new terminal
echo "Starting Metro bundler..."
osascript -e 'tell application "Terminal" to do script "cd \"'$PWD'\" && npx react-native start --reset-cache"' &

# Wait for Metro bundler to start
echo "Waiting for Metro bundler to start..."
sleep 5

# Run the app
echo "Running the app..."
npx react-native run-ios --simulator="iPhone 16 Pro"

echo "Done!"
