#!/usr/bin/env node

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class SmartLocatorInspector {
    constructor() {
        this.browser = null;
        this.page = null;
        this.injectorScript = null;
    }

    async loadInjectorScript() {
        // Always use the modular version (enhanced with all improvements)
        const injectorPath = path.join(__dirname, 'injector-modular.js');
        
        console.log(`📄 Loading enhanced modular injector: ${path.basename(injectorPath)}`);
        this.injectorScript = fs.readFileSync(injectorPath, 'utf8');
    }

    async launch(url = 'https://example.com') {
        try {
            console.log('🚀 Starting Smart Locator Inspector...');
            
            // Load the injector script
            await this.loadInjectorScript();
            
            // Launch browser with debugging enabled
            this.browser = await puppeteer.launch({
                headless: false,
                devtools: false,
                args: [
                    '--remote-debugging-port=9222',
                    '--disable-web-security',
                    '--disable-features=VizDisplayCompositor',
                    '--start-maximized'
                ]
            });

            console.log('🌐 Opening browser...');
            this.page = await this.browser.newPage();
            
            // Set viewport to full screen
            await this.page.setViewport({ width: 1920, height: 1080 });
            
            // Navigate to the target URL
            console.log(`📍 Navigating to: ${url}`);
            await this.page.goto(url, { waitUntil: 'networkidle2' });
            
            // Wait a moment for page to fully load
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Inject the inspector script
            console.log('💉 Injecting Smart Locator Inspector...');
            
            try {
                // First try direct evaluation
                await this.page.evaluate(this.injectorScript);
                
                // Wait a moment for script to initialize
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Verify injection worked
                const isInjected = await this.page.evaluate(() => {
                    return typeof window.SLI !== 'undefined';
                });
                
                if (isInjected) {
                    console.log('✅ Smart Locator Inspector injected successfully!');
                } else {
                    console.log('⚠️  First injection attempt failed, trying addScriptTag...');
                    
                    // Fallback to addScriptTag
                    await this.page.addScriptTag({
                        content: this.injectorScript
                    });
                    
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                    const isInjectedSecond = await this.page.evaluate(() => {
                        return typeof window.SLI !== 'undefined';
                    });
                    
                    if (isInjectedSecond) {
                        console.log('✅ Smart Locator Inspector injected on second attempt!');
                    } else {
                        console.log('❌ Could not inject Smart Locator Inspector');
                    }
                }
                
            } catch (error) {
                console.error('❌ Failed to inject script:', error.message);
                throw error;
            }
            
            console.log('✅ Smart Locator Inspector is now active!');
            console.log('');
            console.log('🎯 How to use:');
            console.log('   • Hover over elements to see locator info');
            console.log('   • Press CTRL to freeze current element');
            console.log('   • Click on any locator in the modal to copy it');
            console.log('   • Press ESC to hide/show the inspector');
            console.log('   • Close this terminal or press Ctrl+C to exit');
            console.log('');

            // Set up navigation handler
            this.setupNavigationHandler();

            // Keep the process running
            await this.keepAlive();
            
        } catch (error) {
            console.error('❌ Error launching Smart Locator Inspector:', error.message);
            await this.cleanup();
        }
    }

    setupNavigationHandler() {
        // Re-inject script on navigation
        this.page.on('framenavigated', async (frame) => {
            if (frame === this.page.mainFrame()) {
                try {
                    // Wait for page to be ready
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    // Re-inject the script
                    await this.page.addScriptTag({
                        content: this.injectorScript
                    });
                    
                    console.log('🔄 Re-injected inspector after navigation');
                } catch (error) {
                    console.log('⚠️  Could not re-inject on navigation:', error.message);
                }
            }
        });
    }

    async keepAlive() {
        // Listen for page events
        this.page.on('console', msg => {
            if (msg.text().startsWith('[SLI]')) {
                console.log(`📋 ${msg.text()}`);
            }
        });

        // Handle browser disconnect
        this.browser.on('disconnected', () => {
            console.log('🔌 Browser disconnected. Exiting...');
            process.exit(0);
        });

        // Handle process termination
        process.on('SIGINT', async () => {
            console.log('\n� Shutting down Smart Locator Inspector...');
            await this.cleanup();
            process.exit(0);
        });

        // Keep process alive
        return new Promise(() => {});
    }

    async cleanup() {
        try {
            if (this.browser) {
                await this.browser.close();
            }
        } catch (error) {
            console.error('Error during cleanup:', error.message);
        }
    }
}

// CLI Interface
async function main() {
    const args = process.argv.slice(2);
    // Filter out flags like --modular
    const urlArgs = args.filter(arg => !arg.startsWith('--'));
    let url = 'https://example.com';
    
    if (urlArgs.length > 0) {
        url = urlArgs[0];
        // Add protocol if missing
        if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('file://')) {
            url = 'https://' + url;
        }
    }

    const inspector = new SmartLocatorInspector();
    await inspector.launch(url);
}

// Run if called directly
if (require.main === module) {
    main().catch(error => {
        console.error('❌ Fatal error:', error.message);
        process.exit(1);
    });
}

module.exports = SmartLocatorInspector;

// Show usage if no arguments (excluding flags)
const urlArgs = process.argv.slice(2).filter(arg => !arg.startsWith('--'));
if (urlArgs.length < 1) {
    console.log(`
🧠 Smart Locator Inspector (SLI)
=================================

Usage:
  node smart-locator.js <URL>

Examples:
  node smart-locator.js https://example.com
  node smart-locator.js https://google.com
  node smart-locator.js file:///C:/path/to/local.html

Features:
  • Real-time element highlighting
  • Smart locator generation (XPath, CSS, ID, etc.)
  • Copy-to-clipboard functionality
  • Freeze selection with Ctrl key
  • Non-intrusive floating modal

Requirements:
  • Google Chrome installed
  • Node.js 18+
  
Run 'npm install' first to install dependencies.
`);
    process.exit(0);
}