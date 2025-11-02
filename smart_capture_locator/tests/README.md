# 🧪 Tests and Development Files

This folder contains test files and development versions of project components.

## Files

- **`test-setup.js`** - Test setup configuration and utilities
- **`injector_new.js`** - Development/newer version of the injector script (for testing new features)

## Usage

### Test Setup
The `test-setup.js` file contains configuration and utilities for testing the Smart Locator Inspector functionality.

### Development Injector
The `injector_new.js` file is a development version of the main `injector.js` script. It may contain:
- Experimental features
- Bug fixes being tested
- Performance improvements
- New functionality being developed

## Development Workflow

When working on injector improvements:
1. Make changes in `injector_new.js`
2. Test thoroughly with various demo pages
3. Once stable, replace the main `injector.js` file
4. Update documentation accordingly

## Testing

Run tests from the project root:
```bash
# Test with development injector (if configured)
node smart-locator.js --dev

# Or modify smart-locator.js to load injector_new.js instead
```

**Note:** These files are for development and testing purposes. The main production files are in the project root.