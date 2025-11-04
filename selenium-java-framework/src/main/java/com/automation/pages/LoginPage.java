package com.automation.pages;

import org.openqa.selenium.WebDriver;

/**
 * LoginPage - Example of how to use JSON-based locators in PageObjectModel
 * All locators are automatically loaded from LoginPage.json
 */
public class LoginPage extends BasePage {
    
    public LoginPage(WebDriver driver) {
        super(driver, "LoginPage");
    }
    
    // ========================================
    // PAGE ACTIONS - Super Simple Now!
    // ========================================
    
    /**
     * Enter username
     */
    public LoginPage enterUsername(String username) {
        getLocator("usernameField").type(username);
        return this;
    }
    
    /**
     * Enter password
     */
    public LoginPage enterPassword(String password) {
        getLocator("passwordField").type(password);
        return this;
    }
    
    /**
     * Click remember me checkbox
     */
    public LoginPage selectRememberMe() {
        getLocator("rememberCheckbox").check();
        return this;
    }
    
    /**
     * Click login button
     */
    public void clickLogin() {
        getLocator("loginButton").click();
    }
    
    /**
     * Click forgot password link
     */
    public void clickForgotPassword() {
        getLocator("forgotPasswordLink").click();
    }
    
    /**
     * Complete login process
     */
    public void login(String username, String password) {
        enterUsername(username)
            .enterPassword(password)
            .clickLogin();
    }
    
    /**
     * Complete login with remember me
     */
    public void loginWithRememberMe(String username, String password) {
        enterUsername(username)
            .enterPassword(password)
            .selectRememberMe()
            .clickLogin();
    }
    
    // ========================================
    // VALIDATION METHODS
    // ========================================
    
    /**
     * Check if login button is displayed
     */
    public boolean isLoginButtonDisplayed() {
        return getLocator("loginButton").isDisplayed();
    }
    
    /**
     * Check if all login elements are present
     */
    public boolean areAllElementsPresent() {
        return hasLocator("usernameField") && 
               hasLocator("passwordField") && 
               hasLocator("loginButton") &&
               getLocator("usernameField").exists() &&
               getLocator("passwordField").exists() &&
               getLocator("loginButton").exists();
    }
}