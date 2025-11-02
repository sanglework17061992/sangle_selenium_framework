package com.automation.pages.healing;

import com.automation.constants.DriverConstants;
import com.automation.utils.LoggerUtil;
import com.automation.healing.elements.HealingTextBox;
import com.automation.healing.elements.HealingButton;
import com.automation.healing.elements.HealingLabel;
import com.automation.healing.elements.HealingLink;
import com.automation.pages.BasePage;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

/**
 * HealingLoginPage - Self-healing version of LoginPage
 * Demonstrates self-healing locator capabilities with existing elements
 */
public class HealingLoginPage extends BasePage {
    
    // Healing-enabled page elements
    private final HealingLabel loginTitle;
    private final HealingTextBox usernameField;
    private final HealingTextBox passwordField;
    private final HealingButton loginButton;
    private final HealingLabel errorMessage;
    private final HealingLabel successMessage;
    private final HealingLink homeLink;
    private final HealingLink productsLink;
    private final HealingLink contactLink;
    
    // Expected URL fragment
    private static final String PAGE_URL = "login.html";
    private static final String PAGE_NAME = "LoginPage";
    
    // Demo credentials
    public static final String DEMO_USERNAME = "testuser";
    public static final String DEMO_PASSWORD = "password123";
    
    public HealingLoginPage(WebDriver driver) {
        super(driver);
        
        // Initialize healing-enabled page elements
        this.loginTitle = new HealingLabel(driver, By.id("login-title"), "Login Title", PAGE_NAME);
        this.usernameField = new HealingTextBox(driver, By.id("username"), "Username Field", PAGE_NAME);
        this.passwordField = new HealingTextBox(driver, By.id("password"), "Password Field", PAGE_NAME);
        this.loginButton = new HealingButton(driver, By.id("login-btn"), "Login Button", PAGE_NAME);
        this.errorMessage = new HealingLabel(driver, By.id("error-message"), "Error Message", PAGE_NAME);
        this.successMessage = new HealingLabel(driver, By.id("success-message"), "Success Message", PAGE_NAME);
        this.homeLink = new HealingLink(driver, By.id("home-link"), "Home Link", PAGE_NAME);
        this.productsLink = new HealingLink(driver, By.id("products-link"), "Products Link", PAGE_NAME);
        this.contactLink = new HealingLink(driver, By.id("contact-link"), "Contact Link", PAGE_NAME);
    }
    
    /**
     * Navigate to login page
     */
    public void navigateToLoginPage() {
        String url = config.getBaseUrl() + "/" + PAGE_URL;
        driver.get(url);
        LoggerUtil.logPageNavigation(DriverConstants.LOGIN_PAGE, url);
        waitForPageLoad();
    }
    
    /**
     * Validate that we are on the login page
     * @return true if on login page
     */
    public boolean isOnLoginPage() {
        try {
            loginTitle.waitForVisible();
            String currentUrl = driver.getCurrentUrl();
            boolean isCorrectUrl = currentUrl.contains(PAGE_URL);
            boolean hasTitleElement = loginTitle.isDisplayed();
            boolean hasCorrectTitle = "Login to TestApp".equals(loginTitle.getText());
            boolean hasUsernameField = usernameField.isDisplayed();
            boolean hasPasswordField = passwordField.isDisplayed();
            boolean hasLoginButton = loginButton.isDisplayed();
            
            boolean isOnPage = isCorrectUrl && hasTitleElement && hasCorrectTitle && 
                              hasUsernameField && hasPasswordField && hasLoginButton;
            LoggerUtil.logPageValidation(DriverConstants.LOGIN_PAGE, isOnPage);
            return isOnPage;
        } catch (Exception e) {
            LoggerUtil.logPageValidation(DriverConstants.LOGIN_PAGE, false);
            return false;
        }
    }
    
