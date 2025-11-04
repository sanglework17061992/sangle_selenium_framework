package com.automation.elements;


import com.automation.enums.Action;
import com.automation.healing.HealingManager;
import com.automation.healing.HealingConfiguration;
import com.automation.utils.LoggerUtil;
import com.automation.utils.WaitUtil;
import com.automation.utils.RetryUtil;
import com.automation.exceptions.RetryException;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.StaleElementReferenceException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.ui.Select;

import java.time.Duration;
import java.util.List;
import java.util.function.Supplier;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Unified Locator class for all element interactions
 * Provides comprehensive element operations with built-in healing, retry logic, and waits
 * Eliminates code duplication by handling all element types in a single class
 */
public class Locator {
    
    private final WebDriver driver;
    private By locator;  // Changed from final to allow updates after healing
    private final String name;
    private final String pageName;
    private final String elementId;  // Added for JSON persistence
    private final WaitUtil waitUtil;
    private final HealingManager healingManager;
    private final HealingConfiguration healingConfig;
    private final PageLocatorManager pageLocatorManager;  // Added for locator management
    
    // Configuration
    private int retryCount = 3;
    private Duration timeout = Duration.ofSeconds(10);
    private boolean healingEnabled = true;
    
    /**
     * Constructor for Locator
     */
    public Locator(WebDriver driver, By locator, String name) {
        this(driver, locator, name, "UnknownPage", name);
    }
    
    /**
     * Constructor with page name for healing context
     */
    public Locator(WebDriver driver, By locator, String name, String pageName) {
        this(driver, locator, name, pageName, name);
    }
    
    /**
     * Full constructor with element ID for JSON persistence
     */
    public Locator(WebDriver driver, By locator, String name, String pageName, String elementId) {
        this.driver = driver;
        this.locator = locator;
        this.name = name;
        this.pageName = pageName;
        this.elementId = elementId;
        this.waitUtil = new WaitUtil(driver, (int) timeout.getSeconds());
        this.healingManager = HealingManager.getInstance();
        this.healingConfig = HealingConfiguration.getInstance();
        this.pageLocatorManager = PageLocatorManager.getInstance();
        
        // Try to load healed locator from JSON if available
        loadHealedLocatorIfAvailable();
        
        // Initialize healing if not already done
        if (!isHealingManagerInitialized()) {
            initializeHealingManager();
        }
    }
    
    // ========================================
    // CORE ELEMENT ACCESS METHODS
    // ========================================
    
    /**
     * Get the WebElement with healing support
     */
    public WebElement getElement() {
        return executeWithHealing(Action.GET_ELEMENT.toString(), () -> {
            WebElement element = waitUtil.waitForPresence(locator, name);
            recordSuccessfulInteraction();
            return element;
        });
    }
    
    /**
     * Get the WebElement if it exists (no wait, no exception)
     */
    public Optional<WebElement> findElement() {
        try {
            return Optional.of(driver.findElement(locator));
        } catch (NoSuchElementException e) {
            return Optional.empty();
        }
    }
    
    /**
     * Get all matching elements
     */
    public List<WebElement> getElements() {
        try {
            List<WebElement> elements = driver.findElements(locator);
            if (!elements.isEmpty()) {
                recordSuccessfulInteraction();
            }
            return elements;
        } catch (Exception e) {
            LoggerUtil.warn("Failed to find elements for: " + name + " - " + e.getMessage());
            return List.of();
        }
    }
    
    // ========================================
    // BASIC INTERACTIONS
    // ========================================
    
    /**
     * Click the element
     */
    public Locator click() {
        executeWithHealing(Action.CLICK.toString(), () -> {
            WebElement element = waitUtil.waitForClickability(locator, name);
            element.click();
            LoggerUtil.info("Clicked element: " + name);
            return element;
        });
        return this;
    }
    
    /**
     * Double click the element
     */
    public Locator doubleClick() {
        executeWithHealing(Action.DOUBLE_CLICK.toString(), () -> {
            WebElement element = waitUtil.waitForClickability(locator, name);
            new Actions(driver).doubleClick(element).perform();
            LoggerUtil.info("Double clicked element: " + name);
            return element;
        });
        return this;
    }
    
