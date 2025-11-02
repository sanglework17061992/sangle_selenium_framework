// Background Service Worker for Smart Locator Inspector
chrome.runtime.onInstalled.addListener(() => {
  console.log('Smart Locator Inspector installed');
});

// Handle extension icon click
chrome.action.onClicked.addListener(async (tab) => {
  try {
    // Send message to content script to toggle inspector
    await chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_INSPECTOR' });
  } catch (error) {
    console.error('Failed to toggle Smart Locator Inspector:', error);
    // If content script not ready, inject it
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
      // Try again after injection
      setTimeout(async () => {
        await chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_INSPECTOR' });
      }, 100);
    } catch (injectError) {
      console.error('Failed to inject content script:', injectError);
    }
  }
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'COPY_TO_CLIPBOARD') {
    // Handle clipboard operations
    navigator.clipboard.writeText(message.text).then(() => {
      sendResponse({ success: true });
    }).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true; // Keep message channel open for async response
  }
});