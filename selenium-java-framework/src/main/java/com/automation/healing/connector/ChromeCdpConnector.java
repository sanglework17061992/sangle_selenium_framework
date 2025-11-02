package com.automation.healing.connector;

import com.automation.utils.LoggerUtil;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.devtools.DevTools;
import org.openqa.selenium.devtools.HasDevTools;
import org.openqa.selenium.remote.RemoteWebDriver;

import java.util.*;

/**
 * ChromeCdpConnector - Chrome DevTools Protocol implementation
 * Captures DOM snapshots and screenshots using Chrome DevTools
 */
public class ChromeCdpConnector implements CdpConnector {
    
    private static final String TIMESTAMP_KEY = "timestamp";
    private static final String CAPTURE_METHOD_KEY = "captureMethod";
    private static final String URL_KEY = "url";
    private static final String TITLE_KEY = "title";
    
    private final WebDriver driver;
    private DevTools devTools;
    private boolean isInitialized = false;
    
    public ChromeCdpConnector(WebDriver driver) {
        this.driver = driver;
    }
    
    @Override
    public void initialize(WebDriver driver) {
        try {
            if (driver instanceof HasDevTools) {
                HasDevTools hasDevTools = (HasDevTools) driver;
                this.devTools = hasDevTools.getDevTools();
                
                // Suppress CDP version warnings for unsupported versions
                System.setProperty("webdriver.chrome.silentOutput", "true");
                
                this.devTools.createSession();
                this.isInitialized = true;
                LoggerUtil.info("CDP connector initialized successfully with full support");
            } else {
                LoggerUtil.warn("CDP connector requires HasDevTools-capable driver, falling back to JavaScript execution");
                this.isInitialized = false;
            }
        } catch (Exception e) {
            // Gracefully handle CDP version mismatch (common with newer Chrome versions)
            String errorMsg = e.getMessage();
            if (errorMsg != null && errorMsg.contains("no-op implementation")) {
                LoggerUtil.info("CDP connector falling back to JavaScript execution (Chrome version not fully supported)");
            } else {
                LoggerUtil.warn("CDP connector initialization failed, using JavaScript fallback: " + e.getMessage());
            }
            this.isInitialized = false;
        }
    }
    
    @Override
    public boolean isAvailable() {
        return isInitialized && devTools != null;
    }
    
    @Override
    public Map<String, Object> captureDomSnapshot() {
        return captureDomSnapshot(false, false);
    }
    
    @Override
    public Map<String, Object> captureDomSnapshot(boolean includeComputedStyles, boolean includeEventListeners) {
        if (!isAvailable()) {
            LoggerUtil.warn("CDP not available, falling back to page source");
            return capturePageSourceFallback();
        }
        
        try {
            LoggerUtil.info("Capturing DOM snapshot via CDP");
            
            // Use JavaScript to get DOM information since executeCdpCommand may not be available
            JavascriptExecutor jsExecutor = (JavascriptExecutor) driver;
            
            // Get all elements with their attributes
            String jsScript = 
                "function getAllElements() {" +
                "  var elements = [];" +
                "  var allNodes = document.querySelectorAll('*');" +
                "  for (var i = 0; i < allNodes.length; i++) {" +
                "    var el = allNodes[i];" +
                "    var attrs = {};" +
                "    for (var j = 0; j < el.attributes.length; j++) {" +
                "      attrs[el.attributes[j].name] = el.attributes[j].value;" +
                "    }" +
                "    elements.push({" +
                "      tagName: el.tagName.toLowerCase()," +
                "      id: el.id," +
                "      className: el.className," +
                "      textContent: el.textContent ? el.textContent.trim().substring(0, 100) : ''," +
                "      attributes: attrs," +
                "      xpath: getXPath(el)," +
                "      visible: isVisible(el)," +
                "      enabled: !el.disabled" +
                "    });" +
                "  }" +
                "  return elements;" +
                "}" +
                "function getXPath(element) {" +
                "  if (element.id !== '') return '//*[@id=\"' + element.id + '\"]';" +
                "  if (element === document.body) return '/html/body';" +
                "  var ix = 0;" +
                "  var siblings = element.parentNode.childNodes;" +
                "  for (var i = 0; i < siblings.length; i++) {" +
                "    var sibling = siblings[i];" +
                "    if (sibling === element) return getXPath(element.parentNode) + '/' + element.tagName.toLowerCase() + '[' + (ix + 1) + ']';" +
                "    if (sibling.nodeType === 1 && sibling.tagName === element.tagName) ix++;" +
                "  }" +
                "}" +
                "function isVisible(el) {" +
                "  return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);" +
                "}" +
                "return getAllElements();";
            
            Object elementsData = jsExecutor.executeScript(jsScript);
            
            // Build snapshot structure
            Map<String, Object> snapshot = new HashMap<>();
            snapshot.put("elements", elementsData);
            snapshot.put(TIMESTAMP_KEY, System.currentTimeMillis());
            snapshot.put(URL_KEY, getCurrentUrl());
            snapshot.put(TITLE_KEY, driver.getTitle());
            snapshot.put("includeComputedStyles", includeComputedStyles);
            snapshot.put("includeEventListeners", includeEventListeners);
            snapshot.put(CAPTURE_METHOD_KEY, "CDP_JS");
            
            LoggerUtil.info("DOM snapshot captured successfully");
            return snapshot;
            
        } catch (Exception e) {
            LoggerUtil.error("Failed to capture DOM snapshot via CDP: " + e.getMessage(), e);
            return capturePageSourceFallback();
        }
    }
    
