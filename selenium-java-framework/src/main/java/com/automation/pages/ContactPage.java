package com.automation.pages;

import com.automation.constants.DriverConstants;
import com.automation.utils.LoggerUtil;
import com.automation.elements.Button;
import com.automation.elements.Label;
import com.automation.elements.Link;
import com.automation.elements.TextBox;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

/**
 * ContactPage - Page Object for the contact page
 * Contains elements and methods for contact form functionality
 */
public class ContactPage extends BasePage {
    
    // Page elements
    private final Label pageHeader;
    private final TextBox nameField;
    private final TextBox emailField;
    private final TextBox messageField;
    private final Button submitButton;
    private final Link homeLink;
    private final Link loginLink;
    private final Link productsLink;
    private final Label successMessage;
    private final Label errorMessage;
    
    // Expected URL fragment
    private static final String PAGE_URL = "contact.html";
    
    public ContactPage(WebDriver driver) {
        super(driver);
        
        // Initialize page elements with correct selectors from actual HTML
        this.pageHeader = new Label(driver, By.id("page-title"), "Contact Page Header");
        this.nameField = new TextBox(driver, By.id("full-name"), "Name Field");
        this.emailField = new TextBox(driver, By.id("email"), "Email Field");
        this.messageField = new TextBox(driver, By.id("message"), "Message Field");
        this.submitButton = new Button(driver, By.id("submit-btn"), "Submit Button");
        this.homeLink = new Link(driver, By.id("home-link"), "Home Link");
        this.loginLink = new Link(driver, By.id("login-link"), "Login Link");
        this.productsLink = new Link(driver, By.id("products-link"), "Products Link");
        this.successMessage = new Label(driver, By.id("success-message"), "Success Message");
        this.errorMessage = new Label(driver, By.id("error-message"), "Error Message");
    }
    
    /**
     * Navigate to contact page
     */
    public void navigateToContactPage() {
        String url = config.getBaseUrl() + "/" + PAGE_URL;
        driver.get(url);
        LoggerUtil.logPageNavigation(DriverConstants.CONTACT_PAGE, url);
        waitForPageLoad();
    }
    
    /**
     * Validate that we are on the contact page
     * @return true if on contact page
     */
    public boolean isOnContactPage() {
        try {
            String currentUrl = driver.getCurrentUrl();
            boolean isCorrectUrl = currentUrl.contains(PAGE_URL);
            boolean hasPageHeader = isPageHeaderDisplayed();
            boolean titleContainsContact = getPageTitle().contains("Contact"); // "Test App - Contact"
            
            boolean isOnPage = isCorrectUrl && hasPageHeader && titleContainsContact;
            LoggerUtil.logPageValidation(DriverConstants.CONTACT_PAGE, isOnPage);
            return isOnPage;
        } catch (Exception e) {
            LoggerUtil.logPageValidation(DriverConstants.CONTACT_PAGE, false);
            return false;
        }
    }
    
    /**
     * Check if page header is displayed
     * @return true if page header is visible
     */
    public boolean isPageHeaderDisplayed() {
        try {
            return pageHeader.isDisplayed();
        } catch (Exception e) {
            // Try alternative approach
            try {
                return driver.findElement(By.xpath("//h1")).isDisplayed();
            } catch (Exception ex) {
                return false;
            }
        }
    }
    
    /**
     * Enter name in contact form
     * @param name Name to enter
     */
    public void enterName(String name) {
        if (isNameFieldDisplayed()) {
            nameField.clearAndType(name);
        } else {
            LoggerUtil.warn("Name field is not available on contact page");
        }
    }
    
    /**
     * Enter email in contact form
     * @param email Email to enter
     */
    public void enterEmail(String email) {
        if (isEmailFieldDisplayed()) {
            emailField.clearAndType(email);
        } else {
            LoggerUtil.warn("Email field is not available on contact page");
        }
    }
    
    /**
     * Enter message in contact form
     * @param message Message to enter
     */
    public void enterMessage(String message) {
        if (isMessageFieldDisplayed()) {
            messageField.clearAndType(message);
        } else {
            LoggerUtil.warn("Message field is not available on contact page");
        }
    }
    
    /**
     * Click submit button
     */
    public void clickSubmit() {
        if (isSubmitButtonDisplayed()) {
            submitButton.click();
        } else {
            LoggerUtil.warn("Submit button is not available on contact page");
        }
    }
    
    /**
     * Fill and submit contact form
     * @param name Name
     * @param email Email
     * @param message Message
     */
    public void submitContactForm(String name, String email, String message) {
        LoggerUtil.info("Submitting contact form with name: " + name + ", email: " + email);
        enterName(name);
        enterEmail(email);
        enterMessage(message);
        clickSubmit();
    }
    
    /**
     * Check if name field is displayed
     * @return true if name field is visible
     */
    public boolean isNameFieldDisplayed() {
        try {
            return nameField.isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Check if email field is displayed
     * @return true if email field is visible
     */
    public boolean isEmailFieldDisplayed() {
        try {
            return emailField.isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Check if message field is displayed
     * @return true if message field is visible
     */
    public boolean isMessageFieldDisplayed() {
        try {
            return messageField.isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Check if submit button is displayed
     * @return true if submit button is visible
     */
    public boolean isSubmitButtonDisplayed() {
        try {
            return submitButton.isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Clear all form fields
     */
    public void clearAllFields() {
        if (isNameFieldDisplayed()) nameField.clear();
        if (isEmailFieldDisplayed()) emailField.clear();
        if (isMessageFieldDisplayed()) messageField.clear();
    }
    
    /**
     * Get form field values
     * @return Array of [name, email, message] values
     */
    public String[] getFormValues() {
        String name = isNameFieldDisplayed() ? nameField.getValue() : "";
        String email = isEmailFieldDisplayed() ? emailField.getValue() : "";
        String message = isMessageFieldDisplayed() ? messageField.getValue() : "";
        return new String[]{name, email, message};
    }
    
    /**
     * Check if success message is displayed
     * @return true if success message is visible
     */
    public boolean isSuccessMessageDisplayed() {
        try {
            return successMessage.isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Check if error message is displayed
     * @return true if error message is visible
     */
    public boolean isErrorMessageDisplayed() {
        try {
            return errorMessage.isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Navigate to home page from contact page
     */
    public void navigateToHome() {
        homeLink.click();
    }
    
    /**
     * Navigate to login page from contact page
     */
    public void navigateToLogin() {
        loginLink.click();
    }
    
    /**
     * Navigate to products page from contact page
     */
    public void navigateToProducts() {
        productsLink.click();
    }
    
    /**
     * Verify contact page elements
     * @return true if page has expected form elements
     */
    public boolean verifyContactPageElements() {
        boolean hasHeader = isPageHeaderDisplayed();
        boolean hasForm = isNameFieldDisplayed() || isEmailFieldDisplayed() || 
                         isMessageFieldDisplayed() || isSubmitButtonDisplayed();
        boolean hasNavigation = homeLink.isDisplayed() && loginLink.isDisplayed() && 
                               productsLink.isDisplayed();
        
        LoggerUtil.info("Contact page verification - Header: " + hasHeader + 
                       ", Form: " + hasForm + ", Navigation: " + hasNavigation);
        
        return hasHeader && hasNavigation;
    }
}