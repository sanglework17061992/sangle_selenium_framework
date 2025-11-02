package com.automation.healing.elements;

import com.automation.elements.BaseElement;
import com.automation.healing.HealingManager;
import com.automation.healing.HealingConfiguration;
import com.automation.utils.LoggerUtil;
import org.openqa.selenium.By;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import java.util.Optional;

/**
 * HealingBaseElement - Enhanced BaseElement with self-healing capabilities
 * Extends the original BaseElement to add automatic healing functionality
 */
public abstract class HealingBaseElement extends BaseElement {
    
    private final HealingManager healingManager;
    private final HealingConfiguration config;
    private final String pageName;
    private final String elementName;
    
    protected HealingBaseElement(WebDriver driver, By locator, String name, String pageName) {
        super(driver, locator, name);
        this.healingManager = HealingManager.getInstance();
        this.config = HealingConfiguration.getInstance();
        this.pageName = pageName;
        this.elementName = name;
        
        // Initialize healing manager if not already done
        if (!isHealingManagerInitialized()) {
            initializeHealingManager();
        }
    }
    
    @Override
    public WebElement getElement() {
        try {
            // Try original locator first
            WebElement element = super.getElement();
            
            // Record successful interaction for future healing reference
            if (config.isHealingEnabled()) {
                healingManager.recordSuccessfulInteraction(locator, elementName, pageName);
            }
            
            return element;
            
        } catch (NoSuchElementException e) {
            // Element not found - try healing
            if (config.isHealingEnabled()) {
                LoggerUtil.info("Element not found, attempting healing for: " + name);
                
                Optional<WebElement> healedElement = healingManager.healAndRetry(locator, "getElement");
                if (healedElement.isPresent()) {
                    LoggerUtil.info("Successfully healed element: " + name);
                    return healedElement.get();
                } else {
                    LoggerUtil.warn("Healing failed for element: " + name);
                }
            }
            
            // Re-throw original exception if healing failed or disabled
            throw e;
        }
    }
    
    /**
     * Gets the page name for this element
     */
    public String getPageName() {
        return pageName;
    }
    
    /**
     * Gets the element name
     */
    public String getElementName() {
        return elementName;
    }
    
    /**
     * Gets the healing manager instance
     */
    protected HealingManager getHealingManager() {
        return healingManager;
    }
    
    /**
     * Gets the healing configuration
     */
    protected HealingConfiguration getHealingConfiguration() {
        return config;
    }
    
    /**
     * Manually triggers healing for this element
     */
    public void triggerHealing() {
        if (config.isHealingEnabled()) {
            LoggerUtil.info("Manually triggering healing for element: " + name);
            healingManager.healLocator(locator, "Manual trigger from element: " + name);
        } else {
            LoggerUtil.warn("Healing is disabled, cannot trigger healing for: " + name);
        }
    }
    
    /**
     * Checks if the element can be healed (has healing enabled and manager available)
     */
    public boolean canBeHealed() {
        return config.isHealingEnabled() && healingManager != null && isHealingManagerInitialized();
    }
    
    /**
     * Gets healing statistics for this element's page
     */
    public java.util.Map<String, Object> getHealingStatistics() {
        if (healingManager != null) {
            return healingManager.getHealingStatistics();
        }
        return new java.util.HashMap<>();
    }
    
    private boolean isHealingManagerInitialized() {
        try {
            return healingManager != null && healingManager.isHealingEnabled();
        } catch (Exception e) {
            return false;
        }
    }
    
    private void initializeHealingManager() {
        try {
            if (driver != null) {
                healingManager.initialize(driver);
                LoggerUtil.debug("Healing manager initialized for element: " + name);
            }
        } catch (Exception e) {
            LoggerUtil.error("Failed to initialize healing manager: " + e.getMessage(), e);
        }
    }
}