    /**
     * Right click the element
     */
    public Locator rightClick() {
        executeWithHealing(Action.RIGHT_CLICK.toString(), () -> {
            WebElement element = waitUtil.waitForClickability(locator, name);
            new Actions(driver).contextClick(element).perform();
            LoggerUtil.info("Right clicked element: " + name);
            return element;
        });
        return this;
    }
    
    /**
     * Type text into the element
     */
    public Locator type(String text) {
        executeWithHealing(Action.TYPE.toString(), () -> {
            WebElement element = waitUtil.waitForVisibility(locator, name);
            element.clear();
            element.sendKeys(text);
            LoggerUtil.info("Typed '" + text + "' into element: " + name);
            return element;
        });
        return this;
    }
    
    /**
     * Type text without clearing first
     */
    public Locator append(String text) {
        executeWithHealing("append", () -> {
            WebElement element = waitUtil.waitForVisibility(locator, name);
            element.sendKeys(text);
            LoggerUtil.info("Appended '" + text + "' to element: " + name);
            return element;
        });
        return this;
    }
    
    /**
     * Clear the element
     */
    public Locator clear() {
        executeWithHealing(Action.CLEAR.toString(), () -> {
            WebElement element = waitUtil.waitForVisibility(locator, name);
            element.clear();
            LoggerUtil.info("Cleared element: " + name);
            return element;
        });
        return this;
    }
    
    /**
     * Submit the element (for forms)
     */
    public Locator submit() {
        executeWithHealing(Action.SUBMIT.toString(), () -> {
            WebElement element = getElement();
            element.submit();
            LoggerUtil.info("Submitted element: " + name);
            return element;
        });
        return this;
    }
    
    // ========================================
    // DROPDOWN/SELECT OPERATIONS
    // ========================================
    
    /**
     * Select by visible text (for dropdowns)
     */
    public Locator selectByText(String text) {
        executeWithHealing(Action.SELECT_BY_TEXT.toString(), () -> {
            WebElement element = waitUtil.waitForVisibility(locator, name);
            Select select = new Select(element);
            select.selectByVisibleText(text);
            LoggerUtil.info("Selected '" + text + "' in dropdown: " + name);
            return element;
        });
        return this;
    }
    
    /**
     * Select by value (for dropdowns)
     */
    public Locator selectByValue(String value) {
        executeWithHealing(Action.SELECT_BY_VALUE.toString(), () -> {
            WebElement element = waitUtil.waitForVisibility(locator, name);
            Select select = new Select(element);
            select.selectByValue(value);
            LoggerUtil.info("Selected value '" + value + "' in dropdown: " + name);
            return element;
        });
        return this;
    }
    
    /**
     * Select by index (for dropdowns)
     */
    public Locator selectByIndex(int index) {
        executeWithHealing(Action.SELECT_BY_INDEX.toString(), () -> {
            WebElement element = waitUtil.waitForVisibility(locator, name);
            Select select = new Select(element);
            select.selectByIndex(index);
            LoggerUtil.info("Selected index " + index + " in dropdown: " + name);
            return element;
        });
        return this;
    }
    
    /**
     * Get all options from dropdown
     */
    public List<String> getOptions() {
        return executeWithHealing("getOptions", () -> {
            WebElement element = waitUtil.waitForVisibility(locator, name);
            Select select = new Select(element);
            return select.getOptions().stream()
                    .map(WebElement::getText)
                    .collect(Collectors.toList());
        });
    }
    
    /**
     * Get selected option text
     */
    public String getSelectedText() {
        return executeWithHealing(Action.GET_SELECTED_TEXT.toString(), () -> {
            WebElement element = waitUtil.waitForVisibility(locator, name);
            Select select = new Select(element);
            return select.getFirstSelectedOption().getText();
        });
    }
    
    // ========================================
    // CHECKBOX/RADIO OPERATIONS
    // ========================================
    
