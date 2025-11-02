# 🧠 Smart Locator Inspector (SLI)

A **professional-grade, real-time DOM element inspector** for QA engineers and automation testers. Uses Chrome DevTools Protocol to generate reliable web element locators instantly - no more manual DOM inspection!

**🚀 Perfect for**: Selenium, Cypress, Playwright, and any automation framework requiring stable element selectors.

## 📚 Complete Documentation

### 📖 **[📋 Complete Documentation](docs/COMPLETE_DOCUMENTATION.md)**
**Everything you need to know** - comprehensive guide covering installation, building, usage, architecture, and advanced features.

### ⚡ **[🚀 Quick Build Guide](docs/QUICK_BUILD_GUIDE.md)**  
**Get started in 3 minutes** - concise reference for building and running the tool immediately.

### 🎯 **[✨ Features Showcase](docs/FEATURES_SHOWCASE.md)**
**See what it can do** - detailed feature overview with examples and real-world use cases.

---

## ⚡ Quick Start

```bash
# 1. Install dependencies  
npm install

# 2. Build modular version
npm run build

# 3. Run on any website
npm run dev https://example.com
```

**That's it!** Browser opens with the inspector ready. Hover over elements to see locators instantly.

## 🎯 Key Features

✅ **Real-time element inspection** - Hover to see locators instantly  
✅ **Smart scoring system** - 0-100 reliability rating for each locator  
✅ **Framework detection** - Angular, React, Vue attribute recognition  
✅ **Table-specific XPath** - Specialized navigation for complex tables  
✅ **Accessibility-aware** - Prioritizes ARIA and semantic attributes  
✅ **One-click copy** - Click any locator to copy to clipboard  
✅ **DOM hierarchy tree** - Visual parent-child relationships  
✅ **Freeze mode** - Press Ctrl to lock element selection  
✅ **Professional UI** - Draggable, non-intrusive floating modal

## 📁 Project Structure

```
capture_locator_tool-main/
├── smart-locator.js          # Main CLI entry point
├── injector.js              # Core browser injection script (legacy)
├── injector-modular.js      # Modular browser injection script (generated)
├── package.json             # Dependencies and scripts
├── README.md               # This file
├── src/                    # Modular source code (NEW!)
│   ├── main.js             # Main entry point
│   ├── build.js            # Build script
│   ├── README.md           # Modular architecture docs
│   └── modules/            # Individual modules
│       ├── config.js       # Configuration & state
│       ├── utils.js        # Utility functions
│       ├── styles.js       # CSS styles
│       ├── hierarchy.js    # DOM hierarchy
│       ├── locators.js     # Locator generation
│       ├── ui.js           # UI components
│       └── events.js       # Event handling
├── chrome-extension/       # Chrome extension version
│   ├── manifest.json
│   ├── content.js
│   ├── popup.html
│   └── ...
├── docs/                   # Documentation files
│   ├── IMPLEMENTATION_COMPLETE.md
│   ├── IMPROVEMENTS.md
│   └── TABLE_XPATH_ENHANCEMENT.md
├── demos/                  # Demo HTML files for testing
│   ├── example.html
│   ├── framework-demo.html
│   ├── table-xpath-demo.html
│   └── test-page-demo.html
└── tests/                  # Test and development files
    ├── test-setup.js
    └── injector_new.js
```

## �🚀 Quick Start

### Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Google Chrome** - Make sure Chrome is installed and accessible
- **Windows 11** - Optimized for Windows environment

### Installation

```bash
# Navigate to project directory
cd capture_locator_tool-main

# Install dependencies
npm install

# Run the tool (legacy version)
npm start https://example.com

# Run with modular version (recommended for development)
npm run dev https://example.com
```

### Basic Usage

```bash
# Inspect any website
node smart-locator.js https://google.com

# Inspect with modular version
npm run start:modular https://google.com

# Inspect local HTML files (use demos folder)
node smart-locator.js file:///$(pwd)/demos/test-page-demo.html

# Inspect development servers
node smart-locator.js http://localhost:3000
```

### Development Workflow

```bash
# Build modular version
npm run build

# Development mode (builds + runs modular version)
npm run dev

# Test with demo pages
npm run dev file:///$(pwd)/demos/table-xpath-demo.html
```

## �️ Modular Architecture

The project has been refactored into a **clean, maintainable modular architecture**:

- **8 focused modules** instead of 1 monolithic file (1,889 lines → ~250 lines each)
- **Better maintainability** with single-responsibility modules
- **Easier testing** with isolated, unit-testable components
- **Improved developer experience** for collaboration and debugging

### Using Modular Version

```bash
# Use optimized modular version (recommended for development)
npm run start:modular https://example.com

# Build and run modular version
npm run dev https://example.com

# Use legacy version (original injector.js)
npm start https://example.com
```

📚 **See [Modular Architecture Guide](src/README.md)** for detailed information about the module structure.