    @Override
    public byte[] captureScreenshot() {
        try {
            // Use standard Selenium screenshot
            return ((org.openqa.selenium.TakesScreenshot) driver).getScreenshotAs(org.openqa.selenium.OutputType.BYTES);
        } catch (Exception e) {
            LoggerUtil.error("Failed to capture screenshot: " + e.getMessage(), e);
            return new byte[0];
        }
    }
    
    @Override
    public String getCurrentUrl() {
        try {
            return driver.getCurrentUrl();
        } catch (Exception e) {
            LoggerUtil.error("Failed to get current URL: " + e.getMessage(), e);
            return "unknown";
        }
    }
    
    @Override
    public Map<String, String> getBrowserInfo() {
        Map<String, String> browserInfo = new HashMap<>();
        
        try {
            if (driver instanceof RemoteWebDriver) {
                Capabilities caps = ((RemoteWebDriver) driver).getCapabilities();
                browserInfo.put("browserName", caps.getBrowserName());
                browserInfo.put("browserVersion", caps.getBrowserVersion());
                browserInfo.put("platformName", caps.getPlatformName().toString());
            }
            
            browserInfo.put("driverClass", driver.getClass().getSimpleName());
            browserInfo.put("cdpAvailable", String.valueOf(isAvailable()));
            
        } catch (Exception e) {
            LoggerUtil.error("Failed to get browser info: " + e.getMessage(), e);
            browserInfo.put("error", e.getMessage());
        }
        
        return browserInfo;
    }
    
    @Override
    public Object evaluateJavaScript(String expression) {
        try {
            JavascriptExecutor jsExecutor = (JavascriptExecutor) driver;
            return jsExecutor.executeScript(expression);
        } catch (Exception e) {
            LoggerUtil.error("Failed to evaluate JavaScript: " + e.getMessage(), e);
            return null;
        }
    }
    
    @Override
    public void close() {
        try {
            if (devTools != null) {
                devTools.close();
                LoggerUtil.info("CDP connection closed");
            }
        } catch (Exception e) {
            LoggerUtil.error("Error closing CDP connection: " + e.getMessage(), e);
        } finally {
            isInitialized = false;
            devTools = null;
        }
    }
    
    /**
     * Fallback method to capture page source when CDP is not available
     */
    private Map<String, Object> capturePageSourceFallback() {
        try {
            LoggerUtil.info("Using page source fallback for DOM capture");
            
            Map<String, Object> snapshot = new HashMap<>();
            snapshot.put("pageSource", driver.getPageSource());
            snapshot.put(TIMESTAMP_KEY, System.currentTimeMillis());
            snapshot.put(URL_KEY, getCurrentUrl());
            snapshot.put(TITLE_KEY, driver.getTitle());
            snapshot.put(CAPTURE_METHOD_KEY, "PAGE_SOURCE_FALLBACK");
            
            return snapshot;
            
        } catch (Exception e) {
            LoggerUtil.error("Fallback page source capture failed: " + e.getMessage(), e);
            Map<String, Object> errorSnapshot = new HashMap<>();
            errorSnapshot.put("error", e.getMessage());
            errorSnapshot.put(TIMESTAMP_KEY, System.currentTimeMillis());
            errorSnapshot.put(CAPTURE_METHOD_KEY, "FAILED");
            return errorSnapshot;
        }
    }
}