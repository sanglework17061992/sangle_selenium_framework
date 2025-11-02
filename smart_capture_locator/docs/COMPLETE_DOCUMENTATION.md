# 🧠 Smart Locator Inspector (SLI) - Complete Documentation

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [What This Tool Does](#-what-this-tool-does)
3. [Prerequisites & Installation](#-prerequisites--installation)
4. [Building the Project](#-building-the-project)
5. [Usage Guide](#-usage-guide)
6. [Features & Capabilities](#-features--capabilities)
7. [Project Architecture](#-project-architecture)
8. [Development Workflow](#-development-workflow)
9. [Troubleshooting](#-troubleshooting)
10. [Advanced Usage](#-advanced-usage)

---

## 🎯 Project Overview

**Smart Locator Inspector (SLI)** is a professional tool designed for **QA engineers, automation testers, and web developers** that helps identify and generate stable, automation-friendly locators for web elements without manually inspecting DOM in DevTools.

### 🎪 The Problem It Solves
- **Manual DOM inspection** is time-consuming
- **Finding reliable locators** for automation is challenging
- **Dynamic elements** break traditional selectors
- **Framework-specific attributes** are hard to identify
- **Table navigation** requires complex XPath expressions

### 🎯 The Solution
SLI provides **real-time, intelligent locator generation** with:
- **Smart XPath strategies** with scoring systems
- **Framework detection** (Angular, React, Vue)
- **Table-specific locators** for complex data structures
- **Accessibility-aware selectors**
- **Copy-to-clipboard** functionality for instant use

---

## 🔧 What This Tool Does

### 🎮 Core Functionality

1. **Real-Time Element Inspection**
   - Hover over any web element to instantly see locator options
   - Visual highlighting with animated borders
   - Non-intrusive floating modal interface

2. **Smart Locator Generation**
   - **ID Selectors**: Uses stable element IDs
   - **CSS Selectors**: Class-based and attribute selectors
   - **XPath Expressions**: Multiple strategies with scoring
   - **Framework Attributes**: Angular, React, Vue detection
   - **Accessibility Selectors**: ARIA labels, roles, etc.
   - **Text-Based Locators**: Content-based selection

3. **Advanced Features**
   - **Freeze Mode**: Press Ctrl to lock element selection
   - **DOM Hierarchy Tree**: Visual parent-child relationships
   - **Uniqueness Validation**: Ensures selectors match only one element
   - **Scoring System**: Rates locator reliability (0-100 points)
   - **Table Navigation**: Specialized XPath for table structures

4. **Developer Experience**
   - **One-Click Copy**: Click any locator to copy to clipboard
   - **Multiple Strategies**: See 5+ locator options per element
   - **Quality Scoring**: Visual indicators for locator reliability
   - **Framework Detection**: Recognizes modern web frameworks

### 📊 Locator Types Generated

| Type | Example | Use Case | Score Range |
|------|---------|----------|-------------|
| **ID Selector** | `#login-button` | Unique elements | 95-100 |
| **Test Attributes** | `[data-testid="submit"]` | Test automation | 95-100 |
| **Framework** | `[ng-model="username"]` | Angular/React/Vue | 90-98 |
| **Accessibility** | `[aria-label="Search"]` | Accessible elements | 85-95 |
| **Text Content** | `//button[text()="Login"]` | Buttons, links | 80-90 |
| **CSS Classes** | `.btn.btn-primary` | Styled elements | 70-85 |
| **Structural** | `//div[@class="form"]/input[2]` | Position-based | 60-75 |
| **Table Specific** | `//td[text()="John"]/following-sibling::td[2]` | Table navigation | 85-95 |

---

## 🛠️ Prerequisites & Installation

### 📋 System Requirements

- **Operating System**: Windows 11 (optimized), Windows 10, macOS, Linux
- **Node.js**: Version 18.0.0 or higher
- **Google Chrome**: Latest version installed and accessible
- **RAM**: Minimum 4GB (8GB recommended)
- **Disk Space**: 200MB for project + dependencies

### 📦 Installation Steps

1. **Clone/Download the Project**
   ```bash
   git clone <repository-url>
   cd capture_locator_tool-main
   ```

2. **Install Node.js Dependencies**
   ```bash
   npm install
   ```

3. **Verify Installation**
   ```bash
   node --version  # Should show v18.0.0+
   npm --version   # Should show npm version
   ```

4. **Test Basic Functionality**
   ```bash
   npm start --help
   ```

### 📋 Dependencies Overview

| Package | Version | Purpose |
|---------|---------|---------|
| **puppeteer** | ^24.23.0 | Chrome automation and control |
| **chrome-remote-interface** | ^0.33.3 | Chrome DevTools Protocol communication |

---

## 🏗️ Building the Project

### 🔨 Build System Overview

The project uses a **modular architecture** with a custom build system that combines individual modules into a single browser-injectable script.

### 📁 Source Structure
```
src/
├── main.js                 # Entry point and orchestration
├── build.js               # Build script
├── injector-modular-template.js  # Template file
└── modules/
    ├── config.js          # Configuration & state management
    ├── utils.js           # Utility functions
    ├── styles.js          # CSS styles
    ├── hierarchy.js       # DOM hierarchy generation
    ├── locators.js        # Locator generation strategies
    ├── ui.js              # UI components
    └── events.js          # Event handling
```

### 🔧 Build Commands

#### **1. Basic Build**
```bash
npm run build
```
- Combines all modules into `injector-modular.js`
- Removes ES6 import/export statements
- Validates syntax
- Shows size comparison

#### **2. Development Build & Run**
```bash
npm run dev <url>
```
- Builds the modular version
- Launches with modular injector
- Ideal for development and testing

#### **3. Watch Mode (Future Enhancement)**
```bash
npm run build:watch
```
- Automatically rebuilds when modules change
- Requires `chokidar` package for file watching

### 📊 Build Output Example
```
📦 Building modular Smart Locator Inspector...
✅ Successfully built: D:\capture_locator_tool-main\injector-modular.js
📏 Total size: 63.8 KB
🔧 Original injector.js size: 75.6 KB
✅ Generated code syntax is valid
```

### 🎯 Build Process Details

1. **Template Loading**: Reads `injector-modular-template.js`
2. **Module Processing**: 
   - Loads each module from `src/modules/`
   - Removes ES6 import/export syntax
   - Preserves all functionality
3. **Code Injection**: Replaces placeholders with actual module code
4. **Optimization**: Minifies and optimizes the combined script
5. **Validation**: Syntax checking and error detection
6. **Output**: Generates `injector-modular.js` ready for browser injection

---

## 🚀 Usage Guide

### 🎮 Basic Usage

#### **Method 1: Default (Legacy) Version**
```bash
# Inspect any website
npm start https://example.com

# Inspect local files
npm start file:///C:/path/to/your/file.html

# Inspect development servers
npm start http://localhost:3000
```

#### **Method 2: Modular Version (Recommended)**
```bash
# Development workflow
npm run dev https://example.com

# Direct modular usage
npm run start:modular https://google.com

# With command line flag
node smart-locator.js --modular https://example.com
```

#### **Method 3: Demo Pages**
```bash
# Test with included demo pages
npm run dev file:///$(pwd)/demos/test-page-demo.html
npm run dev file:///$(pwd)/demos/table-xpath-demo.html
npm run dev file:///$(pwd)/demos/framework-demo.html
```

### 🎯 Interactive Controls

| Action | Control | Description |
|--------|---------|-------------|
| **Inspect Element** | Hover mouse | Highlights element and shows locators |
| **Freeze Selection** | `Ctrl` key | Locks current element for detailed analysis |
| **Toggle Inspector** | `Esc` key | Hide/show the inspector modal |
| **Copy Locator** | Click on locator | Copies locator to clipboard |
| **Drag Modal** | Drag header | Move inspector window around screen |
| **Exit Tool** | `Ctrl+C` | Close browser and exit application |

### 📋 Step-by-Step Workflow

1. **Launch the Tool**
   ```bash
   npm run dev https://your-target-website.com
   ```

2. **Wait for Browser Launch**
   - Chrome opens automatically
   - Page loads with inspector injected
   - Look for success message in terminal

3. **Start Inspecting**
   - Move mouse over elements
   - Inspector modal appears on right side
   - Element highlights with red border

4. **Analyze Locators**
   - Review multiple locator strategies
   - Check uniqueness indicators (UNIQUE/NON-UNIQUE)
   - Note scoring (higher = more reliable)

5. **Copy Locators**
   - Click any locator field to copy
   - Use in your test automation scripts
   - Try different strategies for better reliability

6. **Advanced Features**
   - Press `Ctrl` to freeze on complex elements
   - Explore DOM hierarchy tree
   - Use table-specific locators for data tables

### 🎨 Visual Indicators

| Color | Meaning | Action |
|-------|---------|--------|
| **Red Border** | Currently hovered element | Move mouse to change |
| **Green Border** | Frozen element (Ctrl pressed) | Press Ctrl again to unfreeze |
| **Blue Highlight** | Smart XPath suggestion | Higher reliability |
| **Orange Highlight** | Table-specific XPath | Specialized for tables |
| **Green Score** | High reliability (90-100) | Recommended for use |
| **Yellow Score** | Medium reliability (70-89) | Use with caution |
| **Red Score** | Low reliability (0-69) | Avoid if possible |

---

## ⭐ Features & Capabilities

### 🧠 Smart Locator Generation

#### **1. Framework Detection**
- **Angular**: Detects `ng-model`, `ng-click`, `ng-repeat` attributes
- **React**: Identifies `data-testid`, `data-test` attributes
- **Vue**: Recognizes `v-model`, `v-if`, `v-for` directives
- **Testing Frameworks**: Cypress, Selenium, Playwright attributes

#### **2. Accessibility-Aware Selectors**
- **ARIA Labels**: `aria-label`, `aria-labelledby`, `aria-describedby`
- **Roles**: `role` attribute for semantic elements
- **Form Elements**: `name`, `placeholder`, `title` attributes
- **Landmarks**: Navigation, main, banner, contentinfo

#### **3. Table-Specific Locators**
```xpath
# Cell by content
//td[normalize-space(text())="John Doe"]

# Cell by row context
//tr[td[text()="John Doe"]]/td[3]

# Header-based navigation
//table[.//th[text()="Name"]]//tr[td[text()="John"]]/td[2]
```

#### **4. Dynamic Element Handling**
- **UUID Detection**: Identifies auto-generated IDs
- **Dynamic Class Filtering**: Removes CSS-in-JS classes
- **Timestamp Exclusion**: Ignores time-based attributes
- **Framework Class Filtering**: Removes React/Vue generated classes

### 📊 Scoring System

The tool uses a **sophisticated scoring algorithm** to rate locator reliability:

#### **Score Calculation Factors**
- **Uniqueness**: Does it match exactly one element? (+30 points)
- **Stability**: Is the attribute stable across page loads? (+25 points)
- **Framework Awareness**: Uses test-specific attributes? (+20 points)
- **Accessibility**: Leverages semantic attributes? (+15 points)
- **Brevity**: Shorter locators score higher (+10 points)

#### **Score Ranges**
- **95-100**: Excellent (ID, data-testid, unique name)
- **85-94**: Very Good (Framework attributes, ARIA)
- **75-84**: Good (Stable classes, semantic elements)
- **65-74**: Fair (Structural, nth-child)
- **0-64**: Poor (Avoid if possible)

### 🏗️ DOM Hierarchy Tree

```
📋 DOM Hierarchy Tree
├── html
│   ├── body.main-container
│   │   ├── header#site-header
│   │   ├── nav.navigation[role="navigation"]
│   │   └── main.content
│   │       ├── section.hero
│   │       └── div.form-container
│   │           └── ● form#login-form ◄ CURRENT
```

- **Visual Tree Structure**: Shows parent-child relationships
- **Click to Copy**: Each hierarchy item copies its locator
- **Current Element Highlighting**: Shows exactly where you are
- **Context Understanding**: See element's position in page structure

### 🎨 User Interface Features

#### **Floating Modal**
- **Non-intrusive Design**: Doesn't interfere with page content
- **Draggable Interface**: Move anywhere on screen
- **Responsive Layout**: Adapts to different screen sizes
- **Professional Styling**: Modern, clean appearance

#### **Visual Feedback**
- **Smooth Animations**: Hover effects and transitions
- **Color-coded Indicators**: Instant visual feedback
- **Progress Bars**: Score visualization with filled bars
- **Toast Notifications**: Copy confirmation messages

#### **Keyboard Shortcuts**
- **Esc**: Toggle inspector visibility
- **Ctrl**: Freeze/unfreeze current element
- **Mouse Hover**: Real-time element selection
- **Click**: Copy locator to clipboard

---

## 🏛️ Project Architecture

### 📦 Modular Design

The project follows a **clean, modular architecture** for maximum maintainability:

#### **Module Responsibilities**

1. **`config.js`** - Configuration & State Management
   ```javascript
   // Centralized configuration
   static config = {
       modalId: 'sli-modal',
       zIndex: 2147483647,
       excludeElements: ['sli-modal', 'sli-highlight']
   }
   ```

2. **`utils.js`** - Utility Functions
   ```javascript
   // Dynamic value detection
   static isDynamicValue(value) {
       return /^[\w\d]+-[\w\d]+-[\w\d]+$/.test(value); // UUID pattern
   }
   ```

3. **`styles.js`** - CSS Styles
   ```javascript
   // Complete UI styling
   static getCSS() {
       return '.sli-modal { /* comprehensive styles */ }';
   }
   ```

4. **`hierarchy.js`** - DOM Hierarchy
   ```javascript
   // Tree structure generation
   static generateDOMHierarchy(element) {
       // Complex tree building logic
   }
   ```

5. **`locators.js`** - Locator Generation
   ```javascript
   // Smart XPath strategies
   static generateSmartXPaths(element) {
       // Multiple locator strategies with scoring
   }
   ```

6. **`ui.js`** - UI Components
   ```javascript
   // Modal management
   static createModal() {
       // UI creation and interaction handling
   }
   ```

7. **`events.js`** - Event Handling
   ```javascript
   // Mouse and keyboard events
   static handleMouseMove(event) {
       // Real-time element detection
   }
   ```

8. **`main.js`** - Entry Point & Orchestration
   ```javascript
   // Module coordination
   static init() {
       // Initialize all modules in correct order
   }
   ```

### 🔄 Data Flow

```
User Interaction (Mouse Hover)
        ↓
Event Handler (events.js)
        ↓
Element Analysis (locators.js)
        ↓
UI Update (ui.js)
        ↓
Visual Feedback (styles.js)
```

### 🎯 Design Patterns

- **Module Pattern**: Encapsulated functionality
- **Observer Pattern**: Event-driven updates
- **Strategy Pattern**: Multiple locator generation strategies
- **Factory Pattern**: Dynamic UI component creation
- **Singleton Pattern**: Global configuration management

---

## 🔧 Development Workflow

### 👨‍💻 Setting Up Development Environment

1. **Clone and Setup**
   ```bash
   git clone <repository>
   cd capture_locator_tool-main
   npm install
   ```

2. **Development Mode**
   ```bash
   npm run dev
   ```

3. **Make Changes**
   - Edit files in `src/modules/`
   - Each module is focused and manageable (~200-300 lines)

4. **Test Changes**
   ```bash
   npm run build    # Rebuild modular version
   npm run dev <test-url>  # Test with real websites
   ```

### 📝 Adding New Features

#### **Example: Adding a New Locator Strategy**

1. **Edit `src/modules/locators.js`**
   ```javascript
   // Add to generateSmartXPaths method
   const customXPaths = this.generateCustomStrategy(element);
   xpaths.push(...customXPaths);
   ```

2. **Implement the Strategy**
   ```javascript
   static generateCustomStrategy(element) {
       const xpaths = [];
       // Your custom logic here
       xpaths.push({
           xpath: '//your-custom-xpath',
           score: 85,
           type: 'Custom Strategy',
           description: 'Your custom description'
       });
       return xpaths;
   }
   ```

3. **Test and Build**
   ```bash
   npm run build
   npm run dev <test-url>
   ```

### 🧪 Testing Workflow

#### **Manual Testing**
```bash
# Test with demo pages
npm run dev file:///$(pwd)/demos/test-page-demo.html
npm run dev file:///$(pwd)/demos/table-xpath-demo.html
npm run dev file:///$(pwd)/demos/framework-demo.html

# Test with real websites
npm run dev https://github.com
npm run dev https://stackoverflow.com
npm run dev https://amazon.com
```

#### **Feature Testing Checklist**
- [ ] Element highlighting works
- [ ] Modal appears and is draggable
- [ ] Locators are generated correctly
- [ ] Copy to clipboard functions
- [ ] Keyboard shortcuts work (Ctrl, Esc)
- [ ] Scoring system is accurate
- [ ] DOM hierarchy tree displays
- [ ] Framework detection works
- [ ] Table locators generate correctly

### 🔄 Git Workflow

```bash
# Feature development
git checkout -b feature/new-locator-strategy
# Make changes
npm run build
npm run dev <test-url>  # Test thoroughly
git add .
git commit -m "Add new locator strategy"
git push origin feature/new-locator-strategy
```

---

## 🚨 Troubleshooting

### ❌ Common Issues & Solutions

#### **1. Chrome Not Opening**
```
Error: Browser not found or path incorrect
```
**Solutions:**
- Ensure Chrome is installed and in PATH
- On Windows: Check `C:\Program Files\Google\Chrome\Application\chrome.exe`
- Run as Administrator if needed
- Try: `where chrome` to verify installation

#### **2. Module Import Errors**
```
Error: Cannot resolve module 'xyz'
```
**Solutions:**
- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then `npm install`
- Check Node.js version: `node --version` (requires 18+)

#### **3. Build Failures**
```
❌ Generated code has syntax errors
```
**Solutions:**
- Check module syntax in `src/modules/`
- Ensure no ES6 imports in template
- Run: `npm run build` and check error messages
- Validate individual modules

#### **4. Inspector Not Appearing**
```
Browser opens but no inspector modal visible
```
**Solutions:**
- Check browser console for JavaScript errors
- Refresh the page (F5)
- Try with a different website
- Ensure popup blockers are disabled

#### **5. Locators Not Copying**
```
Click on locator but nothing copies to clipboard
```
**Solutions:**
- Check if page is served over HTTPS (required for clipboard API)
- Try on different browser
- Check browser permissions for clipboard access
- Use fallback: manually select and copy text

### 🔍 Debug Mode

Enable debug logging by modifying `src/modules/config.js`:
```javascript
static config = {
    debug: true,  // Add this line
    modalId: 'sli-modal',
    // ... rest of config
}
```

### 📊 Performance Issues

#### **Slow Element Detection**
- **Cause**: Complex DOM structures
- **Solution**: Reduce DOM complexity or add performance optimizations

#### **High Memory Usage**
- **Cause**: Large pages with many elements
- **Solution**: Add element filtering or lazy loading

#### **Browser Crashes**
- **Cause**: Memory leaks or infinite loops
- **Solution**: Check event listeners cleanup in `events.js`

---

## 🚀 Advanced Usage

### 🎨 Customization Options

#### **1. Custom Styling**
Edit `src/modules/styles.js` to customize appearance:
```javascript
static getCSS() {
    return `
        .sli-modal {
            background: rgba(YOUR_COLOR) !important;
            border: 2px solid YOUR_BORDER_COLOR !important;
        }
    `;
}
```

#### **2. Custom Locator Strategies**
Add your own locator generation logic in `src/modules/locators.js`:
```javascript
static generateCustomXPaths(element) {
    const xpaths = [];
    
    // Your custom logic
    if (element.hasAttribute('my-custom-attr')) {
        xpaths.push({
            xpath: `//*[@my-custom-attr="${element.getAttribute('my-custom-attr')}"]`,
            score: 95,
            type: 'Custom Attribute',
            description: 'My custom locator strategy'
        });
    }
    
    return xpaths;
}
```

#### **3. Framework-Specific Configurations**
Extend framework detection in `src/modules/locators.js`:
```javascript
// Add to generateFrameworkXPaths method
const customFrameworkAttrs = ['my-framework-attr', 'custom-directive'];
customFrameworkAttrs.forEach(attr => {
    const value = element.getAttribute(attr);
    if (value) {
        xpaths.push({
            xpath: `//*[@${attr}="${value}"]`,
            score: 97,
            type: 'Custom Framework',
            description: 'Custom framework attribute'
        });
    }
});
```

### 🏭 Production Deployment

#### **1. Build for Production**
```bash
npm run build
```

#### **2. Integration with CI/CD**
```yaml
# .github/workflows/build.yml
name: Build SLI
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - run: npm test  # If you add tests
```

#### **3. Chrome Extension Packaging**
The project includes a Chrome extension version:
```bash
cd chrome-extension
# Load as unpacked extension in Chrome
# Or package for Chrome Web Store
```

### 📊 Extending Functionality

#### **1. Adding New UI Components**
Extend `src/modules/ui.js`:
```javascript
static createCustomComponent() {
    const component = document.createElement('div');
    component.className = 'sli-custom-component';
    component.innerHTML = 'Your custom content';
    return component;
}
```

#### **2. Adding New Event Handlers**
Extend `src/modules/events.js`:
```javascript
static attachCustomEventListeners() {
    document.addEventListener('custom-event', this.handleCustomEvent.bind(this));
}

static handleCustomEvent(event) {
    // Your custom event handling logic
}
```

#### **3. Adding Configuration Options**
Extend `src/modules/config.js`:
```javascript
static config = {
    // Existing config...
    customOption: true,
    customTheme: 'dark',
    customTimeout: 5000
};
```

### 🔌 API Integration

#### **1. Export Results**
Add result export functionality:
```javascript
// In src/modules/ui.js
static exportResults(locators) {
    const data = {
        timestamp: new Date().toISOString(),
        url: window.location.href,
        locators: locators
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], 
        { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sli-results.json';
    a.click();
}
```

#### **2. Analytics Integration**
Add usage analytics:
```javascript
// In src/modules/events.js
static trackUsage(action, data) {
    // Send to your analytics service
    fetch('/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            action: action,
            data: data,
            timestamp: Date.now()
        })
    });
}
```

---

## 📚 Additional Resources

### 🔗 Related Technologies
- **Puppeteer Documentation**: https://pptr.dev/
- **Chrome DevTools Protocol**: https://chromedevtools.github.io/devtools-protocol/
- **XPath Tutorial**: https://www.w3schools.com/xml/xpath_intro.asp
- **CSS Selectors Guide**: https://www.w3schools.com/cssref/css_selectors.asp

### 📖 Best Practices
- **Locator Stability**: Prefer ID and data attributes over classes
- **Framework Integration**: Use framework-specific test attributes
- **Accessibility**: Leverage ARIA attributes for semantic selection
- **Table Handling**: Use column headers for reliable table navigation
- **Performance**: Avoid overly complex XPath expressions

### 🤝 Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes in `src/modules/`
4. Run `npm run build` and test thoroughly
5. Submit a pull request with detailed description

### 📄 License
MIT License - Feel free to use in your automation projects!

---

## 🎉 Conclusion

The **Smart Locator Inspector** is a powerful, professional-grade tool that revolutionizes how you identify and generate web element locators. With its **modular architecture**, **intelligent scoring system**, and **comprehensive feature set**, it's an essential tool for any serious web automation project.

**Happy Testing!** 🚀

---

*Last Updated: October 19, 2025*
*Version: 1.0.0*
*Maintained by: Smart Locator Inspector Team*