## �🎮 User Interface

### Main Modal
The floating inspector panel displays:

| Field | Description | Example |
|-------|-------------|---------|
| **Tag** | HTML element tag | `button`, `input`, `div` |
| **ID** | Element ID attribute | `login-btn`, `username` |
| **Name** | Name attribute | `email`, `password` |
| **CSS** | CSS selector | `#login-btn`, `.form-control` |
| **XPath** | Smart XPath locator | `//*[@id="login-btn"]` |
| **Text** | Visible text content | `"Login"`, `"Submit"` |
| **Classes** | CSS classes | `btn btn-primary` |

### Controls

| Action | Key/Mouse | Description |
|--------|-----------|-------------|
| **Hover** | Mouse movement | Highlight elements and update locators |
| **Freeze** | `Ctrl` key | Lock current selection for examination |
| **Copy** | Click locator field | Copy specific locator to clipboard |
| **Exit** | `Esc` key | Close inspector and return to normal browsing |

### Visual Feedback

- **Red highlight** - Normal hover mode
- **Blue highlight with pulse** - Frozen selection mode
- **Toast notifications** - Copy confirmations and status updates

## 🧩 Locator Generation Logic

### Priority System

1. **ID-based locators** (highest priority)
   - Uses element ID if stable (not dynamically generated)
   - Example: `#login-button`

2. **Attribute-based locators**
   - Prioritizes: `data-test`, `data-testid`, `name`, `role`
   - Example: `[data-test="submit-form"]`

3. **Text-based XPath** (for buttons/links)
   - Uses visible text content
   - Example: `//button[contains(text(),"Login")]`

4. **Class-based selectors**
   - Filters out dynamic/random classes
   - Example: `.btn.btn-primary`

5. **Hierarchical XPath** (fallback)
   - Builds path from parent elements
   - Example: `//div[@class="form"]//button[2]`

### Smart Filtering

The tool automatically avoids:
- Random/generated IDs (containing 3+ consecutive digits)
- Temporary or UUID-based attributes
- Dynamic class names with timestamps or random values

## 🔧 Configuration

### Chrome Path Setup (if needed)

If Chrome isn't found automatically, set the environment variable:

```bash
# Windows PowerShell
$env:CHROME_PATH = "C:\Program Files\Google\Chrome\Application\chrome.exe"

# Windows CMD
set CHROME_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe
```

### Debug Port

Default debug port is `9222`. If you need to change it, modify the `debugPort` in `smart-locator.js`:

```javascript
this.debugPort = 9223; // Change to your preferred port
```

## 🛠️ Technical Architecture

```
User runs Node CLI tool
         ↓
Launch Chrome with remote debugging port
         ↓
Connect to Chrome via CDP
         ↓
Inject Inspector JS into page context
         ↓
Listen for mousemove events
         ↓
Highlight hovered element + Update floating modal
```

### Components

1. **smart-locator.js** - Node.js launcher and CDP controller
2. **injector.js** - Browser-injected inspector script
3. **package.json** - Dependencies and npm scripts

## 🧪 Examples

### Testing Different Websites

```bash
# E-commerce sites
node smart-locator.js https://amazon.com

# Forms and inputs
node smart-locator.js https://forms.gle/example

# Single Page Applications
node smart-locator.js https://react-app.com

# Local development
node smart-locator.js http://localhost:8080
```

### Sample Output

When hovering over a login button:

```
Tag: button
ID: loginSubmit
Name: login
CSS: button#loginSubmit
XPath: //*[@id="loginSubmit"]
Text: "Sign In"
Classes: btn btn-primary btn-lg
```

## 🐛 Troubleshooting

### Common Issues

**Chrome not found**
```
Solution: Install Chrome or set CHROME_PATH environment variable
```

**Connection failed**
```
Solution: Make sure Chrome isn't already running with debugging enabled
```

**Elements not highlighting**
```
Solution: Try refreshing the page or restarting the tool
```

**Permission errors**
```
Solution: Run terminal as Administrator if needed
```

### Debug Mode

Add console logging to see detailed CDP communication:

```javascript
// In smart-locator.js, add:
console.log('CDP Message:', message);
```

## 🔮 Future Enhancements

- [ ] **Export page object model** - Generate complete page object files
- [ ] **Playwright integration** - Support for Playwright selectors
- [ ] **Chrome extension version** - Persistent browser extension
- [ ] **Multi-element capture** - Select and store multiple elements
- [ ] **Configurable preferences** - Customize locator priorities
- [ ] **Screenshot capture** - Visual element documentation
- [ ] **Selenium integration** - Direct WebDriver compatibility

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - feel free to use in your automation projects!

## 🙏 Acknowledgments

- Chrome DevTools Protocol team
- Puppeteer project
- QA automation community

---

**Happy Testing!** 🎯

For questions or support, please open an issue on the GitHub repository.