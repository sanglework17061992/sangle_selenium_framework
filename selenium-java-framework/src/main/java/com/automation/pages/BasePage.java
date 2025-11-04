package com.automation.pages;

import com.automation.elements.Locator;
import com.automation.elements.LocatorDefinition;
import com.automation.elements.PageLocatorManager;
import org.openqa.selenium.WebDriver;

import java.util.HashMap;
import java.util.Map;

/**
 * BasePage - Base class for page objects with JSON-based locator management
 * Automatically loads locators from JSON files and provides easy access to PageObjectModel
 */
public abstract class BasePage {
    
    protected final WebDriver driver;
    protected final String pageName;
    protected final PageLocatorManager locatorManager;
    protected final Map<String, Locator> locators;
    
    protected BasePage(WebDriver driver, String pageName) {
        this.driver = driver;
        this.pageName = pageName;
        this.locatorManager = PageLocatorManager.getInstance();
        this.locators = new HashMap<>();
        
        // Load all locators for this page
        loadPageLocators();
    }
    
    /**
     * Load locators from JSON file
     */
    private void loadPageLocators() {
        Map<String, LocatorDefinition> definitions = locatorManager.getPageLocators(pageName);
        
        for (LocatorDefinition definition : definitions.values()) {
            Locator locator = new Locator(driver, 
                    locatorManager.createByLocator(definition), 
                    definition.getName(), 
                    definition.getPage(), 
                    definition.getId());
            
            locators.put(definition.getId(), locator);
        }
    }
    
    /**
     * Get locator by element ID
     */
    protected Locator getLocator(String elementId) {
        Locator locator = locators.get(elementId);
        if (locator == null) {
            throw new RuntimeException("Locator not found for element ID: " + elementId + " on page: " + pageName);
        }
        return locator;
    }
    
    /**
     * Check if locator exists
     */
    protected boolean hasLocator(String elementId) {
        return locators.containsKey(elementId);
    }
    
    /**
     * Get all locators for this page
     */
    protected Map<String, Locator> getAllLocators() {
        return new HashMap<>(locators);
    }
    
    /**
     * Get page name
     */
    public String getPageName() {
        return pageName;
    }
}