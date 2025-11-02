package com.automation.healing.elements;

import com.automation.elements.Link;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

/**
 * HealingLink - Self-healing version of Link
 * Extends HealingBaseElement to provide link functionality with healing
 */
public class HealingLink extends HealingBaseElement {
    
    private final Link delegate;
    
    public HealingLink(WebDriver driver, By locator, String name, String pageName) {
        super(driver, locator, name, pageName);
        this.delegate = new Link(driver, locator, name);
    }
    
    /**
     * Click the link with healing capability
     */
    @Override
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
     * Get link text with healing capability
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
     * Get href attribute with healing capability
     */
    public String getHref() {
        try {
            String href = delegate.getHref();
            // Record successful interaction
            if (getHealingConfiguration().isHealingEnabled()) {
                getHealingManager().recordSuccessfulInteraction(locator, getElementName(), getPageName());
            }
            return href;
        } catch (Exception e) {
            if (getHealingConfiguration().isHealingEnabled()) {
                // Try healing and retry
                var healedElement = getHealingManager().healAndRetry(locator, "getHref");
                if (healedElement.isPresent()) {
                    return healedElement.get().getAttribute("href");
                }
            }
            throw e;
        }
    }
}