# 🚀 Quick Build Guide - Smart Locator Inspector

## ⚡ TL;DR - Get Started in 3 Minutes

```bash
# 1. Install dependencies
npm install

# 2. Build the modular version
npm run build

# 3. Run with any website
npm run dev https://example.com
```

## 🔧 Build Commands Reference

| Command | Purpose | Output |
|---------|---------|--------|
| `npm install` | Install all dependencies | Ready to build |
| `npm run build` | Build modular version | `injector-modular.js` |
| `npm run dev <url>` | Build + Run modular | Browser opens |
| `npm start <url>` | Run legacy version | Browser opens |
| `node smart-locator.js --help` | Show all options | Help text |

## 📋 What Each File Does

### 🏗️ Build System Files
- **`src/build.js`** - Build script that combines modules
- **`src/injector-modular-template.js`** - Template for final output
- **`package.json`** - NPM scripts and dependencies

### 📦 Source Modules (src/modules/)
- **`main.js`** - Entry point, initializes everything
- **`config.js`** - Settings and configuration
- **`utils.js`** - Helper functions for DOM manipulation
- **`styles.js`** - All CSS styling for the inspector UI
- **`hierarchy.js`** - DOM tree visualization
- **`locators.js`** - XPath/CSS selector generation logic
- **`ui.js`** - Modal window and UI components
- **`events.js`** - Mouse/keyboard event handling

### 🎯 Output Files
- **`injector.js`** - Original monolithic version (75.6 KB)
- **`injector-modular.js`** - Built modular version (63.8 KB, 15% smaller)

## 🎮 Usage Examples

### Basic Inspection
```bash
# Inspect any website
npm run dev https://github.com
npm run dev https://stackoverflow.com
npm run dev https://amazon.com
```

### Local Development
```bash
# Local HTML files
npm run dev file:///C:/path/to/your/file.html

# Local servers
npm run dev http://localhost:3000
npm run dev http://localhost:8080
```

### Demo Pages
```bash
# Built-in demo pages
npm run dev file:///$(pwd)/demos/test-page-demo.html
npm run dev file:///$(pwd)/demos/table-xpath-demo.html
npm run dev file:///$(pwd)/demos/framework-demo.html
```

## 🎯 Tool Capabilities

### 🧠 Smart Features
- **Real-time element inspection** - Hover to see locators
- **Multiple locator strategies** - XPath, CSS, ID, Text, Framework
- **Scoring system** - 0-100 reliability rating
- **Framework detection** - Angular, React, Vue attributes
- **Table-specific XPath** - Complex table navigation
- **DOM hierarchy tree** - Visual parent-child relationships

### 🎨 User Experience
- **One-click copy** - Click any locator to copy to clipboard
- **Freeze mode** - Press Ctrl to lock element selection
- **Draggable modal** - Move inspector window anywhere
- **Visual highlighting** - Red border shows current element
- **Keyboard shortcuts** - Esc to toggle, Ctrl to freeze

### 📊 Locator Types Generated

| Priority | Type | Example | Best For |
|----------|------|---------|----------|
| 🔥 **Highest** | ID | `#login-button` | Unique elements |
| 🔥 **Highest** | Test Attributes | `[data-testid="submit"]` | Test automation |
| ⭐ **High** | Framework | `[ng-model="user"]` | Angular/React/Vue |
| ⭐ **High** | Accessibility | `[aria-label="Search"]` | Screen readers |
| ✅ **Good** | Text Content | `//button[text()="Login"]` | Buttons/Links |
| ⚠️ **Medium** | CSS Classes | `.btn.btn-primary` | Styled elements |
| 🔻 **Low** | Structural | `//div[3]/input[1]` | Position-based |

## 🔍 Interactive Controls

| Action | Control | Description |
|--------|---------|-------------|
| **Inspect** | Mouse hover | See locators for any element |
| **Freeze** | Hold `Ctrl` | Lock selection for detailed analysis |
| **Copy** | Click locator | Copy to clipboard instantly |
| **Toggle** | Press `Esc` | Hide/show inspector modal |
| **Drag** | Drag modal header | Move window position |
| **Exit** | `Ctrl+C` in terminal | Close browser and exit |

## 🛠️ Development Workflow

### 1. Make Changes
```bash
# Edit any file in src/modules/
code src/modules/locators.js  # Add new locator strategy
code src/modules/ui.js        # Modify UI components
code src/modules/styles.js    # Update styling
```

### 2. Build & Test
```bash
npm run build                 # Rebuild modular version
npm run dev <test-url>        # Test with real website
```

### 3. Verify Changes
- Check browser console for errors
- Test locator generation
- Verify UI improvements
- Test keyboard shortcuts

## 🚨 Common Issues & Fixes

### ❌ Build Fails
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm run build
```

### ❌ Chrome Won't Open
```bash
# Check Chrome installation
where chrome                  # Windows
which google-chrome          # Linux
```

### ❌ Inspector Not Visible
- Refresh page (F5)
- Check browser console for errors
- Try different website
- Disable popup blockers

### ❌ Copy Not Working
- Use HTTPS sites (clipboard API requirement)
- Check browser permissions
- Try manually selecting and copying

## 🎯 Quick Tips

### ✅ Best Practices
- **Use modular version** for development (`npm run dev`)
- **Test with real websites** not just demos
- **Check uniqueness** - look for "UNIQUE" indicators
- **Prefer higher scores** - 90+ is excellent
- **Use framework attributes** when available

### ⚡ Performance Tips
- **Avoid complex DOM** - can slow element detection
- **Use specific selectors** - faster than broad searches
- **Close inspector** when not needed (Esc key)

### 🔧 Customization
- **Edit styles** in `src/modules/styles.js`
- **Add locator strategies** in `src/modules/locators.js`
- **Modify UI** in `src/modules/ui.js`
- **Always rebuild** after changes: `npm run build`

---

## 🎉 You're Ready!

That's it! You now have a professional-grade locator inspector tool. Start with:

```bash
npm run dev https://your-favorite-website.com
```

Happy element hunting! 🎯

---

*For complete documentation, see: `docs/COMPLETE_DOCUMENTATION.md`*