    /**
     * Check the checkbox/radio button
     */
    public Locator check() {
        executeWithHealing(Action.CHECK.toString(), () -> {
            WebElement element = waitUtil.waitForClickability(locator, name);
            if (!element.isSelected()) {
                element.click();
                LoggerUtil.info("Checked element: " + name);
            } else {
                LoggerUtil.info("Element already checked: " + name);
            }
            return element;
        });
        return this;
    }
    
    /**
     * Uncheck the checkbox
     */
    public Locator uncheck() {
        executeWithHealing(Action.UNCHECK.toString(), () -> {
            WebElement element = waitUtil.waitForClickability(locator, name);
            if (element.isSelected()) {
                element.click();
                LoggerUtil.info("Unchecked element: " + name);
            } else {
                LoggerUtil.info("Element already unchecked: " + name);
            }
            return element;
        });
        return this;
    }
    
    /**
     * Set checkbox state
     */
    public Locator setChecked(boolean checked) {
        if (checked) {
            check();
        } else {
            uncheck();
        }
        return this;
    }
    
    // ========================================
    // INFORMATION RETRIEVAL
    // ========================================
    
    /**
     * Get element text
     */
    public String getText() {
        return executeWithHealing(Action.GET_TEXT.toString(), () -> {
            WebElement element = waitUtil.waitForVisibility(locator, name);
            String text = element.getText();
            LoggerUtil.debug("Got text '" + text + "' from element: " + name);
            return text;
        });
    }
    
    /**
     * Get attribute value
     */
    public String getAttribute(String attributeName) {
        return executeWithHealing(Action.GET_ATTRIBUTE.toString(), () -> {
            WebElement element = getElement();
            String value = element.getAttribute(attributeName);
            LoggerUtil.debug("Got attribute '" + attributeName + "' = '" + value + "' from element: " + name);
            return value;
        });
    }
    
    /**
     * Get CSS property value
     */
    public String getCssValue(String propertyName) {
        return executeWithHealing(Action.GET_CSS_PROPERTY.toString(), () -> {
            WebElement element = getElement();
            return element.getCssValue(propertyName);
        });
    }
    
    /**
     * Get element value (for input fields)
     */
    public String getValue() {
        return getAttribute("value");
    }
    
    /**
     * Get element tag name
     */
    public String getTagName() {
        return executeWithHealing("getTagName", () -> {
            WebElement element = getElement();
            return element.getTagName();
        });
    }
    
    // ========================================
    // STATE CHECKING
    // ========================================
    
    /**
     * Check if element is displayed
     */
    public boolean isDisplayed() {
        try {
            return executeWithHealing(Action.CHECK_IF_DISPLAYED.toString(), () -> {
                WebElement element = getElement();
                return element.isDisplayed();
            });
        } catch (Exception e) {
            LoggerUtil.debug("Element not displayed: " + name + " - " + e.getMessage());
            return false;
        }
    }
    
    /**
     * Check if element is enabled
     */
    public boolean isEnabled() {
        try {
            return executeWithHealing(Action.CHECK_IF_ENABLED.toString(), () -> {
                WebElement element = getElement();
                return element.isEnabled();
            });
        } catch (Exception e) {
            LoggerUtil.debug("Element not enabled: " + name + " - " + e.getMessage());
            return false;
        }
    }
    
    /**
     * Check if element is selected (for checkboxes, radio buttons, options)
     */
    public boolean isSelected() {
        try {
            return executeWithHealing(Action.CHECK_IF_SELECTED.toString(), () -> {
                WebElement element = getElement();
                return element.isSelected();
            });
        } catch (Exception e) {
            LoggerUtil.debug("Element not selected: " + name + " - " + e.getMessage());
            return false;
        }
    }
    
    /**
     * Check if element exists
     */
    public boolean exists() {
        try {
            driver.findElement(locator);
            return true;
        } catch (NoSuchElementException e) {
            return false;
        }
    }
    
    // ========================================
    // ADVANCED INTERACTIONS
    // ========================================
    
    /**
     * Scroll element into view
     */
    public Locator scrollIntoView() {
        executeWithHealing(Action.SCROLL_INTO_VIEW.toString(), () -> {
            WebElement element = getElement();
            ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView(true);", element);
            LoggerUtil.info("Scrolled element into view: " + name);
            return element;
        });
        return this;
    }
    
