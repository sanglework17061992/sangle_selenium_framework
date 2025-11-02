package com.automation.pages;

import com.automation.core.ConfigManager;
import com.automation.utils.LoggerUtil;
import com.automation.utils.WaitUtil;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.JavascriptExecutor;

/**
 * BasePage - Base class for all page objects
 * Provides common functionality for all pages
 */
public abstract class BasePage {
    protected final WebDriver driver;
    protected final ConfigManager config;
    protected final WaitUtil waitHelper;
    
    protected BasePage(WebDriver driver) {
        this.driver = driver;
        this.config = ConfigManager.getInstance();
        this.waitHelper = new WaitUtil(driver, config.getExplicitWait());
    }
    
    /**
     * Get current page title
     * @return Page title
     */
    public String getPageTitle() {
        return driver.getTitle();
    }
    
    /**
     * Get current page URL
     * @return Current URL
     */
    public String getCurrentUrl() {
        return driver.getCurrentUrl();
    }
    
    /**
     * Navigate to specific URL
     * @param url URL to navigate to
     */
    public void navigateToUrl(String url) {
        driver.get(url);
        LoggerUtil.logPageNavigation("Unknown", url);
        waitForPageLoad();
    }
    
    /**
     * Refresh current page
     */
    public void refreshPage() {
        driver.navigate().refresh();
        LoggerUtil.info("Page refreshed");
        waitForPageLoad();
    }
    
    /**
     * Navigate back
     */
    public void navigateBack() {
        driver.navigate().back();
        LoggerUtil.info("Navigated back");
        waitForPageLoad();
    }
    
    /**
     * Navigate forward
     */
    public void navigateForward() {
        driver.navigate().forward();
        LoggerUtil.info("Navigated forward");
        waitForPageLoad();
    }
    
    /**
     * Wait for page to load completely
     */
    public void waitForPageLoad() {
        waitHelper.waitForCustomCondition(
            webDriver -> ((JavascriptExecutor) webDriver)
                .executeScript("return document.readyState").equals("complete"),
            "page to load completely"
        );
    }
    
    /**
     * Execute JavaScript
     * @param script JavaScript to execute
     * @return Result of script execution
     */
    public Object executeJavaScript(String script) {
        return ((JavascriptExecutor) driver).executeScript(script);
    }
    
    /**
     * Execute JavaScript with arguments
     * @param script JavaScript to execute
     * @param args Arguments to pass to script
     * @return Result of script execution
     */
    public Object executeJavaScript(String script, Object... args) {
        return ((JavascriptExecutor) driver).executeScript(script, args);
    }
    
    /**
     * Scroll to top of page
     */
    public void scrollToTop() {
        executeJavaScript("window.scrollTo(0, 0);");
        LoggerUtil.info("Scrolled to top of page");
    }
    
    /**
     * Scroll to bottom of page
     */
    public void scrollToBottom() {
        executeJavaScript("window.scrollTo(0, document.body.scrollHeight);");
        LoggerUtil.info("Scrolled to bottom of page");
    }
    
    /**
     * Scroll by specified pixels
     * @param x Horizontal scroll
     * @param y Vertical scroll
     */
    public void scrollBy(int x, int y) {
        executeJavaScript("window.scrollBy(" + x + ", " + y + ");");
        LoggerUtil.info("Scrolled by x:" + x + ", y:" + y);
    }
    
    /**
     * Check if page contains specific text
     * @param text Text to search for
     * @return true if text is found on page
     */
    public boolean pageContainsText(String text) {
        String pageSource = driver.getPageSource();
        return pageSource.contains(text);
    }
    
    /**
     * Wait for page URL to contain specific text
     * @param urlText Text that should be in URL
     * @return true when URL contains text
     */
    public boolean waitForUrlContains(String urlText) {
        return waitHelper.waitForUrlContains(urlText);
    }
    
    /**
     * Wait for page title to contain specific text
     * @param titleText Text that should be in title
     * @return true when title contains text
     */
    public boolean waitForTitleContains(String titleText) {
        return waitHelper.waitForTitleContains(titleText);
    }
    
    /**
     * Get page load state
     * @return Page ready state (loading, interactive, complete)
     */
    public String getPageLoadState() {
        return (String) executeJavaScript("return document.readyState");
    }
    
    /**
     * Check if page is fully loaded
     * @return true if page is complete
     */
    public boolean isPageLoaded() {
        return "complete".equals(getPageLoadState());
    }
}