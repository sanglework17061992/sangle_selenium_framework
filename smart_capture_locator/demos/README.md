# 🎮 Demo Pages

This folder contains HTML demo pages for testing the Smart Locator Inspector functionality.

## Files

- **`example.html`** - Basic example page for testing
- **`framework-demo.html`** - Demo page for testing framework detection (Angular, React, Vue)
- **`table-xpath-demo.html`** - Comprehensive table demo for testing table-specific XPath generation
- **`test-page-demo.html`** - Complete test page with various element types for comprehensive testing

## Usage

### With Node.js CLI Tool
```bash
# Navigate to project root
cd capture_locator_tool-main

# Test with any demo file
node smart-locator.js file://$(pwd)/demos/test-page-demo.html
node smart-locator.js file://$(pwd)/demos/table-xpath-demo.html
```

### With Chrome Extension
1. Load the extension in Chrome (`chrome://extensions/`)
2. Open any demo file directly in browser: `file:///path/to/capture_locator_tool-main/demos/test-page-demo.html`
3. Activate the inspector and start testing

## Features to Test

- **Element highlighting** - Hover over different elements
- **Locator generation** - Check various selector types (ID, CSS, XPath)
- **Table functionality** - Use `table-xpath-demo.html` for table-specific features
- **Framework detection** - Use `framework-demo.html` for React/Angular/Vue patterns
- **Copy functionality** - Click locators to copy to clipboard
- **Freeze mode** - Press Ctrl to lock element selection