// Popup script for Smart Locator Inspector
document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('toggle-inspector');
  const helpBtn = document.getElementById('open-help');
  const settingsBtn = document.getElementById('open-settings');
  const statusDiv = document.getElementById('status');
  
  console.log('Smart Locator Inspector popup loaded');
  
  // Check current inspector status
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      console.log('Checking status on tab:', tabs[0].url);
      chrome.tabs.sendMessage(tabs[0].id, { type: 'CHECK_STATUS' }, (response) => {
        if (chrome.runtime.lastError) {
          console.log('No content script yet, that\'s normal');
          // Clear the error
          chrome.runtime.lastError;
          updateStatus(false);
        } else {
          console.log('Status response:', response);
          if (response && response.active) {
            updateStatus(true);
          } else {
            updateStatus(false);
          }
        }
      });
    }
  });
  
  // Toggle inspector
  toggleBtn.addEventListener('click', () => {
    console.log('Toggle button clicked');
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        console.log('Sending toggle message to tab:', tabs[0].url);
        chrome.tabs.sendMessage(tabs[0].id, { type: 'TOGGLE_INSPECTOR' }, (response) => {
          console.log('Toggle response:', response);
          if (chrome.runtime.lastError) {
            console.log('Error or no content script, injecting...');
            // Clear the error
            chrome.runtime.lastError;
            // Content script not loaded, inject it first
            chrome.scripting.executeScript({
              target: { tabId: tabs[0].id },
              files: ['content.js']
            }).then(() => {
              console.log('Content script injected, trying toggle again...');
              setTimeout(() => {
                chrome.tabs.sendMessage(tabs[0].id, { type: 'TOGGLE_INSPECTOR' }, (response) => {
                  if (chrome.runtime.lastError) {
                    console.error('Still having issues:', chrome.runtime.lastError);
                    chrome.runtime.lastError; // Clear error
                    alert('Unable to activate inspector. Please refresh the page.');
                  } else {
                    console.log('Second toggle response:', response);
                    if (response) {
                      updateStatus(response.active);
                    }
                  }
                });
              }, 500);
            }).catch(error => {
              console.error('Failed to inject content script:', error);
              alert('Failed to activate inspector. Please refresh the page and try again.');
            });
          } else if (response) {
            updateStatus(response.active);
          }
        });
      }
    });
  });
  
  // Help button
  helpBtn.addEventListener('click', () => {
    chrome.tabs.create({
      url: 'https://github.com/sangle-agest/capture_locator_tool#readme'
    });
  });
  
  // Settings button (placeholder for now)
  settingsBtn.addEventListener('click', () => {
    alert('Settings panel coming soon! For now, use Ctrl+click to freeze elements and ESC to toggle.');
  });
  
  function updateStatus(isActive) {
    console.log('Updating status to:', isActive);
    if (isActive) {
      statusDiv.textContent = 'Inspector: Active ✅';
      statusDiv.className = 'status active';
      toggleBtn.textContent = '⏹️ Deactivate Inspector';
    } else {
      statusDiv.textContent = 'Inspector: Inactive ❌';
      statusDiv.className = 'status inactive';
      toggleBtn.textContent = '🚀 Activate Inspector';
    }
  }
});