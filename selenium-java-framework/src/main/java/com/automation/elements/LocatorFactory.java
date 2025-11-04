package com.automation.elements;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

/**
 * LocatorFactory - Helper class for creating Locator instances
 * Provides convenient static methods for common locator creation patterns
 */
public class LocatorFactory {
    
    /**
     * Create a Locator by ID
     */
    public static Locator byId(WebDriver driver, String id, String name) {
        return new Locator(driver, By.id(id), name, "UnknownPage", id);
    }
    
    /**
     * Create a Locator by ID with page context
     */
    public static Locator byId(WebDriver driver, String id, String name, String pageName) {
        return new Locator(driver, By.id(id), name, pageName, id);
    }
    
    /**
     * Create a Locator from JSON definition
     */
    public static Locator fromDefinition(WebDriver driver, LocatorDefinition definition) {
        PageLocatorManager manager = PageLocatorManager.getInstance();
        By locator = manager.createByLocator(definition);
        return new Locator(driver, locator, definition.getName(), definition.getPage(), definition.getId());
    }
    
    /**
     * Create a Locator by name
     */
    public static Locator byName(WebDriver driver, String name, String elementName) {
        return new Locator(driver, By.name(name), elementName);
    }
    
    /**
     * Create a Locator by class name
     */
    public static Locator byClassName(WebDriver driver, String className, String name) {
        return new Locator(driver, By.className(className), name);
    }
    
    /**
     * Create a Locator by CSS selector
     */
    public static Locator byCss(WebDriver driver, String cssSelector, String name) {
        return new Locator(driver, By.cssSelector(cssSelector), name);
    }
    
    /**
     * Create a Locator by XPath
     */
    public static Locator byXpath(WebDriver driver, String xpath, String name) {
        return new Locator(driver, By.xpath(xpath), name);
    }
    
    /**
     * Create a Locator by link text
     */
    public static Locator byLinkText(WebDriver driver, String linkText, String name) {
        return new Locator(driver, By.linkText(linkText), name);
    }
    
    /**
     * Create a Locator by partial link text
     */
    public static Locator byPartialLinkText(WebDriver driver, String partialLinkText, String name) {
        return new Locator(driver, By.partialLinkText(partialLinkText), name);
    }
    
    /**
     * Create a Locator by tag name
     */
    public static Locator byTagName(WebDriver driver, String tagName, String name) {
        return new Locator(driver, By.tagName(tagName), name);
    }
    
    /**
     * Create a Locator with custom By locator
     */
    public static Locator by(WebDriver driver, By locator, String name) {
        return new Locator(driver, locator, name);
    }
    
    /**
     * Create a Locator with custom By locator and page context
     */
    public static Locator by(WebDriver driver, By locator, String name, String pageName) {
        return new Locator(driver, locator, name, pageName);
    }
}