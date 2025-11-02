package com.automation.elements;

import com.automation.core.ConfigManager;
import com.automation.utils.Action;
import com.automation.utils.LoggerUtil;
import com.automation.utils.RetryUtil;
import com.automation.utils.WaitUtil;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

/**
 * BaseElement - Abstract base class for all UI elements
 * Provides common functionality for auto-wait, auto-retry, and logging
 */
public abstract class BaseElement {
    protected final WebDriver driver;
    protected final By locator;
    protected final String name;
    protected final WaitUtil waitHelper;
    protected final int retryCount;
    
    /**
     * Constructor for BaseElement
     * @param driver WebDriver instance
     * @param locator Element locator
     * @param name Element name for logging
     */
    protected BaseElement(WebDriver driver, By locator, String name) {
        this.driver = driver;
        this.locator = locator;
        this.name = name;
        this.waitHelper = new WaitUtil(driver, ConfigManager.getInstance().getExplicitWait());
        this.retryCount = ConfigManager.getInstance().getRetryCount();
    }
    
    /**
     * Get the WebElement with auto-wait and retry
     * @return WebElement
     */
    public WebElement getElement() {
        return RetryUtil.executeWithRetry(
            () -> waitHelper.waitForPresence(locator, name),
            name,
            Action.GET_ELEMENT.toString(),
            retryCount
        );
    }
    
    /**
     * Check if element is displayed
     * @return true if element is displayed
     */
    public boolean isDisplayed() {
        return RetryUtil.executeWithRetry(
            () -> {
                try {
                    WebElement element = waitHelper.waitForPresence(locator, name);
                    return element.isDisplayed();
                } catch (Exception e) {
                    return false;
                }
            },
            name,
            Action.CHECK_IF_DISPLAYED.toString(),
            retryCount
        );
    }
    
    /**
     * Check if element is enabled
     * @return true if element is enabled
     */
    public boolean isEnabled() {
        return RetryUtil.executeWithRetry(
            () -> {
                WebElement element = getElement();
                return element.isEnabled();
            },
            name,
            Action.CHECK_IF_ENABLED.toString(),
            retryCount
        );
    }
    
    /**
     * Click the element
     */
    public void click() {
        long startTime = System.currentTimeMillis();
        LoggerUtil.logActionStart(name, Action.CLICK.toString());
        
        RetryUtil.executeWithRetry(
            () -> {
                WebElement element = waitHelper.waitForClickability(locator, name);
                element.click();
            },
            name,
            Action.CLICK.toString(),
            retryCount
        );
        
        long duration = System.currentTimeMillis() - startTime;
        LoggerUtil.logActionSuccess(name, Action.CLICK.toString(), duration);
    }
    
    /**
     * Get text from element
     * @return Element text
     */
    public String getText() {
        long startTime = System.currentTimeMillis();
    LoggerUtil.logActionStart(name, Action.GET_TEXT.toString());
        
        String text = RetryUtil.executeWithRetry(
            () -> {
                WebElement element = waitHelper.waitForVisibility(locator, name);
                return element.getText();
            },
            name,
            Action.GET_TEXT.toString(),
            retryCount
        );
        
        long duration = System.currentTimeMillis() - startTime;
    LoggerUtil.logActionSuccess(name, Action.GET_TEXT.toString(), duration);
        
        return text;
    }
    
    /**
     * Get attribute value from element
     * @param attributeName Name of attribute
     * @return Attribute value
     */
    public String getAttribute(String attributeName) {
        return RetryUtil.executeWithRetry(
            () -> {
                WebElement element = getElement();
                return element.getAttribute(attributeName);
            },
            name,
            Action.GET_ATTRIBUTE.toString() + " '" + attributeName + "'",
            retryCount
        );
    }
    
    /**
     * Get CSS property value from element
     * @param propertyName Name of CSS property
     * @return CSS property value
     */
    public String getCssValue(String propertyName) {
        return RetryUtil.executeWithRetry(
            () -> {
                WebElement element = getElement();
                return element.getCssValue(propertyName);
            },
            name,
            Action.GET_CSS_PROPERTY.toString() + " '" + propertyName + "'",
            retryCount
        );
    }
    
    /**
     * Wait for element to be visible
     */
    public void waitForVisible() {
        waitHelper.waitForVisibility(locator, name);
    }
    
    /**
     * Wait for element to be clickable
     */
    public void waitForClickable() {
        waitHelper.waitForClickability(locator, name);
    }
    
    /**
     * Wait for element to disappear
     */
    public void waitForInvisible() {
        waitHelper.waitForInvisibility(locator, name);
    }
    
    /**
     * Wait for element to have specific text
     * @param text Expected text
     */
    public void waitForText(String text) {
        waitHelper.waitForTextPresent(locator, text, name);
    }
    
    /**
     * Wait for element to have specific attribute value
     * @param attribute Attribute name
     * @param value Expected attribute value
     */
    public void waitForAttribute(String attribute, String value) {
        waitHelper.waitForAttribute(locator, attribute, value, name);
    }
    
    /**
     * Scroll element into view
     */
    public void scrollIntoView() {
        RetryUtil.executeWithRetry(
            () -> {
                WebElement element = getElement();
                ((org.openqa.selenium.JavascriptExecutor) driver)
                    .executeScript("arguments[0].scrollIntoView(true);", element);
            },
            name,
            Action.SCROLL_INTO_VIEW.toString(),
            retryCount
        );
    }
    
    /**
     * Highlight element for debugging
     */
    public void highlight() {
        RetryUtil.executeWithRetry(
            () -> {
                WebElement element = getElement();
                ((org.openqa.selenium.JavascriptExecutor) driver)
                    .executeScript("arguments[0].style.border='3px solid red'", element);
            },
            name,
            Action.HIGHLIGHT.toString(),
            retryCount
        );
    }
    
    /**
     * Get element name
     * @return Element name
     */
    public String getName() {
        return name;
    }
    
    /**
     * Get element locator
     * @return Element locator
     */
    public By getLocator() {
        return locator;
    }
}