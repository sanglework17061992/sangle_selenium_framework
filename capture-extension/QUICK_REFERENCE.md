# ⚡ Quick Reference Guide

## 🔗 Important Links

### Documentation
- 📖 [Full README](README.md) - Complete documentation
- 🚀 [Getting Started](GETTING_STARTED.md) - Setup guide
- ✅ [Project Summary](PROJECT_SUMMARY.md) - Statistics & overview
- 📋 [Implementation Summary](IMPLEMENTATION_SUMMARY.md) - What's been built
- 📝 [TODO Checklist](TODO.md) - What's left to do

### Key Files
- 🖥️ [server.ts](src/server.ts) - Express + WebSocket server
- ⚛️ [App.tsx](src/ui/App.tsx) - Main React component
- 🎯 [CodeGenerator.ts](src/services/CodeGenerator.ts) - Code generation logic
- 📁 [services/](src/services/) - All core services

## 🎯 Common Tasks

### Setup & Build
```bash
# Install dependencies
npm install

# Type check
npm run type-check

# Build project
npm run build

# Start development server
npm run dev:server
```

### Testing
```bash
# Run specific test
npm test -- --grep "test name"

# Run all tests
npm test

# Generate report
npm run test:report
```

### File Operations
```bash
# View generated files
ls -la src/services/
ls -la src/ui/components/
ls -la public/

# Check build output
ls -la dist/
```

## 🏗️ Architecture Quick Facts

| Component | Purpose | Status |
|-----------|---------|--------|
| **server.ts** | Express + WebSocket | ✅ Ready |
| **TemplateGenerator** | Create test boilerplate | ✅ Ready |
| **LocatorCapture** | Extract element locators | ✅ Ready |
| **CodeGenerator** | Generate action code | ✅ Ready |
| **FileWriter** | Safe file insertion | ✅ Ready |
| **ActionHandler** | Insert/Run workflows | ✅ Ready |
| **TestRunner** | Execute tests | ✅ Ready |
| **CDPManager** | Chrome automation | ⏳ TODO |
| **ActionExecutor** | Execute browser actions | ⏳ TODO |

## 📱 UI Components

| Component | Location | Status |
|-----------|----------|--------|
| **App** | src/ui/App.tsx | ✅ Ready |
| **LeftPanel** | src/ui/components/LeftPanel.tsx | ✅ Ready |
| **RightPanel** | src/ui/components/RightPanel.tsx | ✅ Ready |
| **ActionPopup** | src/ui/components/ActionPopup.tsx | ✅ Ready |
| **LocatorPopup** | src/ui/components/LocatorPopup.tsx | ⏳ TODO |

## 🔌 WebSocket Message Types

### Client → Server
```javascript
// Generate template
{ type: 'GENERATE_TEMPLATE', payload: { testName, url } }

// Generate locators
{ type: 'GENERATE_LOCATORS', payload: { elementInfo } }

// Generate code
{ type: 'GENERATE_CODE', payload: { locator, actionType, parameters } }

// Insert code
{ type: 'INSERT_CODE', payload: { testFilePath, code, insertionPoint } }

// Insert and run
{ type: 'INSERT_AND_RUN', payload: { testFilePath, code, insertionPoint, testName } }
```

### Server → Client
```javascript
// Template generated
{ type: 'TEMPLATE_GENERATED', payload: { template } }

// Locators generated
{ type: 'LOCATORS_GENERATED', payload: { locators } }

// Code generated
{ type: 'CODE_GENERATED', payload: { fullCode } }

// Code inserted
{ type: 'CODE_INSERTED', payload: { success } }

// Insert and run complete
{ type: 'INSERT_AND_RUN_COMPLETE', payload: { success, output, error } }

// Error occurred
{ type: 'ERROR', error: 'message' }
```

## 🎨 Code Generation Examples

### Click Action
```typescript
// Input: locator (css, '.button'), actionType ('click')
// Output:
logger.info('Captured: Click element');
await this.page.css('.button').click();
```