    /**
     * Hover over element
     */
    public Locator hover() {
        executeWithHealing(Action.HOVER.toString(), () -> {
            WebElement element = waitUtil.waitForVisibility(locator, name);
            new Actions(driver).moveToElement(element).perform();
            LoggerUtil.info("Hovered over element: " + name);
            return element;
        });
        return this;
    }
    
    /**
     * Drag and drop to another element
     */
    public Locator dragAndDropTo(Locator target) {
        executeWithHealing("dragAndDrop", () -> {
            WebElement sourceElement = waitUtil.waitForVisibility(locator, name);
            WebElement targetElement = target.getElement();
            new Actions(driver).dragAndDrop(sourceElement, targetElement).perform();
            LoggerUtil.info("Dragged " + name + " to " + target.name);
            return sourceElement;
        });
        return this;
    }
    
    /**
     * Execute JavaScript on the element
     */
    public Object executeScript(String script) {
        return executeWithHealing("executeScript", () -> {
            WebElement element = getElement();
            return ((JavascriptExecutor) driver).executeScript(script, element);
        });
    }
    
    /**
     * Click using JavaScript (bypasses normal click restrictions)
     */
    public Locator jsClick() {
        executeWithHealing("jsClick", () -> {
            WebElement element = getElement();
            ((JavascriptExecutor) driver).executeScript("arguments[0].click();", element);
            LoggerUtil.info("JavaScript clicked element: " + name);
            return element;
        });
        return this;
    }
    
    // ========================================
    // WAIT OPERATIONS
    // ========================================
    
    /**
     * Wait for element to be visible
     */
    public Locator waitForVisible() {
        waitUtil.waitForVisibility(locator, name);
        return this;
    }
    
    /**
     * Wait for element to be clickable
     */
    public Locator waitForClickable() {
        waitUtil.waitForClickability(locator, name);
        return this;
    }
    
    /**
     * Wait for element to be present
     */
    public Locator waitForPresent() {
        waitUtil.waitForPresence(locator, name);
        return this;
    }
    
    /**
     * Wait for element to disappear
     */
    public Locator waitForDisappear() {
        waitUtil.waitForInvisibility(locator, name);
        return this;
    }
    
    /**
     * Wait for specific text to appear
     */
    public Locator waitForText(String expectedText) {
        waitUtil.waitForTextPresent(locator, expectedText, name);
        return this;
    }
    
    // ========================================
    // CONFIGURATION METHODS
    // ========================================
    
    /**
     * Set retry count for operations
     */
    public Locator withRetryCount(int retryCount) {
        this.retryCount = retryCount;
        return this;
    }
    
    /**
     * Set timeout for operations
     */
    public Locator withTimeout(Duration timeout) {
        this.timeout = timeout;
        return this;
    }
    
    /**
     * Enable/disable healing for this locator
     */
    public Locator withHealing(boolean enabled) {
        this.healingEnabled = enabled;
        return this;
    }
    
    // ========================================
    // HEALING SUPPORT METHODS
    // ========================================
    
    /**
     * Execute operation with healing support
     */
    private <T> T executeWithHealing(String operation, java.util.function.Supplier<T> action) {
        if (!healingEnabled || !healingConfig.isHealingEnabled()) {
            return RetryUtil.executeWithRetry(action, name, operation, retryCount);
        }
        
        try {
            // Try original action first
            return RetryUtil.executeWithRetry(action, name, operation, retryCount);
        } catch (NoSuchElementException | StaleElementReferenceException | RetryException e) {
            LoggerUtil.info("Element operation failed, attempting healing for: " + name);
            
            // Try JSON-based healing first (using alternatives)
            Optional<T> healedResult = tryJsonAlternatives(action, operation);
            if (healedResult.isPresent()) {
                LoggerUtil.info("Successfully healed element using JSON alternatives: " + name);
                
                // Update the locator with healed version and save to JSON
                updateLocatorAfterHealing();
                
                return healedResult.get();
            }
            
            // If JSON healing failed, try advanced healing
            healedResult = healingManager.healAndRetry(locator, action);
            if (healedResult.isPresent()) {
                LoggerUtil.info("Successfully healed element using advanced healing: " + name);
                
                // Update the locator with healed version and save to JSON
                updateLocatorAfterHealing();
                
                return healedResult.get();
            } else {
                LoggerUtil.warn("Healing failed for element: " + name);
                throw e;
            }
        }
    }
    
