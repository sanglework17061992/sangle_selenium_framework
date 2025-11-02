package com.automation.healing.connector;

import com.automation.utils.LoggerUtil;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.RemoteWebDriver;

import java.util.*;

/**
 * SimpleDomConnector - Simplified DOM capture without CDP complexity
 * Uses JavaScript execution and PageSource for reliable element discovery
 */
public class SimpleDomConnector {
    
    private static final String TIMESTAMP_KEY = "timestamp";
    private static final String CAPTURE_METHOD_KEY = "captureMethod";
    private static final String URL_KEY = "url";
    private static final String TITLE_KEY = "title";
    
    private final WebDriver driver;
    
    public SimpleDomConnector(WebDriver driver) {
        this.driver = driver;
    }
    
    /**
     * Capture DOM snapshot using JavaScript - more reliable than CDP
     */
    public Map<String, Object> captureDomSnapshot() {
        try {
            LoggerUtil.info("Capturing DOM snapshot via JavaScript");
            
            JavascriptExecutor jsExecutor = (JavascriptExecutor) driver;
            
            // Enhanced JavaScript to get comprehensive element information
            String jsScript = 
                "function getAllElements() {" +
                "  var elements = [];" +
                "  var allNodes = document.querySelectorAll('*');" +
                "  for (var i = 0; i < allNodes.length; i++) {" +
                "    var el = allNodes[i];" +
                "    if (!isRelevantElement(el)) continue;" +
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
                "      enabled: !el.disabled," +
                "      rect: el.getBoundingClientRect()" +
                "    });" +
                "  }" +
                "  return elements;" +
                "}" +
                "function isRelevantElement(el) {" +
                "  var tag = el.tagName.toLowerCase();" +
                "  return tag === 'input' || tag === 'button' || tag === 'select' || " +
                "         tag === 'textarea' || tag === 'a' || tag === 'div' || " +
                "         tag === 'span' || tag === 'form' || tag === 'label' || " +
                "         el.onclick || el.getAttribute('role') || el.id || el.className;" +
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
                "  var style = window.getComputedStyle(el);" +
                "  return style.display !== 'none' && style.visibility !== 'hidden' && " +
                "         style.opacity !== '0' && el.offsetHeight > 0 && el.offsetWidth > 0;" +
                "}" +
                "return getAllElements();";
            
            Object elementsData = jsExecutor.executeScript(jsScript);
            
            // Build comprehensive snapshot
            Map<String, Object> snapshot = new HashMap<>();
            snapshot.put("elements", elementsData);
            snapshot.put("pageSource", driver.getPageSource()); // Backup for regex parsing
            snapshot.put(TIMESTAMP_KEY, System.currentTimeMillis());
            snapshot.put(URL_KEY, getCurrentUrl());
            snapshot.put(TITLE_KEY, driver.getTitle());
            snapshot.put(CAPTURE_METHOD_KEY, "JAVASCRIPT_ENHANCED");
            
            LoggerUtil.info("DOM snapshot captured successfully with " + 
                           ((List<?>) elementsData).size() + " elements");
            return snapshot;
            
        } catch (Exception e) {
            LoggerUtil.error("Failed to capture DOM snapshot via JavaScript: " + e.getMessage(), e);
            return capturePageSourceFallback();
        }
    }
    
    /**
     * Fallback to PageSource when JavaScript fails
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
            LoggerUtil.error("Page source capture failed: " + e.getMessage(), e);
            Map<String, Object> errorSnapshot = new HashMap<>();
            errorSnapshot.put("error", e.getMessage());
            errorSnapshot.put(TIMESTAMP_KEY, System.currentTimeMillis());
            errorSnapshot.put(CAPTURE_METHOD_KEY, "FAILED");
            return errorSnapshot;
        }
    }
    
    public byte[] captureScreenshot() {
        try {
            return ((org.openqa.selenium.TakesScreenshot) driver).getScreenshotAs(org.openqa.selenium.OutputType.BYTES);
        } catch (Exception e) {
            LoggerUtil.error("Failed to capture screenshot: " + e.getMessage(), e);
            return new byte[0];
        }
    }
    
    public String getCurrentUrl() {
        try {
            return driver.getCurrentUrl();
        } catch (Exception e) {
            LoggerUtil.error("Failed to get current URL: " + e.getMessage(), e);
            return "unknown";
        }
    }
    
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
            browserInfo.put("method", "JavaScript+PageSource");
            
        } catch (Exception e) {
            LoggerUtil.error("Failed to get browser info: " + e.getMessage(), e);
            browserInfo.put("error", e.getMessage());
        }
        
        return browserInfo;
    }
    
    public Object evaluateJavaScript(String expression) {
        try {
            JavascriptExecutor jsExecutor = (JavascriptExecutor) driver;
            return jsExecutor.executeScript(expression);
        } catch (Exception e) {
            LoggerUtil.error("Failed to evaluate JavaScript: " + e.getMessage(), e);
            return null;
        }
    }
}