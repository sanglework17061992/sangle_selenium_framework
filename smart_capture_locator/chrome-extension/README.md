# Smart Locator Inspector - Chrome Extension

🎯 **Professional DOM locator generator for QA automation engineers**

## 🚀 Features

- **Smart XPath Generation** with scoring system (90-100 points)
- **Framework Detection** (Angular, React, Vue patterns)
- **Uniqueness Validation** for reliable locators
- **Real-time Element Highlighting**
- **One-click Copy to Clipboard**
- **Non-intrusive Floating Modal**
- **Draggable Interface**

## 📦 Installation

### From Source (Development)

1. **Download/Clone** this extension folder
2. **Open Chrome** and go to `chrome://extensions/`
3. **Enable Developer Mode** (toggle in top right)
4. **Click "Load unpacked"** and select this folder
5. **Pin the extension** to your toolbar for easy access

### From Chrome Web Store (Coming Soon)
The extension will be available in the Chrome Web Store once published.

## 🎯 How to Use

### Activation
1. **Click the extension icon** 🎯 in your toolbar
2. **Click "Activate Inspector"** in the popup
3. **Start hovering** over elements on any webpage

### Controls
- **Hover** - Inspect elements and see locators
- **Ctrl Key** - Freeze current element for detailed analysis
- **Click Locators** - Copy to clipboard instantly
- **ESC Key** - Toggle inspector on/off
- **Drag Modal** - Move the inspector window around

### Locator Types Generated
- **Smart XPath** - AI-powered with uniqueness scoring
- **ID Selectors** - Direct element IDs
- **CSS Selectors** - Class-based selectors
- **Attribute Selectors** - data-testid, name, role, etc.
- **Text-based Locators** - For elements with stable text

## 🔧 Technical Details

### Architecture
- **Manifest V3** - Latest Chrome extension standard
- **Content Scripts** - Inject inspector into web pages
- **Service Worker** - Background processing
- **Native Chrome APIs** - For clipboard and tab management

### Permissions
- `activeTab` - Access current tab for inspection
- `scripting` - Inject content scripts
- `storage` - Save user preferences
- `<all_urls>` - Work on any website

### Browser Compatibility
- **Chrome 88+** (Manifest V3 support)
- **Edge 88+** (Chromium-based)
- **Opera 74+** (Chromium-based)

## 🆚 Advantages Over Node.js Version

| Feature | Chrome Extension | Node.js Tool |
|---------|------------------|--------------|
| Installation | One-click install | Requires Node.js setup |
| Performance | Native browser APIs | External automation |
| Accessibility | Always available | Manual launch required |
| Updates | Auto-update via store | Manual git pull |
| Distribution | Chrome Web Store | GitHub repository |
| Cross-site | Works everywhere | Single session |

## ⚙️ Configuration

The extension works out-of-the-box with smart defaults. Future versions will include:
- Custom XPath generation strategies
- Framework detection sensitivity
- UI theme customization
- Export/import settings

## 🐛 Troubleshooting

### Extension Not Working?
1. **Refresh the page** after installing
2. **Check Developer Mode** is enabled
3. **Reload the extension** in chrome://extensions/
4. **Check browser console** for error messages

### Locators Not Copying?
1. **Check clipboard permissions** in Chrome settings
2. **Try right-click → Inspect** to verify element access
3. **Disable other extension conflicts**

### Performance Issues?
1. **Close unused tabs** to free memory
2. **Disable inspector** when not needed
3. **Update Chrome** to latest version

## 🔄 Updates

- **v1.0.0** - Initial release with core functionality
- **v1.1.0** - DOM tree hierarchy viewer (planned)
- **v1.2.0** - Framework-specific optimizations (planned)
- **v1.3.0** - Bulk export features (planned)

## 👨‍💻 Development

### Project Structure
```
chrome-extension/
├── manifest.json      # Extension configuration
├── background.js      # Service worker
├── content.js         # Main inspector logic
├── popup.html         # Extension popup UI
├── popup.js           # Popup interactions
├── icons/             # Extension icons
└── README.md          # This file
```

### Building from Source
1. Clone the repository
2. Make your changes
3. Load unpacked in Chrome
4. Test on various websites
5. Submit pull request

## 📄 License

MIT License - Feel free to use, modify, and distribute.

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create feature branch
3. Add tests if applicable
4. Submit pull request

## 📞 Support

- **GitHub Issues**: Report bugs and feature requests
- **Email**: sang.le@agest.vn
- **Documentation**: Check README for common solutions

---

**Made with ❤️ for QA Engineers by QA Engineers**