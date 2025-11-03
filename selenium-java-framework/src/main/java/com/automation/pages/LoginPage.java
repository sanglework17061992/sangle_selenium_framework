package com.automation.pages;

import com.automation.constants.FrameworkConstants;
import com.automation.utils.LoggerUtil;
import com.automation.elements.Button;
import com.automation.elements.Label;
import com.automation.elements.Link;
import com.automation.elements.TextBox;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

/**
 * LoginPage - Page Object for the login page
 * Contains elements and methods for login functionality
 */
public class LoginPage extends BasePage {
    
    // Page elements
    private final Label loginTitle;
    private final TextBox usernameField;
    private final TextBox passwordField;
    private final Button loginButton;
    private final Label errorMessage;
    private final Label successMessage;
    private final Link homeLink;
    private final Link productsLink;
    private final Link contactLink;
    
    // Expected URL fragment
    private static final String PAGE_URL = "login.html";
    
    // Demo credentials
    public static final String DEMO_USERNAME = "testuser";
    public static final String DEMO_PASSWORD = "password123";
    
    public LoginPage(WebDriver driver) {
        super(driver);
        
        // Initialize page elements
        this.loginTitle = new Label(driver, By.id("login-title"), "Login Title");
        this.usernameField = new TextBox(driver, By.id("username"), "Username Field");
        this.passwordField = new TextBox(driver, By.id("password"), "Password Field");
        this.loginButton = new Button(driver, By.id("login-btn"), "Login Button");
        this.errorMessage = new Label(driver, By.id("error-message"), "Error Message");
        this.successMessage = new Label(driver, By.id("success-message"), "Success Message");
        this.homeLink = new Link(driver, By.id("home-link"), "Home Link");
        this.productsLink = new Link(driver, By.id("products-link"), "Products Link");
        this.contactLink = new Link(driver, By.id("contact-link"), "Contact Link");
    }
    
    /**
     * Navigate to login page
     */
    public void navigateToLoginPage() {
        String url = config.getBaseUrl() + "/" + PAGE_URL;
        driver.get(url);
        LoggerUtil.logPageNavigation(FrameworkConstants.LOGIN_PAGE, url);
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
            LoggerUtil.logPageValidation(FrameworkConstants.LOGIN_PAGE, isOnPage);
            return isOnPage;
        } catch (Exception e) {
            LoggerUtil.logPageValidation(FrameworkConstants.LOGIN_PAGE, false);
            return false;
        }
    }
    
    /**
     * Enter username
     * @param username Username to enter
     */
    public void enterUsername(String username) {
        usernameField.clearAndType(username);
    }
    
    /**
     * Enter password
     * @param password Password to enter
     */
    public void enterPassword(String password) {
        passwordField.clearAndType(password);
    }
    
    /**
     * Click login button
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
        LoggerUtil.info("Attempting login with username: " + username);
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
     * Get error message text
     * @return Error message text
     */
    public String getErrorMessage() {
        if (isErrorMessageDisplayed()) {
            return errorMessage.getText();
        }
        return "";
    }
    
    /**
     * Get success message text
     * @return Success message text
     */
    public String getSuccessMessage() {
        if (isSuccessMessageDisplayed()) {
            return successMessage.getText();
        }
        return "";
    }
    
    /**
     * Wait for login result (either error or success)
     * @param timeoutSeconds Timeout in seconds
     * @return true if success message appears, false if error message appears
     */
    public boolean waitForLoginResult(int timeoutSeconds) {
        long startTime = System.currentTimeMillis();
        long timeout = timeoutSeconds * 1000L;
        
        while (System.currentTimeMillis() - startTime < timeout) {
            if (isSuccessMessageDisplayed()) {
                LoggerUtil.info("Login success message appeared");
                return true;
            }
            if (isErrorMessageDisplayed()) {
                LoggerUtil.info("Login error message appeared");
                return false;
            }
            try {
                Thread.sleep(500);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            }
        }
        
        LoggerUtil.warn("Login result timeout - no success or error message appeared");
        return false;
    }
    
    /**
     * Clear username field
     */
    public void clearUsername() {
        usernameField.clear();
    }
    
    /**
     * Clear password field
     */
    public void clearPassword() {
        passwordField.clear();
    }
    
    /**
     * Clear all login fields
     */
    public void clearAllFields() {
        clearUsername();
        clearPassword();
    }
    
    /**
     * Get username field value
     * @return Current username value
     */
    public String getUsernameValue() {
        return usernameField.getValue();
    }
    
    /**
     * Get password field value
     * @return Current password value
     */
    public String getPasswordValue() {
        return passwordField.getValue();
    }
    
    /**
     * Check if login button is enabled
     * @return true if login button is enabled
     */
    public boolean isLoginButtonEnabled() {
        return loginButton.isEnabled();
    }
    
    /**
     * Navigate to home page from login page
     */
    public void navigateToHome() {
        homeLink.click();
    }
    
    /**
     * Navigate to products page from login page
     */
    public void navigateToProducts() {
        productsLink.click();
    }
    
    /**
     * Navigate to contact page from login page
     */
    public void navigateToContact() {
        contactLink.click();
    }
    
    /**
     * Get login page title
     * @return Login page title text
     */
    public String getLoginTitle() {
        return loginTitle.getText();
    }
    
    /**
     * Verify login page elements are present
     * @return true if all required elements are present
     */
    public boolean verifyLoginPageElements() {
        return loginTitle.isDisplayed() &&
               usernameField.isDisplayed() &&
               passwordField.isDisplayed() &&
               loginButton.isDisplayed();
    }
}