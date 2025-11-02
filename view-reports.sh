#!/bin/bash

# 🌐 Allure Report Viewer Script
# This script helps you view Allure reports from your Selenium framework

echo "🧪 Selenium Framework - Allure Report Viewer"
echo "=============================================="

# Navigate to framework directory
cd /home/sangle/Documents/sangle_selenium_framework/selenium-java-framework

# Check if reports exist
if [ -d "target/allure-results" ] && [ "$(ls -A target/allure-results)" ]; then
    echo "✅ Test results found!"
    
    # Generate fresh report
    echo "📊 Generating Allure report..."
    mvn allure:report -q
    
    if [ -d "target/site/allure-maven-plugin" ]; then
        echo "✅ Report generated successfully!"
        echo ""
        echo "🌐 Starting local server..."
        echo "📱 Report will be available at: http://localhost:9000"
        echo "🔄 Press Ctrl+C to stop the server"
        echo ""
        
        # Start server in the report directory
        cd target/site/allure-maven-plugin
        python3 -m http.server 9000
    else
        echo "❌ Failed to generate report"
        exit 1
    fi
else
    echo "⚠️ No test results found!"
    echo "💡 Run some tests first:"
    echo "   mvn test -Dtest=LoginTest -Dheadless=true -DbaseUrl=http://localhost:8080"
    exit 1
fi