# 🏗️ Modular Source Code

This folder contains the refactored, modular version of the Smart Locator Inspector for better maintainability.

## 📁 Structure

```
src/
├── main.js                 # Main entry point and orchestrator
├── build.js               # Build script to combine modules
├── injector-modular.js    # Generated combined file (auto-generated)
└── modules/
    ├── config.js          # Configuration and state management
    ├── utils.js           # Utility functions and helpers
    ├── styles.js          # CSS styles and style injection
    ├── hierarchy.js       # DOM hierarchy generation and display
    ├── locators.js        # All locator generation strategies
    ├── ui.js              # UI components (modal, highlighting)
    └── events.js          # Event handling (mouse, keyboard, navigation)
```

## 🔧 Building

### Build Once
```bash
npm run build
```

### Development Mode (with modular injector)
```bash
npm run dev
```

### Using Modular Version
```bash
# Use environment variable
npm run start:modular

# Or use command line flag
node smart-locator.js --modular
```

## 📝 Module Descriptions

### `config.js` - Configuration & State
- Central configuration management
- Global state handling  
- State persistence and reset functionality

### `utils.js` - Utility Functions
- HTML escaping and text processing
- Dynamic value detection (UUIDs, generated IDs)
- CSS class filtering and attribute handling
- XPath validation and uniqueness checking
- Clipboard operations

### `styles.js` - CSS Styles
- Complete CSS styles for the UI
- Style injection and management
- Responsive design and animations

### `hierarchy.js` - DOM Hierarchy
- DOM tree structure generation
- Tree visualization and formatting
- Element information extraction
- Hierarchy navigation and highlighting

### `locators.js` - Locator Generation
- Smart XPath generation strategies
- Framework-aware locators (Angular, React, Vue)
- Semantic and accessibility-based locators
- Text-based and structural locators
- Table-specific XPath patterns
- CSS selector generation

### `ui.js` - UI Components
- Modal creation and management
- Element highlighting system
- Drag and drop functionality
- Content updates and field creation
- Copy-to-clipboard interactions

### `events.js` - Event Handling
- Mouse movement and hover detection
- Keyboard shortcuts (Ctrl, Esc)
- Navigation persistence
- Modal interaction handling

### `main.js` - Entry Point
- Module orchestration
- Initialization sequence
- Public API exposure
- Cleanup management

## 🎯 Benefits of Modular Architecture

### ✅ **Maintainability**
- Each module has a single responsibility
- Easy to locate and modify specific functionality
- Clear separation of concerns

### ✅ **Testability**  
- Individual modules can be unit tested
- Mock dependencies easily for testing
- Isolated functionality debugging

### ✅ **Readability**
- Smaller, focused files are easier to understand
- Clear module boundaries and interfaces
- Self-documenting structure

### ✅ **Reusability**
- Modules can be reused in other contexts
- Chrome extension can share the same modules
- Easy to extract standalone functionality

### ✅ **Development Experience**
- Easier to work with multiple developers
- Reduced merge conflicts
- Better code organization

## 🔄 Development Workflow

1. **Make changes** to individual modules in `src/modules/`
2. **Build** the combined injector: `npm run build`
3. **Test** with modular version: `npm run dev`
4. **Verify** functionality works as expected
5. **Deploy** by using the generated `injector-modular.js`

## 📊 Size Comparison

- **Original injector.js**: ~76 KB (1,889 lines)
- **Modular injector.js**: ~64 KB (better optimized)
- **Individual modules**: 7-15 KB each (100-300 lines)

## 🚀 Future Enhancements

The modular structure makes it easy to:
- Add new locator generation strategies
- Implement new UI features
- Support additional frameworks
- Create browser extension variants
- Add comprehensive testing
- Implement TypeScript definitions

## 🧪 Testing

```bash
# Test the modular version
npm run dev demos/test-page-demo.html

# Test specific functionality
node smart-locator.js --modular file:///$(pwd)/demos/table-xpath-demo.html
```