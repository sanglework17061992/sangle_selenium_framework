package com.automation.elements;

import com.automation.constants.DriverConstants;
import com.automation.utils.LoggerUtil;
import com.automation.utils.RetryUtil;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

/**
 * Link - Wrapper class for link/anchor elements
 * Extends BaseElement with link specific functionality
 */
public class Link extends BaseElement {
    
    public Link(WebDriver driver, By locator, String name) {
        super(driver, locator, name);
    }
    
    /**
     * Get href attribute value
     * @return URL from href attribute
     */
    public String getHref() {
        return getAttribute("href");
    }
    
    /**
     * Get target attribute value
     * @return Target attribute value (_blank, _self, etc.)
     */
    public String getTarget() {
        return getAttribute("target");
    }
    
    /**
     * Navigate to the link URL
     */
    public void navigate() {
        long startTime = System.currentTimeMillis();
        String href = getHref();
        LoggerUtil.logActionStart(name, "navigate to: " + href);
        
        RetryUtil.executeWithRetry(
            () -> driver.get(href),
            name,
            "navigate to link",
            retryCount
        );
        
        long duration = System.currentTimeMillis() - startTime;
        LoggerUtil.logActionSuccess(name, "navigate to link", duration);
    }
    
    /**
     * Open link in new tab using JavaScript
     */
    public void openInNewTab() {
        long startTime = System.currentTimeMillis();
        LoggerUtil.logActionStart(name, DriverConstants.OPEN_IN_NEW_TAB);
        
        RetryUtil.executeWithRetry(
            () -> {
                String href = getHref();
                ((org.openqa.selenium.JavascriptExecutor) driver)
                    .executeScript("window.open('" + href + "', '_blank');");
            },
            name,
            DriverConstants.OPEN_IN_NEW_TAB,
            retryCount
        );
        
        long duration = System.currentTimeMillis() - startTime;
        LoggerUtil.logActionSuccess(name, DriverConstants.OPEN_IN_NEW_TAB, duration);
    }
    
    /**
     * Check if link opens in new tab/window
     * @return true if target is _blank
     */
    public boolean opensInNewTab() {
        String target = getTarget();
        return "_blank".equals(target);
    }
    
    /**
     * Right click on link to open context menu
     */
    public void rightClick() {
        long startTime = System.currentTimeMillis();
        LoggerUtil.logActionStart(name, DriverConstants.RIGHT_CLICK);
        
        RetryUtil.executeWithRetry(
            () -> {
                org.openqa.selenium.interactions.Actions actions = 
                    new org.openqa.selenium.interactions.Actions(driver);
                actions.contextClick(getElement()).perform();
            },
            name,
            DriverConstants.RIGHT_CLICK,
            retryCount
        );
        
        long duration = System.currentTimeMillis() - startTime;
        LoggerUtil.logActionSuccess(name, DriverConstants.RIGHT_CLICK, duration);
    }
    
    /**
     * Get link text (same as getText but more semantic for links)
     * @return Link text
     */
    public String getLinkText() {
        return getText();
    }
    
    /**
     * Check if link is external (different domain)
     * @return true if link points to external domain
     */
    public boolean isExternal() {
        String href = getHref();
        if (href == null || href.isEmpty()) {
            return false;
        }
        
        String currentUrl = driver.getCurrentUrl();
        try {
            java.net.URL currentDomain = new java.net.URL(currentUrl);
            java.net.URL linkDomain = new java.net.URL(href);
            return !currentDomain.getHost().equals(linkDomain.getHost());
        } catch (java.net.MalformedURLException e) {
            LoggerUtil.warn("Invalid URL format: " + href);
            return false;
        }
    }
}