    /**
     * Enter username with self-healing capability
     * @param username Username to enter
     */
    public void enterUsername(String username) {
        usernameField.clearAndType(username);
    }
    
    /**
     * Enter password with self-healing capability
     * @param password Password to enter
     */
    public void enterPassword(String password) {
        passwordField.clearAndType(password);
    }
    
    /**
     * Click login button with self-healing capability
     */
    public void clickLogin() {
        loginButton.click();
    }
    
    /**
     * Perform login with credentials
     * @param username Username
     * @param password Password
     */
    public void login(String username, String password) {
        LoggerUtil.info("Attempting login with username: " + username + " (using self-healing locators)");
        enterUsername(username);
        enterPassword(password);
        clickLogin();
    }
    
    /**
     * Perform login with demo credentials
     */
    public void loginWithDemoCredentials() {
        login(DEMO_USERNAME, DEMO_PASSWORD);
    }
    
    /**
     * Check if error message is displayed with self-healing
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
     * Check if success message is displayed with self-healing
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
     * Get error message text with self-healing
     * @return Error message text
     */
    public String getErrorMessage() {
        if (isErrorMessageDisplayed()) {
            return errorMessage.getText();
        }
        return "";
    }
    
    /**
     * Get success message text with self-healing
     * @return Success message text
     */
    public String getSuccessMessage() {
        if (isSuccessMessageDisplayed()) {
            return successMessage.getText();
        }
        return "";
    }
    
    /**
     * Wait for login result with self-healing elements
     * @param timeoutSeconds Timeout in seconds
     * @return true if success message appears, false if error message appears
     */
    public boolean waitForLoginResult(int timeoutSeconds) {
        long startTime = System.currentTimeMillis();
        long timeout = timeoutSeconds * 1000L;
        
        while (System.currentTimeMillis() - startTime < timeout) {
            if (isSuccessMessageDisplayed()) {
                LoggerUtil.info("Login success message appeared (self-healing)");
                return true;
            }
            if (isErrorMessageDisplayed()) {
                LoggerUtil.info("Login error message appeared (self-healing)");
                return false;
            }
            try {
                Thread.sleep(500);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            }
        }
        
        LoggerUtil.warn("Login result timeout - no success or error message appeared (self-healing)");
        return false;
    }
    
    /**
     * Navigate to home page with self-healing
     */
    public void navigateToHome() {
        homeLink.click();
    }
    
    /**
     * Navigate to products page with self-healing
     */
    public void navigateToProducts() {
        productsLink.click();
    }
    
    /**
     * Navigate to contact page with self-healing
     */
    public void navigateToContact() {
        contactLink.click();
    }
    
    /**
     * Get login page title with self-healing
     * @return Login page title text
     */
    public String getLoginTitle() {
        return loginTitle.getText();
    }
    
    /**
     * Verify login page elements are present with self-healing
     * @return true if all required elements are present
     */
    public boolean verifyLoginPageElements() {
        return loginTitle.isDisplayed() &&
               usernameField.isDisplayed() &&
               passwordField.isDisplayed() &&
               loginButton.isDisplayed();
    }
    
    /**
     * Clear username field with self-healing
     */
    public void clearUsername() {
        usernameField.clear();
    }
    
    /**
     * Clear password field with self-healing
     */
    public void clearPassword() {
        passwordField.clear();
    }
    
    /**
     * Clear all login fields with self-healing
     */
    public void clearAllFields() {
        clearUsername();
        clearPassword();
    }
    
    /**
     * Get username field value with self-healing
     * @return Current username value
     */
    public String getUsernameValue() {
        return usernameField.getValue();
    }
    
    /**
     * Get password field value with self-healing
     * @return Current password value
     */
    public String getPasswordValue() {
        return passwordField.getValue();
    }
    
    /**
     * Check if login button is enabled with self-healing
     * @return true if login button is enabled
     */
    public boolean isLoginButtonEnabled() {
        return loginButton.isEnabled();
    }
}