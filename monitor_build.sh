#!/bin/bash

# Build monitoring script for NDT Exam Prep
clear
echo "🚀 NDT Exam Prep Build Monitor"
echo "================================"

while true; do
    # Clear previous output
    printf "\033[3;0H"
    
    # Current time
    echo "⏰ Current Time: $(date '+%I:%M:%S %p')"
    echo ""
    
    # Gradle status
    echo "📦 Gradle Daemons:"
    ./android/gradlew --status 2>/dev/null | grep -E "BUSY|IDLE" | head -5
    echo ""
    
    # Build processes
    GRADLE_COUNT=$(ps aux | grep gradle | grep -v grep | wc -l | tr -d ' ')
    echo "🔧 Active Gradle Processes: $GRADLE_COUNT"
    
    # Check for APK
    APK_EXISTS=$(find android -name "*.apk" 2>/dev/null | wc -l | tr -d ' ')
    if [ "$APK_EXISTS" -gt 0 ]; then
        echo "✅ APK Generated!"
        APK_PATH=$(find android -name "*.apk" 2>/dev/null | head -1)
        echo "📱 APK Location: $APK_PATH"
    else
        echo "⏳ APK: Building..."
    fi
    echo ""
    
    # Check build directories
    if [ -d "android/app/build/intermediates" ]; then
        INTERMEDIATE_COUNT=$(find android/app/build/intermediates -type f 2>/dev/null | wc -l | tr -d ' ')
        echo "📊 Intermediate Files: $INTERMEDIATE_COUNT"
    else
        echo "📊 Intermediate Files: 0"
    fi
    
    if [ -d "android/app/build/generated" ]; then
        GENERATED_COUNT=$(find android/app/build/generated -type f 2>/dev/null | wc -l | tr -d ' ')
        echo "🔨 Generated Files: $GENERATED_COUNT"
    else
        echo "🔨 Generated Files: 0"
    fi
    echo ""
    
    # Device status
    echo "📱 Device Status:"
    adb devices 2>/dev/null | grep -v "List" | grep device || echo "No device connected"
    echo ""
    
    # Metro bundler
    METRO_STATUS=$(curl -s http://localhost:8081/status 2>/dev/null | grep -o "packager-status:running" || echo "")
    if [ "$METRO_STATUS" = "packager-status:running" ]; then
        echo "🟢 Metro Bundler: Running"
    else
        echo "🔴 Metro Bundler: Not Running"
    fi
    echo ""
    
    # Check for installation
    INSTALL_CHECK=$(ps aux | grep "app:installDebug" | grep -v grep | wc -l | tr -d ' ')
    if [ "$INSTALL_CHECK" -gt 0 ]; then
        echo "📲 Status: Installing on device..."
    elif [ "$APK_EXISTS" -gt 0 ]; then
        echo "✅ Status: Build Complete!"
        echo ""
        echo "🎉 The app should now be installed on your device!"
        break
    else
        echo "🏗️ Status: Building..."
    fi
    
    echo ""
    echo "Press Ctrl+C to stop monitoring"
    
    sleep 3
done 