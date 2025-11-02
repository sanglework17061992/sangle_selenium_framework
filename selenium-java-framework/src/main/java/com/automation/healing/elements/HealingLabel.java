package com.automation.healing.elements;

import com.automation.elements.Label;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

/**
 * HealingLabel - Self-healing version of Label
 * Extends HealingBaseElement to provide label functionality with healing
 */
public class HealingLabel extends HealingBaseElement {
    
    private final Label delegate;
    
    public HealingLabel(WebDriver driver, By locator, String name, String pageName) {
        super(driver, locator, name, pageName);
        this.delegate = new Label(driver, locator, name);
    }
    
    /**
     * Get label text with healing capability
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
    
    /**
     * Check if label is displayed with healing capability
     */
    @Override
    public boolean isDisplayed() {
        try {
            boolean displayed = delegate.isDisplayed();
            // Record successful interaction
            if (getHealingConfiguration().isHealingEnabled()) {
                getHealingManager().recordSuccessfulInteraction(locator, getElementName(), getPageName());
            }
            return displayed;
        } catch (Exception e) {
            if (getHealingConfiguration().isHealingEnabled()) {
                // Try healing and retry
                var healedElement = getHealingManager().healAndRetry(locator, "isDisplayed");
                if (healedElement.isPresent()) {
                    return healedElement.get().isDisplayed();
                }
            }
            return false; // Return false if healing fails for display check
        }
    }
}