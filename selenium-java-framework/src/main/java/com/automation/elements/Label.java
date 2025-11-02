package com.automation.elements;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

/**
 * Label - Wrapper class for label elements
 * Extends BaseElement with label specific functionality
 */
public class Label extends BaseElement {
    
    public Label(WebDriver driver, By locator, String name) {
        super(driver, locator, name);
    }
    
    /**
     * Get label text (alias for getText)
     * @return Label text
     */
    public String getLabelText() {
        return getText();
    }
    
    /**
     * Get 'for' attribute that associates label with input
     * @return ID of associated input element
     */
    public String getFor() {
        return getAttribute("for");
    }
    
    /**
     * Check if label is associated with an input element
     * @return true if 'for' attribute is present
     */
    public boolean hasAssociatedInput() {
        String forAttribute = getFor();
        return forAttribute != null && !forAttribute.isEmpty();
    }
    
    /**
     * Click the associated input element (if exists)
     */
    public void clickAssociatedInput() {
        String forAttribute = getFor();
        if (forAttribute != null && !forAttribute.isEmpty()) {
            driver.findElement(By.id(forAttribute)).click();
        } else {
            // If no 'for' attribute, just click the label itself
            click();
        }
    }
}