    /**
     * Load healed locator from JSON if available
     */
    private void loadHealedLocatorIfAvailable() {
        try {
            LocatorDefinition definition = pageLocatorManager.getLocatorDefinition(pageName, elementId);
            LoggerUtil.info(String.format("DEBUG: %s.%s - definition=%s, isHealed=%s, locatorType=%s, locatorValue=%s", 
                    pageName, elementId, definition != null ? "found" : "null", 
                    definition != null ? definition.isHealed() : "N/A",
                    definition != null ? definition.getLocatorType() : "N/A",
                    definition != null ? definition.getLocatorValue() : "N/A"));
            if (definition != null && definition.isHealed()) {
                By healedLocator = pageLocatorManager.createByLocator(definition);
                if (healedLocator != null) {
                    this.locator = healedLocator;
                    LoggerUtil.info(String.format("Loaded healed locator for %s.%s: %s", 
                            pageName, elementId, healedLocator));
                }
            }
        } catch (Exception e) {
            LoggerUtil.warn("Failed to load healed locator for " + elementId + ": " + e.getMessage());
        }
    }
    
    /**
     * Update locator after successful healing and save to JSON
     */
    private void updateLocatorAfterHealing() {
        try {
            // Get the latest healed locator from healing manager
            // This would need to be implemented in HealingManager to return the healed locator
            By newLocator = getHealedLocatorFromManager();
            if (newLocator != null) {
                this.locator = newLocator;
                
                // Save to JSON for future use
                pageLocatorManager.updateHealedLocator(pageName, elementId, newLocator);
                
                LoggerUtil.info(String.format("Updated and saved healed locator for %s.%s: %s", 
                        pageName, elementId, newLocator));
            }
        } catch (Exception e) {
            LoggerUtil.warn("Failed to update healed locator: " + e.getMessage());
        }
    }
    
    /**
     * Get healed locator from healing manager
     * This is a placeholder - you'll need to implement this in HealingManager
     */
    private By getHealedLocatorFromManager() {
        // TODO: Implement this method in HealingManager to return the last successful healed locator
        // For now, return null - this needs to be implemented based on your healing manager's structure
        return null;
    }
    
    /**
     * Record successful interaction for healing learning
     */
    private void recordSuccessfulInteraction() {
        if (healingConfig.isHealingEnabled()) {
            healingManager.recordSuccessfulInteraction(locator, name, pageName);
        }
    }
    
