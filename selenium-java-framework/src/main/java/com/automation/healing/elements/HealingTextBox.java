package com.automation.healing.elements;

import com.automation.elements.TextBox;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

/**
 * HealingTextBox - Self-healing version of TextBox
 * Extends HealingBaseElement to provide text input functionality with healing
 */
public class HealingTextBox extends HealingBaseElement {
    
    private final TextBox delegate;
    
    public HealingTextBox(WebDriver driver, By locator, String name, String pageName) {
        super(driver, locator, name, pageName);
        this.delegate = new TextBox(driver, locator, name);
    }
    
    /**
     * Type text into the text box with healing capability
     */
    public void type(String text) {
        try {
            delegate.type(text);
            // Record successful interaction
            if (getHealingConfiguration().isHealingEnabled()) {
                getHealingManager().recordSuccessfulInteraction(locator, getElementName(), getPageName());
            }
        } catch (Exception e) {
            if (getHealingConfiguration().isHealingEnabled()) {
                // Try healing and retry
                var healedElement = getHealingManager().healAndRetry(locator, "type");
                if (healedElement.isPresent()) {
                    healedElement.get().sendKeys(text);
                    return;
                }
            }
            throw e;
        }
    }
    
    /**
     * Clear and type text with healing capability
     */
    public void clearAndType(String text) {
        try {
            delegate.clearAndType(text);
            // Record successful interaction
            if (getHealingConfiguration().isHealingEnabled()) {
                getHealingManager().recordSuccessfulInteraction(locator, getElementName(), getPageName());
            }
        } catch (Exception e) {
            if (getHealingConfiguration().isHealingEnabled()) {
                // Try healing and retry
                var healedElement = getHealingManager().healAndRetry(locator, "clearAndType");
                if (healedElement.isPresent()) {
                    healedElement.get().clear();
                    healedElement.get().sendKeys(text);
                    return;
                }
            }
            throw e;
        }
    }
    
    /**
     * Clear the text box with healing capability
     */
    public void clear() {
        try {
            delegate.clear();
            // Record successful interaction
            if (getHealingConfiguration().isHealingEnabled()) {
                getHealingManager().recordSuccessfulInteraction(locator, getElementName(), getPageName());
            }
        } catch (Exception e) {
            if (getHealingConfiguration().isHealingEnabled()) {
                // Try healing and retry
                var healedElement = getHealingManager().healAndRetry(locator, "clear");
                if (healedElement.isPresent()) {
                    healedElement.get().clear();
                    return;
                }
            }
            throw e;
        }
    }
    
    /**
     * Get the current value with healing capability
     */
    public String getValue() {
        try {
            String value = delegate.getValue();
            // Record successful interaction
            if (getHealingConfiguration().isHealingEnabled()) {
                getHealingManager().recordSuccessfulInteraction(locator, getElementName(), getPageName());
            }
            return value;
        } catch (Exception e) {
            if (getHealingConfiguration().isHealingEnabled()) {
                // Try healing and retry
                var healedElement = getHealingManager().healAndRetry(locator, "getValue");
                if (healedElement.isPresent()) {
                    return healedElement.get().getAttribute("value");
                }
            }
            throw e;
        }
    }
    
    /**
     * Get the text content with healing capability
     */
    @Override
    public String getText() {
        try {
            String text = delegate.getText();
            // Record successful interaction
            if (getHealingConfiguration().isHealingEnabled()) {
                getHealingManager().recordSuccessfulInteraction(locator, getElementName(), getPageName());
            }
            return text;
        } catch (Exception e) {
            if (getHealingConfiguration().isHealingEnabled()) {
                // Try healing and retry
                var healedElement = getHealingManager().healAndRetry(locator, "getText");
                if (healedElement.isPresent()) {
                    return healedElement.get().getText();
                }
            }
            throw e;
        }
    }
}