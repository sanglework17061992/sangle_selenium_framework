package com.automation.elements;

import com.automation.constants.FrameworkConstants;
import com.automation.utils.LoggerUtil;
import com.automation.utils.RetryUtil;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

/**
 * TextBox - Wrapper class for text input elements
 * Extends BaseElement with text input specific functionality
 */
public class TextBox extends BaseElement {
    
    public TextBox(WebDriver driver, By locator, String name) {
        super(driver, locator, name);
    }
    
    /**
     * Type text into the text box
     * @param text Text to type
     */
    public void type(String text) {
        long startTime = System.currentTimeMillis();
        LoggerUtil.logActionStart(name, "type text: '" + text + "'");
        
        RetryUtil.executeWithRetry(
            () -> {
                WebElement element = waitHelper.waitForVisibility(locator, name);
                element.sendKeys(text);
            },
            name,
            "type text",
            retryCount
        );
        
        long duration = System.currentTimeMillis() - startTime;
        LoggerUtil.logActionSuccess(name, "type text", duration);
    }
    
    /**
     * Clear text box and type new text
     * @param text Text to type
     */
    public void clearAndType(String text) {
        long startTime = System.currentTimeMillis();
        LoggerUtil.logActionStart(name, "clear and type: '" + text + "'");
        
        RetryUtil.executeWithRetry(
            () -> {
                WebElement element = waitHelper.waitForVisibility(locator, name);
                element.clear();
                element.sendKeys(text);
            },
            name,
            "clear and type",
            retryCount
        );
        
        long duration = System.currentTimeMillis() - startTime;
        LoggerUtil.logActionSuccess(name, "clear and type", duration);
    }
    
    /**
     * Clear the text box
     */
    public void clear() {
        long startTime = System.currentTimeMillis();
        LoggerUtil.logActionStart(name, FrameworkConstants.CLEAR_TEXT);
        
        RetryUtil.executeWithRetry(
            () -> {
                WebElement element = getElement();
                element.clear();
            },
            name,
            FrameworkConstants.CLEAR_TEXT,
            retryCount
        );
        
        long duration = System.currentTimeMillis() - startTime;
        LoggerUtil.logActionSuccess(name, FrameworkConstants.CLEAR_TEXT, duration);
    }
    
    /**
     * Get value from text box
     * @return Text box value
     */
    public String getValue() {
        return getAttribute("value");
    }
    
    /**
     * Check if text box is empty
     * @return true if text box is empty
     */
    public boolean isEmpty() {
        String value = getValue();
        return value == null || value.trim().isEmpty();
    }
    
    /**
     * Get placeholder text
     * @return Placeholder text
     */
    public String getPlaceholder() {
        return getAttribute("placeholder");
    }
    
    /**
     * Press Enter key
     */
    public void pressEnter() {
        long startTime = System.currentTimeMillis();
        LoggerUtil.logActionStart(name, FrameworkConstants.PRESS_ENTER);
        
        RetryUtil.executeWithRetry(
            () -> {
                WebElement element = getElement();
                element.sendKeys(Keys.ENTER);
            },
            name,
            FrameworkConstants.PRESS_ENTER,
            retryCount
        );
        
        long duration = System.currentTimeMillis() - startTime;
        LoggerUtil.logActionSuccess(name, FrameworkConstants.PRESS_ENTER, duration);
    }
    
    /**
     * Press Tab key
     */
    public void pressTab() {
        long startTime = System.currentTimeMillis();
        LoggerUtil.logActionStart(name, FrameworkConstants.PRESS_TAB);
        
        RetryUtil.executeWithRetry(
            () -> {
                WebElement element = getElement();
                element.sendKeys(Keys.TAB);
            },
            name,
            FrameworkConstants.PRESS_TAB,
            retryCount
        );
        
        long duration = System.currentTimeMillis() - startTime;
        LoggerUtil.logActionSuccess(name, FrameworkConstants.PRESS_TAB, duration);
    }
    
    /**
     * Select all text in the text box
     */
    public void selectAll() {
        long startTime = System.currentTimeMillis();
        LoggerUtil.logActionStart(name, FrameworkConstants.SELECT_ALL_TEXT);
        
        RetryUtil.executeWithRetry(
            () -> {
                WebElement element = getElement();
                element.sendKeys(Keys.CONTROL + "a");
            },
            name,
            FrameworkConstants.SELECT_ALL_TEXT,
            retryCount
        );
        
        long duration = System.currentTimeMillis() - startTime;
        LoggerUtil.logActionSuccess(name, FrameworkConstants.SELECT_ALL_TEXT, duration);
    }
    
    /**
     * Get text box type (text, password, email, etc.)
     * @return Input type
     */
    public String getInputType() {
        return getAttribute("type");
    }
    
    /**
     * Check if text box is required
     * @return true if required attribute is present
     */
    public boolean isRequired() {
        String required = getAttribute("required");
        return required != null && !required.isEmpty();
    }
    
    /**
     * Get maximum length allowed
     * @return Maximum length or -1 if not specified
     */
    public int getMaxLength() {
        String maxLength = getAttribute("maxlength");
        if (maxLength != null && !maxLength.isEmpty()) {
            try {
                return Integer.parseInt(maxLength);
            } catch (NumberFormatException e) {
                LoggerUtil.warn("Invalid maxlength value: " + maxLength);
            }
        }
        return -1;
    }
    
    /**
     * Type text slowly (character by character with delay)
     * @param text Text to type
     * @param delayMs Delay between characters in milliseconds
     */
    public void typeSlowly(String text, int delayMs) {
        long startTime = System.currentTimeMillis();
        LoggerUtil.logActionStart(name, "type slowly: '" + text + "'");
        
        RetryUtil.executeWithRetry(
            () -> {
                WebElement element = waitHelper.waitForVisibility(locator, name);
                for (char character : text.toCharArray()) {
                    element.sendKeys(String.valueOf(character));
                    try {
                        Thread.sleep(delayMs);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                }
            },
            name,
            "type slowly",
            retryCount
        );
        
        long duration = System.currentTimeMillis() - startTime;
        LoggerUtil.logActionSuccess(name, "type slowly", duration);
    }
}