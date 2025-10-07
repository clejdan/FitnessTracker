#!/bin/bash

# Install missing dependencies
echo "Installing missing dependencies..."
npm install @expo/vector-icons

# Start the Expo development server
echo "Starting Expo development server..."
npx expo start --clear
