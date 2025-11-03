package com.automation.elements;

import com.automation.constants.FrameworkConstants;
import com.automation.utils.LoggerUtil;
import com.automation.utils.RetryUtil;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.Select;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Dropdown - Wrapper class for dropdown/select elements
 * Extends BaseElement with dropdown specific functionality
 */
public class Dropdown extends BaseElement {
    
    public Dropdown(WebDriver driver, By locator, String name) {
        super(driver, locator, name);
    }
    
    /**
     * Get Select object for dropdown operations
     * @return Select object
     */
    private Select getSelect() {
        WebElement element = getElement();
        return new Select(element);
    }
    
    /**
     * Select option by visible text
     * @param text Visible text to select
     */
    public void selectByText(String text) {
        long startTime = System.currentTimeMillis();
        LoggerUtil.logActionStart(name, "select by text: '" + text + "'");
        
        RetryUtil.executeWithRetry(
            () -> {
                Select select = getSelect();
                select.selectByVisibleText(text);
            },
            name,
            "select by text",
            retryCount
        );
        
        long duration = System.currentTimeMillis() - startTime;
        LoggerUtil.logActionSuccess(name, "select by text", duration);
    }
    
    /**
     * Select option by value attribute
     * @param value Value attribute to select
     */
    public void selectByValue(String value) {
        long startTime = System.currentTimeMillis();
        LoggerUtil.logActionStart(name, "select by value: '" + value + "'");
        
        RetryUtil.executeWithRetry(
            () -> {
                Select select = getSelect();
                select.selectByValue(value);
            },
            name,
            "select by value",
            retryCount
        );
        
        long duration = System.currentTimeMillis() - startTime;
        LoggerUtil.logActionSuccess(name, "select by value", duration);
    }
    
    /**
     * Select option by index
     * @param index Index to select (0-based)
     */
    public void selectByIndex(int index) {
        long startTime = System.currentTimeMillis();
        LoggerUtil.logActionStart(name, "select by index: " + index);
        
        RetryUtil.executeWithRetry(
            () -> {
                Select select = getSelect();
                select.selectByIndex(index);
            },
            name,
            "select by index",
            retryCount
        );
        
        long duration = System.currentTimeMillis() - startTime;
        LoggerUtil.logActionSuccess(name, "select by index", duration);
    }
    
    /**
     * Get selected option text
     * @return Selected option text
     */
    public String getSelectedText() {
        return RetryUtil.executeWithRetry(
            () -> {
                Select select = getSelect();
                return select.getFirstSelectedOption().getText();
            },
            name,
            "get selected text",
            retryCount
        );
    }
    
    /**
     * Get selected option value
     * @return Selected option value
     */
    public String getSelectedValue() {
        return RetryUtil.executeWithRetry(
            () -> {
                Select select = getSelect();
                return select.getFirstSelectedOption().getAttribute("value");
            },
            name,
            "get selected value",
            retryCount
        );
    }
    
    /**
     * Get all option texts
     * @return List of all option texts
     */
    public List<String> getAllOptionTexts() {
        return RetryUtil.executeWithRetry(
            () -> {
                Select select = getSelect();
                return select.getOptions().stream()
                    .map(WebElement::getText)
                    .collect(Collectors.toList());
            },
            name,
            "get all option texts",
            retryCount
        );
    }
    
    /**
     * Get all option values
     * @return List of all option values
     */
    public List<String> getAllOptionValues() {
        return RetryUtil.executeWithRetry(
            () -> {
                Select select = getSelect();
                return select.getOptions().stream()
                    .map(option -> option.getAttribute("value"))
                    .collect(Collectors.toList());
            },
            name,
            "get all option values",
            retryCount
        );
    }
    
    /**
     * Check if dropdown is multi-select
     * @return true if multi-select dropdown
     */
    public boolean isMultiSelect() {
        return RetryUtil.executeWithRetry(
            () -> {
                Select select = getSelect();
                return select.isMultiple();
            },
            name,
            "check if multi-select",
            retryCount
        );
    }
    
    /**
     * Deselect all options (for multi-select dropdowns)
     */
    public void deselectAll() {
        long startTime = System.currentTimeMillis();
        LoggerUtil.logActionStart(name, FrameworkConstants.DESELECT_ALL);
        
        RetryUtil.executeWithRetry(
            () -> {
                Select select = getSelect();
                if (select.isMultiple()) {
                    select.deselectAll();
                } else {
                    LoggerUtil.warn("Cannot deselect all on single-select dropdown: " + name);
                }
            },
            name,
            FrameworkConstants.DESELECT_ALL,
            retryCount
        );
        
        long duration = System.currentTimeMillis() - startTime;
        LoggerUtil.logActionSuccess(name, FrameworkConstants.DESELECT_ALL, duration);
    }
    
    /**
     * Deselect option by text (for multi-select dropdowns)
     * @param text Text to deselect
     */
    public void deselectByText(String text) {
        long startTime = System.currentTimeMillis();
        LoggerUtil.logActionStart(name, "deselect by text: '" + text + "'");
        
        RetryUtil.executeWithRetry(
            () -> {
                Select select = getSelect();
                if (select.isMultiple()) {
                    select.deselectByVisibleText(text);
                } else {
                    LoggerUtil.warn("Cannot deselect by text on single-select dropdown: " + name);
                }
            },
            name,
            "deselect by text",
            retryCount
        );
        
        long duration = System.currentTimeMillis() - startTime;
        LoggerUtil.logActionSuccess(name, "deselect by text", duration);
    }
    
    /**
     * Get count of options
     * @return Number of options in dropdown
     */
    public int getOptionCount() {
        return RetryUtil.executeWithRetry(
            () -> {
                Select select = getSelect();
                return select.getOptions().size();
            },
            name,
            "get option count",
            retryCount
        );
    }
    
    /**
     * Check if option with text exists
     * @param text Text to check
     * @return true if option exists
     */
    public boolean hasOptionWithText(String text) {
        return RetryUtil.executeWithRetry(
            () -> {
                List<String> optionTexts = getAllOptionTexts();
                return optionTexts.contains(text);
            },
            name,
            "check if has option with text",
            retryCount
        );
    }
    
    /**
     * Check if option with value exists
     * @param value Value to check
     * @return true if option exists
     */
    public boolean hasOptionWithValue(String value) {
        return RetryUtil.executeWithRetry(
            () -> {
                List<String> optionValues = getAllOptionValues();
                return optionValues.contains(value);
            },
            name,
            "check if has option with value",
            retryCount
        );
    }
}