    /**
     * Check if healing manager is initialized
     */
    private boolean isHealingManagerInitialized() {
        try {
            healingManager.isHealingEnabled();
            return true;
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Initialize healing manager
     */
    private void initializeHealingManager() {
        try {
            healingManager.initialize(driver);
            LoggerUtil.debug("Healing manager initialized for element: " + name);
        } catch (Exception e) {
            LoggerUtil.warn("Failed to initialize healing manager: " + e.getMessage());
        }
    }
    
    // ========================================
    // UTILITY METHODS
    // ========================================
    
    /**
     * Get the locator
     */
    public By getLocator() {
        return locator;
    }
    
    /**
     * Get element name
     */
    public String getName() {
        return name;
    }
    
    /**
     * Get element ID (for JSON persistence)
     */
    public String getElementId() {
        return elementId;
    }
    
    /**
     * Get page name
     */
    public String getPageName() {
        return pageName;
    }
    
    /**
     * Check if this locator has been healed
     */
    public boolean isHealed() {
        return pageLocatorManager.isLocatorHealed(pageName, elementId);
    }
    
    /**
     * Create a copy of this locator with a different name
     */
    public Locator withName(String newName) {
        return new Locator(driver, locator, newName, pageName, elementId);
    }
    
    /**
     * Create a copy of this locator with a different page name
     */
    public Locator withPageName(String newPageName) {
        return new Locator(driver, locator, name, newPageName, elementId);
    }
    
    /**
     * Try JSON alternatives for healing
     */
    private <T> Optional<T> tryJsonAlternatives(Supplier<T> action, String operation) {
        try {
            // For now, let's implement a simplified version that uses known alternatives
            // This could be enhanced to read from JSON files directly
            List<String> alternatives = getKnownAlternatives();
            
            if (alternatives.isEmpty()) {
                return Optional.empty();
            }
            
            LoggerUtil.info("Trying " + alternatives.size() + " JSON alternatives for: " + name);
            
            for (String alternative : alternatives) {
                try {
                    By alternativeLocator = createByLocatorFromString(alternative);
                    if (alternativeLocator != null) {
                        LoggerUtil.debug("Testing alternative: " + alternative);
                        
                        // Test if this alternative can find the element
                        WebElement element = driver.findElement(alternativeLocator);
                        if (element != null && element.isDisplayed()) {
                            LoggerUtil.info("Alternative locator works: " + alternative);
                            
                            // Update current locator to use this working alternative
                            this.locator = alternativeLocator;
                            
                            // Update JSON with healed locator
                            pageLocatorManager.updateHealedLocator(pageName, elementId, alternativeLocator);
                            
                            // Execute the action with healed locator
                            T result = action.get();
                            if (result != null) {
                                LoggerUtil.info("Successfully executed " + operation + " with healed locator: " + alternative);
                                return Optional.of(result);
                            }
                        }
                    }
                } catch (Exception e) {
                    LoggerUtil.debug("Alternative failed: " + alternative + " - " + e.getMessage());
                    // Continue to next alternative
                }
            }
            
            LoggerUtil.warn("All JSON alternatives failed for: " + name);
            return Optional.empty();
        } catch (Exception e) {
            LoggerUtil.error("Error during JSON alternative healing: " + e.getMessage(), e);
            return Optional.empty();
        }
    }
    
    /**
     * Get known alternatives for common elements
     * This is a simplified implementation - could be enhanced to read from JSON
     */
    private List<String> getKnownAlternatives() {
        List<String> alternatives = new java.util.ArrayList<>();
        
        // Add alternatives based on element name or ID
        if (name.toLowerCase().contains("username")) {
            alternatives.add("id=username_modified");
            alternatives.add("id=username");
            alternatives.add("name=username");
            alternatives.add("css=input[name='username']");
            alternatives.add("xpath=//input[@name='username']");
        } else if (name.toLowerCase().contains("password")) {
            alternatives.add("id=password_modified");
            alternatives.add("id=password");
            alternatives.add("name=password");
            alternatives.add("css=input[type='password']");
            alternatives.add("xpath=//input[@name='password']");
        } else if (name.toLowerCase().contains("login") && name.toLowerCase().contains("button")) {
            alternatives.add("id=login-btn");
            alternatives.add("css=button[type='submit']");
            alternatives.add("xpath=//button[text()='Login']");
            alternatives.add("name=login");
        }
        
        return alternatives;
    }
    
    /**
     * Create By locator from string format like "id=value", "css=value", etc.
     */
    private By createByLocatorFromString(String locatorString) {
        if (locatorString == null || !locatorString.contains("=")) {
            return null;
        }
        
        String[] parts = locatorString.split("=", 2);
        if (parts.length != 2) {
            return null;
        }
        
        String type = parts[0].toLowerCase().trim();
        String value = parts[1].trim();
        
        switch (type) {
            case "id":
                return By.id(value);
            case "name":
                return By.name(value);
            case "css":
            case "cssSelector":
                return By.cssSelector(value);
            case "xpath":
                return By.xpath(value);
            case "className":
                return By.className(value);
            case "tagName":
                return By.tagName(value);
            case "linkText":
                return By.linkText(value);
            case "partialLinkText":
                return By.partialLinkText(value);
            default:
                LoggerUtil.warn("Unknown locator type: " + type);
                return null;
        }
    }

    @Override
    public String toString() {
        return String.format("Locator{name='%s', locator=%s, page='%s'}", name, locator, pageName);
    }
}