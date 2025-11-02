package com.automation.healing.elements;

import com.automation.elements.Button;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

/**
 * HealingButton - Self-healing version of Button
 * Extends HealingBaseElement to provide button functionality with healing
 */
public class HealingButton extends HealingBaseElement {
    
    private final Button delegate;
    
    public HealingButton(WebDriver driver, By locator, String name, String pageName) {
        super(driver, locator, name, pageName);
        this.delegate = new Button(driver, locator, name);
    }
    
    /**
     * Click the button with healing capability
     */
    public void click() {
        try {
            delegate.click();
            // Record successful interaction
            if (getHealingConfiguration().isHealingEnabled()) {
                getHealingManager().recordSuccessfulInteraction(locator, getElementName(), getPageName());
            }
        } catch (Exception e) {
            if (getHealingConfiguration().isHealingEnabled()) {
                // Try healing and retry
                var healedElement = getHealingManager().healAndRetry(locator, "click");
                if (healedElement.isPresent()) {
                    healedElement.get().click();
                    return;
                }
            }
            throw e;
        }
    }
    
    /**
     * Check if button is enabled with healing capability
     */
    public boolean isEnabled() {
        try {
            boolean enabled = delegate.isEnabled();
            // Record successful interaction
            if (getHealingConfiguration().isHealingEnabled()) {
                getHealingManager().recordSuccessfulInteraction(locator, getElementName(), getPageName());
            }
            return enabled;
        } catch (Exception e) {
            if (getHealingConfiguration().isHealingEnabled()) {
                // Try healing and retry
                var healedElement = getHealingManager().healAndRetry(locator, "isEnabled");
                if (healedElement.isPresent()) {
                    return healedElement.get().isEnabled();
                }
            }
            throw e;
        }
    }
    
    /**
     * Get button text with healing capability
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