### Type Action
```typescript
// Input: locator (id, 'email'), actionType ('type'), text ('test@example.com')
// Output:
logger.info('Captured: Type test@example.com');
await this.page.id('email').type('test@example.com');
```

### Assertion
```typescript
// Input: locator (xpath, '//button'), assertion ('toBeVisible')
// Output:
logger.info('Captured: Verify element is visible');
await sanExpect(this.page.xpath('//button')).toBeVisible();
```

## 📍 File Paths Reference

```
src/
├── server.ts                          # Main server
├── content-script.ts                  # Browser script
├── services/
│   ├── TemplateGenerator.ts
│   ├── LocatorCapture.ts
│   ├── CodeGenerator.ts
│   ├── FileWriter.ts
│   ├── ActionHandler.ts
│   ├── TestRunner.ts
│   ├── CDPManager.ts (TODO)
│   └── ActionExecutor.ts (TODO)
├── types/
│   └── index.ts                       # Type definitions
└── ui/
    ├── App.tsx
    ├── App.css
    ├── index.tsx
    └── components/
        ├── LeftPanel.tsx
        ├── RightPanel.tsx
        ├── ActionPopup.tsx
        └── LocatorPopup.tsx (TODO)

public/
└── index.html                         # HTML entry

Config Files:
├── package.json
├── tsconfig.json
└── webpack.config.js
```

## 🐛 Debug Tips

### Check Server Logs
```bash
# Start server with debug output
DEBUG=* npm run dev:server
```

### Check WebSocket Connection
```javascript
// In browser DevTools console:
ws.readyState  // 0=CONNECTING, 1=OPEN, 2=CLOSING, 3=CLOSED
```

### Validate Generated Code
```bash
# Test code generation service
npm run test -- --grep "CodeGenerator"
```

### Check File Operations
```bash
# Verify backup files exist
ls -la *.backup
```

## 💻 Environment Variables

```bash
# Custom test directory
TEST_DIR=/path/to/tests npm run dev:server

# Port configuration
PORT=3001 npm run dev:server

# Debug mode
DEBUG=sangle:* npm run dev:server
```

## 📊 Performance Tips

1. **Build optimization**: `npm run build -- --mode production`
2. **Code splitting**: Already configured in webpack
3. **Development mode**: Use `npm run dev` for faster builds
4. **Source maps**: Enabled for debugging, disable in production

## 🔐 Security Notes

- ✅ File backups prevent data loss
- ✅ Input validation on all services
- ✅ WebSocket CORS configured
- ⚠️ TODO: Add authentication for production
- ⚠️ TODO: Validate file paths to prevent traversal attacks

## 🚀 Deployment Checklist

- [ ] Run `npm run build`
- [ ] Verify no TypeScript errors
- [ ] Test all services
- [ ] Check WebSocket connection
- [ ] Validate file operations
- [ ] Performance test
- [ ] Security review
- [ ] Documentation complete

## 📞 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Build fails | `npm install && npm run build` |
| Port in use | `lsof -i :3000` then `kill -9 <PID>` |
| WebSocket error | Check browser console, verify server running |
| File write fails | Check permissions, verify path exists |
| Type errors | `npm run type-check` for full report |

## 🎓 Code Style

- **Language:** TypeScript (strict mode)
- **React:** Functional components with hooks
- **Naming:** camelCase for functions, PascalCase for classes/components
- **Comments:** JSDoc for public methods
- **Imports:** Organize by type (external, internal, types)

## 📈 Metrics

- **Lines of Code:** 1,492
- **Components:** 14
- **Services:** 6 (+ 2 TODO)
- **Build Time:** ~5 seconds
- **Bundle Size:** ~176 KB (before optimization)

---

## 🎯 Next Steps

1. Read [GETTING_STARTED.md](GETTING_STARTED.md)
2. Install dependencies: `npm install`
3. Build project: `npm run build`
4. Start server: `npm run dev:server`
5. Open http://localhost:3000

---

**Last Updated:** December 3, 2025
**Version:** 1.0.0-alpha
**Status:** Ready for development phase
