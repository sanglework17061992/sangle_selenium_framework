package com.automation.elements;

import com.automation.constants.FrameworkConstants;
import com.automation.utils.LoggerUtil;
import com.automation.utils.RetryUtil;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

/**
 * Checkbox - Wrapper class for checkbox elements
 * Extends BaseElement with checkbox specific functionality
 */
public class Checkbox extends BaseElement {
    
    public Checkbox(WebDriver driver, By locator, String name) {
        super(driver, locator, name);
    }
    
    /**
     * Check the checkbox
     */
    public void check() {
        long startTime = System.currentTimeMillis();
        LoggerUtil.logActionStart(name, FrameworkConstants.CHECK);
        
        RetryUtil.executeWithRetry(
            () -> {
                WebElement element = waitHelper.waitForClickability(locator, name);
                if (!element.isSelected()) {
                    element.click();
                }
            },
            name,
            FrameworkConstants.CHECK,
            retryCount
        );
        
        long duration = System.currentTimeMillis() - startTime;
        LoggerUtil.logActionSuccess(name, FrameworkConstants.CHECK, duration);
    }
    
    /**
     * Uncheck the checkbox
     */
    public void uncheck() {
        long startTime = System.currentTimeMillis();
        LoggerUtil.logActionStart(name, FrameworkConstants.UNCHECK);
        
        RetryUtil.executeWithRetry(
            () -> {
                WebElement element = waitHelper.waitForClickability(locator, name);
                if (element.isSelected()) {
                    element.click();
                }
            },
            name,
            FrameworkConstants.UNCHECK,
            retryCount
        );
        
        long duration = System.currentTimeMillis() - startTime;
        LoggerUtil.logActionSuccess(name, FrameworkConstants.UNCHECK, duration);
    }
    
    /**
     * Toggle checkbox state
     */
    public void toggle() {
        long startTime = System.currentTimeMillis();
        LoggerUtil.logActionStart(name, FrameworkConstants.TOGGLE);
        
        RetryUtil.executeWithRetry(
            () -> {
                WebElement element = waitHelper.waitForClickability(locator, name);
                element.click();
            },
            name,
            FrameworkConstants.TOGGLE,
            retryCount
        );
        
        long duration = System.currentTimeMillis() - startTime;
        LoggerUtil.logActionSuccess(name, FrameworkConstants.TOGGLE, duration);
    }
    
    /**
     * Check if checkbox is selected/checked
     * @return true if checkbox is checked
     */
    public boolean isChecked() {
        return RetryUtil.executeWithRetry(
            () -> {
                WebElement element = getElement();
                return element.isSelected();
            },
            name,
            "check if selected",
            retryCount
        );
    }
    
    /**
     * Set checkbox state
     * @param checked true to check, false to uncheck
     */
    public void setState(boolean checked) {
        if (checked) {
            check();
        } else {
            uncheck();
        }
    }
    
    /**
     * Get checkbox value attribute
     * @return Value attribute of checkbox
     */
    public String getValue() {
        return getAttribute("value");
    }
    
    /**
     * Check if checkbox is required
     * @return true if required attribute is present
     */
    public boolean isRequired() {
        String required = getAttribute("required");
        return required != null && !required.isEmpty();
    }
    
    /**
     * Get associated label text
     * @return Label text associated with checkbox
     */
    public String getLabel() {
        return RetryUtil.executeWithRetry(
            () -> {
                // First try to find label by 'for' attribute
                String id = getAttribute("id");
                if (id != null && !id.isEmpty()) {
                    try {
                        WebElement label = driver.findElement(By.xpath("//label[@for='" + id + "']"));
                        return label.getText();
                    } catch (org.openqa.selenium.NoSuchElementException e) {
                        // Label not found by 'for' attribute
                    }
                }
                
                // Try to find parent label
                try {
                    WebElement parentLabel = getElement().findElement(By.xpath("./parent::label"));
                    return parentLabel.getText();
                } catch (org.openqa.selenium.NoSuchElementException e) {
                    // Parent label not found
                }
                
                // Try to find following sibling text
                try {
                    WebElement sibling = getElement().findElement(By.xpath("./following-sibling::text()"));
                    return sibling.getText();
                } catch (org.openqa.selenium.NoSuchElementException e) {
                    return "";
                }
            },
            name,
            "get label",
            retryCount
        );
    }
    
    /**
     * Check if checkbox is indeterminate state
     * @return true if checkbox is in indeterminate state
     */
    public boolean isIndeterminate() {
        return RetryUtil.executeWithRetry(
            () -> {
                WebElement element = getElement();
                String indeterminate = (String) ((org.openqa.selenium.JavascriptExecutor) driver)
                    .executeScript("return arguments[0].indeterminate", element);
                return Boolean.parseBoolean(indeterminate);
            },
            name,
            "check if indeterminate",
            retryCount
        );
    }
}