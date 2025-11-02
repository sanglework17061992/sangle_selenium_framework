package com.automation.elements;

import com.automation.exceptions.ElementInteractionException;
import com.automation.utils.Action;
import com.automation.utils.LoggerUtil;
import com.automation.utils.RetryUtil;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

/**
 * RadioButton - Wrapper class for radio button elements
 * Extends BaseElement with radio button specific functionality
 */
public class RadioButton extends BaseElement {
    
    public RadioButton(WebDriver driver, By locator, String name) {
        super(driver, locator, name);
    }
    
    /**
     * Select the radio button
     */
    public void select() {
        long startTime = System.currentTimeMillis();
        LoggerUtil.logActionStart(name, Action.SELECT.toString());
        
        RetryUtil.executeWithRetry(
            () -> {
                WebElement element = waitHelper.waitForClickability(locator, name);
                if (!element.isSelected()) {
                    element.click();
                }
            },
            name,
            Action.SELECT.toString(),
            retryCount
        );
        
    long duration = System.currentTimeMillis() - startTime;
    LoggerUtil.logActionSuccess(name, Action.SELECT.toString(), duration);
    }
    
    /**
     * Check if radio button is selected
     * @return true if radio button is selected
     */
    public boolean isSelected() {
        return RetryUtil.executeWithRetry(
            () -> {
                WebElement element = getElement();
                return element.isSelected();
            },
            name,
            Action.CHECK_IF_SELECTED.toString(),
            retryCount
        );
    }
    
    /**
     * Get radio button value
     * @return Value attribute of radio button
     */
    public String getValue() {
        return getAttribute("value");
    }
    
    /**
     * Get radio button group name
     * @return Name attribute (radio group name)
     */
    public String getGroupName() {
        return getAttribute("name");
    }
    
    /**
     * Get all radio buttons in the same group
     * @return Array of radio button elements in same group
     */
    public java.util.List<WebElement> getGroupRadioButtons() {
        String groupName = getGroupName();
        if (groupName != null && !groupName.isEmpty()) {
            return driver.findElements(By.xpath("//input[@type='radio' and @name='" + groupName + "']"));
        }
        return java.util.Collections.emptyList();
    }
    
    /**
     * Get selected radio button value from the group
     * @return Value of selected radio button in group, null if none selected
     */
    public String getSelectedValueFromGroup() {
        return RetryUtil.executeWithRetry(
            () -> {
                java.util.List<WebElement> groupRadios = getGroupRadioButtons();
                for (WebElement radio : groupRadios) {
                    if (radio.isSelected()) {
                        return radio.getAttribute("value");
                    }
                }
                return null;
            },
            name,
            Action.GET_SELECTED_VALUE_FROM_GROUP.toString(),
            retryCount
        );
    }
    
    /**
     * Select radio button by value in the group
     * @param value Value of radio button to select
     */
    public void selectByValue(String value) {
        long startTime = System.currentTimeMillis();
        LoggerUtil.logActionStart(name, Action.SELECT_BY_VALUE.toString() + ": " + value);
        
        RetryUtil.executeWithRetry(
            () -> {
                String groupName = getGroupName();
                if (groupName != null && !groupName.isEmpty()) {
                    WebElement radioToSelect = driver.findElement(
                        By.xpath("//input[@type='radio' and @name='" + groupName + "' and @value='" + value + "']")
                    );
                    if (!radioToSelect.isSelected()) {
                        radioToSelect.click();
                    }
                } else {
                    throw new ElementInteractionException("Cannot select by value: radio button has no group name");
                }
            },
            name,
            Action.SELECT_BY_VALUE.toString(),
            retryCount
        );
        
    long duration = System.currentTimeMillis() - startTime;
    LoggerUtil.logActionSuccess(name, Action.SELECT_BY_VALUE.toString(), duration);
    }
    
    /**
     * Check if radio button is required
     * @return true if required attribute is present
     */
    public boolean isRequired() {
        String required = getAttribute("required");
        return required != null && !required.isEmpty();
    }
}