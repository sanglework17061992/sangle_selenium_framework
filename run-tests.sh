#!/bin/bash

# 🚀 Local CI/CD Script for Selenium Test Framework
# This script mimics the CI/CD pipeline for local development and testing

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
TEST_APP_PORT=8080
TEST_APP_PID_FILE="test-app/server.pid"
SELENIUM_DIR="selenium-java-framework"
TEST_APP_DIR="test-app"

# Functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

cleanup() {
    log_info "🧹 Cleaning up..."
    
    # Stop test application
    if [ -f "$TEST_APP_PID_FILE" ]; then
        TEST_APP_PID=$(cat "$TEST_APP_PID_FILE")
        if kill -0 "$TEST_APP_PID" 2>/dev/null; then
            log_info "Stopping test application (PID: $TEST_APP_PID)"
            kill "$TEST_APP_PID"
            rm -f "$TEST_APP_PID_FILE"
        fi
    fi
    
    # Kill any remaining Node.js processes on port 8080
    pkill -f "node.*server.js" || true
    
    log_success "Cleanup completed"
}

# Trap cleanup on script exit
trap cleanup EXIT

start_test_app() {
    log_info "🚀 Starting test application..."
    
    cd "$TEST_APP_DIR"
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    # Check if port 8080 is available
    if lsof -Pi :$TEST_APP_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
        log_warning "Port $TEST_APP_PORT is already in use. Trying to stop existing process..."
        pkill -f "node.*server.js" || true
        sleep 2
    fi
    
    # Start the Node.js server
    nohup node server.js > server.log 2>&1 &
    echo $! > server.pid
    
    # Wait for server to start
    log_info "⏳ Waiting for test application to start..."
    for i in {1..30}; do
        if curl -f http://localhost:$TEST_APP_PORT/ > /dev/null 2>&1; then
            log_success "Test application is running on port $TEST_APP_PORT"
            cd ..
            return 0
        fi
        echo -n "."
        sleep 1
    done
    
    log_error "Test application failed to start within 30 seconds"
    cat server.log
    cd ..
    exit 1
}

verify_test_app() {
    log_info "🔍 Verifying test application endpoints..."
    
    local endpoints=("/" "/login.html" "/products.html" "/contact.html")
    
    for endpoint in "${endpoints[@]}"; do
        if curl -f "http://localhost:$TEST_APP_PORT$endpoint" > /dev/null 2>&1; then
            log_success "Endpoint $endpoint is accessible"
        else
            log_error "Endpoint $endpoint is not accessible"
            return 1
        fi
    done
}

build_selenium_framework() {
    log_info "🏗️  Building Selenium framework..."
    
    cd "$SELENIUM_DIR"
    
    # Check if Maven is installed
    if ! command -v mvn &> /dev/null; then
        log_error "Maven is not installed. Please install Maven first."
        exit 1
    fi
    
    # Clean and compile
    mvn clean compile -q
    
    if [ $? -eq 0 ]; then
        log_success "Selenium framework compiled successfully"
    else
        log_error "Failed to compile Selenium framework"
        cd ..
        exit 1
    fi
    
    cd ..
}

run_smoke_tests() {
    log_info "🧪 Running smoke tests..."
    
    cd "$SELENIUM_DIR"
    
    mvn test -Dtest=LoginTest#testValidLogin,ProductTest#testProductDisplay \
             -Dbrowser=chrome \
             -Dheadless=true \
             -DbaseUrl=http://localhost:$TEST_APP_PORT \
             -Dmaven.test.failure.ignore=true
    
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        log_success "Smoke tests passed"
    else
        log_warning "Some smoke tests failed (exit code: $exit_code)"
    fi
    
    cd ..
    return $exit_code
}

run_full_tests() {
    log_info "🧪 Running full test suite..."
    
    cd "$SELENIUM_DIR"
    
    mvn test -Dbrowser=chrome \
             -Dheadless=true \
             -DbaseUrl=http://localhost:$TEST_APP_PORT \
             -Dparallel=methods \
             -DthreadCount=2 \
             -Dmaven.test.failure.ignore=true
    
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        log_success "All tests passed"
    else
        log_warning "Some tests failed (exit code: $exit_code)"
    fi
    
    cd ..
    return $exit_code
}

generate_reports() {
    log_info "📊 Generating test reports..."
    
    cd "$SELENIUM_DIR"
    
    # Check if Allure is available
    if [ -d "../allure-2.24.0" ]; then
        log_info "Using existing Allure installation"
        ../allure-2.24.0/bin/allure generate target/allure-results --clean -o target/allure-report
    else
        log_warning "Allure not found. Downloading..."
        curl -L -o allure.tgz https://github.com/allure-framework/allure2/releases/download/2.24.0/allure-2.24.0.tgz
        tar -xzf allure.tgz -C ..
        rm allure.tgz
        ../allure-2.24.0/bin/allure generate target/allure-results --clean -o target/allure-report
    fi
    
    log_success "Test reports generated in target/allure-report/"
    log_info "🌐 To view reports, run: ../allure-2.24.0/bin/allure serve target/allure-results"
    
    cd ..
}

show_usage() {
    echo "🚀 Selenium Test Framework CI/CD Script"
    echo ""
    echo "Usage: $0 [OPTIONS] [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  smoke        Run smoke tests only"
    echo "  full         Run full test suite"
    echo "  build        Build and compile only"
    echo "  start-app    Start test application only"
    echo "  stop-app     Stop test application only"
    echo "  reports      Generate reports only"
    echo ""
    echo "Options:"
    echo "  -h, --help   Show this help message"
    echo "  -v, --verbose Enable verbose output"
    echo ""
    echo "Examples:"
    echo "  $0 smoke                    # Run smoke tests"
    echo "  $0 full                     # Run full test suite"
    echo "  $0 start-app               # Start test app only"
    echo "  $0 build                   # Build framework only"
}

# Main execution
main() {
    local command=${1:-smoke}
    
    case "$command" in
        -h|--help)
            show_usage
            exit 0
            ;;
        start-app)
            start_test_app
            verify_test_app
            log_success "Test application is ready at http://localhost:$TEST_APP_PORT"
            log_info "Press Ctrl+C to stop"
            read -r
            ;;
        stop-app)
            cleanup
            ;;
        build)
            build_selenium_framework
            ;;
        smoke)
            log_info "🚀 Starting CI/CD Pipeline - Smoke Tests"
            start_test_app
            verify_test_app
            build_selenium_framework
            run_smoke_tests
            generate_reports
            log_success "🎉 Smoke test pipeline completed!"
            ;;
        full)
            log_info "🚀 Starting CI/CD Pipeline - Full Tests"
            start_test_app
            verify_test_app
            build_selenium_framework
            run_full_tests
            generate_reports
            log_success "🎉 Full test pipeline completed!"
            ;;
        reports)
            generate_reports
            ;;
        *)
            log_error "Unknown command: $command"
            show_usage
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"