package com.automation.elements;

import com.automation.constants.FrameworkConstants;
import com.automation.utils.LoggerUtil;
import com.automation.utils.RetryUtil;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

/**
 * Button - Wrapper class for button elements
 * Extends BaseElement with button-specific functionality
 */
public class Button extends BaseElement {
    
    public Button(WebDriver driver, By locator, String name) {
        super(driver, locator, name);
    }
    
    /**
     * Click button with retry logic
     */
    public void clickWithRetry() {
        long startTime = System.currentTimeMillis();
        LoggerUtil.logActionStart(name, FrameworkConstants.CLICK_WITH_RETRY);
        
        RetryUtil.executeWithRetry(
            () -> {
                WebElement element = waitHelper.waitForClickability(locator, name);
                // Scroll into view first
                ((org.openqa.selenium.JavascriptExecutor) driver)
                    .executeScript("arguments[0].scrollIntoView(true);", element);
                
                // Small delay to ensure element is ready
                try {
                    Thread.sleep(200);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
                
                // Try JavaScript click if regular click fails
                try {
                    element.click();
                } catch (Exception e) {
                    LoggerUtil.warn("Regular click failed, trying JavaScript click for: " + name);
                    ((org.openqa.selenium.JavascriptExecutor) driver)
                        .executeScript("arguments[0].click();", element);
                }
            },
            name,
            FrameworkConstants.CLICK_WITH_RETRY,
            retryCount
        );
        
        long duration = System.currentTimeMillis() - startTime;
        LoggerUtil.logActionSuccess(name, FrameworkConstants.CLICK_WITH_RETRY, duration);
    }
    
    /**
     * Check if button is enabled
     * @return true if button is enabled
     */
    @Override
    public boolean isEnabled() {
        return RetryUtil.executeWithRetry(
            () -> {
                WebElement element = getElement();
                String disabled = element.getAttribute("disabled");
                return element.isEnabled() && !"true".equals(disabled);
            },
            name,
            "check if button enabled",
            retryCount
        );
    }
    
    /**
     * Get button type attribute
     * @return Button type (submit, button, reset, etc.)
     */
    public String getButtonType() {
        return getAttribute("type");
    }
    
    /**
     * Check if button is of specific type
     * @param type Expected button type
     * @return true if button type matches
     */
    public boolean isButtonType(String type) {
        String buttonType = getButtonType();
        return type.equalsIgnoreCase(buttonType);
    }
    
    /**
     * Submit form (if button is submit type)
     */
    public void submit() {
        long startTime = System.currentTimeMillis();
        LoggerUtil.logActionStart(name, FrameworkConstants.SUBMIT_FORM);
        
        RetryUtil.executeWithRetry(
            () -> {
                WebElement element = getElement();
                if (isButtonType("submit")) {
                    element.submit();
                } else {
                    element.click();
                }
            },
            name,
            FrameworkConstants.SUBMIT_FORM,
            retryCount
        );
        
        long duration = System.currentTimeMillis() - startTime;
        LoggerUtil.logActionSuccess(name, FrameworkConstants.SUBMIT_FORM, duration);
    }
    
    /**
     * Double click the button
     */
    public void doubleClick() {
        long startTime = System.currentTimeMillis();
        LoggerUtil.logActionStart(name, FrameworkConstants.DOUBLE_CLICK);
        
        RetryUtil.executeWithRetry(
            () -> {
                WebElement element = waitHelper.waitForClickability(locator, name);
                org.openqa.selenium.interactions.Actions actions = 
                    new org.openqa.selenium.interactions.Actions(driver);
                actions.doubleClick(element).perform();
            },
            name,
            FrameworkConstants.DOUBLE_CLICK,
            retryCount
        );
        
        long duration = System.currentTimeMillis() - startTime;
        LoggerUtil.logActionSuccess(name, FrameworkConstants.DOUBLE_CLICK, duration);
    }
    
    /**
     * Right click the button
     */
    public void rightClick() {
        long startTime = System.currentTimeMillis();
        LoggerUtil.logActionStart(name, FrameworkConstants.RIGHT_CLICK);
        
        RetryUtil.executeWithRetry(
            () -> {
                WebElement element = waitHelper.waitForClickability(locator, name);
                org.openqa.selenium.interactions.Actions actions = 
                    new org.openqa.selenium.interactions.Actions(driver);
                actions.contextClick(element).perform();
            },
            name,
            FrameworkConstants.RIGHT_CLICK,
            retryCount
        );
        
        long duration = System.currentTimeMillis() - startTime;
        LoggerUtil.logActionSuccess(name, FrameworkConstants.RIGHT_CLICK, duration);
    }
}