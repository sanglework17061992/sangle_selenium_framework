package com.automation.tests;

import com.automation.base.BaseTest;
import com.automation.utils.LoggerUtil;
import com.automation.pages.HomePage;
import com.automation.pages.LoginPage;
import io.qameta.allure.*;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * LoginTest - Test class for login functionality
 * Contains test cases for login page validation and authentication
 */
@Epic("Authentication")
@Feature("Login Functionality")
public class LoginTest extends BaseTest {
    
    private LoginPage loginPage;
    private HomePage homePage;
    
    @BeforeMethod
    public void setUpTest() {
        // This will be called after BaseTest.setUp()
        loginPage = new LoginPage(driver);
        homePage = new HomePage(driver);
        
        // For login tests, we should NOT be logged in initially
        clearLoggedInUser();
    }
    
    @Test(description = "Verify successful login with valid credentials")
    @Story("Valid Login")
    @Severity(SeverityLevel.CRITICAL)
    @Description("Test successful login with demo credentials and verify redirect to products page")
    public void testValidLogin() {
        LoggerUtil.logTestStart("testValidLogin");
        
        // Navigate to login page
        loginPage.navigateToLoginPage();
        Assert.assertTrue(loginPage.isOnLoginPage(), "Should be on login page");
        
        // Verify login page elements
        Assert.assertTrue(loginPage.verifyLoginPageElements(), "Login page should have all required elements");
        
        // Perform login with valid credentials
        loginPage.loginWithDemoCredentials();
        
        // Wait for login result
        boolean loginSuccess = loginPage.waitForLoginResult(10);
        Assert.assertTrue(loginSuccess, "Login should be successful");
        
        // Verify success message appears
        Assert.assertTrue(loginPage.isSuccessMessageDisplayed(), "Success message should be displayed");
        
        // Verify redirect to products page (after success message)
        waitHelper.waitForUrlContains("products.html");
        Assert.assertTrue(driver.getCurrentUrl().contains("products.html"), 
                         "Should be redirected to products page after successful login");
        
        LoggerUtil.info("Valid login test completed successfully");
    }
    
    @Test(description = "Verify login fails with invalid credentials")
    @Story("Invalid Login")
    @Severity(SeverityLevel.NORMAL)
    @Description("Test login failure with invalid credentials and verify error message")
    public void testInvalidLogin() {
        LoggerUtil.logTestStart("testInvalidLogin");
        
        // Navigate to login page
        loginPage.navigateToLoginPage();
        Assert.assertTrue(loginPage.isOnLoginPage(), "Should be on login page");
        
        // Attempt login with invalid credentials
        loginPage.login("invaliduser", "wrongpassword");
        
        // Wait for login result
        boolean loginSuccess = loginPage.waitForLoginResult(5);
        Assert.assertFalse(loginSuccess, "Login should fail with invalid credentials");
        
        // Verify error message appears
        Assert.assertTrue(loginPage.isErrorMessageDisplayed(), "Error message should be displayed");
        
        // Verify error message content
        String errorMessage = loginPage.getErrorMessage();
        Assert.assertFalse(errorMessage.isEmpty(), "Error message should not be empty");
        Assert.assertTrue(errorMessage.contains("Invalid"), "Error message should indicate invalid credentials");
        
        // Verify still on login page
        Assert.assertTrue(loginPage.isOnLoginPage(), "Should remain on login page after failed login");
        
        LoggerUtil.info("Invalid login test completed successfully");
    }
    
    @Test(description = "Verify login page loads correctly")
    @Story("Login Page Validation")
    @Severity(SeverityLevel.NORMAL)
    @Description("Test login page loads with all required elements and proper navigation")
    public void testLoginPageValidation() {
        LoggerUtil.logTestStart("testLoginPageValidation");
        
        // Navigate to login page directly
        loginPage.navigateToLoginPage();
        
        // Verify page loads correctly
        Assert.assertTrue(loginPage.isOnLoginPage(), "Should be on login page");
        
        // Verify page title
        String pageTitle = loginPage.getLoginTitle();
        Assert.assertEquals(pageTitle, "Login to TestApp", "Login page should have correct title");
        
        // Verify all form elements are present
        Assert.assertTrue(loginPage.verifyLoginPageElements(), "All login form elements should be present");
        
        // Verify login button is enabled
        Assert.assertTrue(loginPage.isLoginButtonEnabled(), "Login button should be enabled");
        
        // Verify navigation links work
        loginPage.navigateToHome();
        Assert.assertTrue(homePage.isOnHomePage(), "Navigation to home page should work");
        
        // Navigate back to login
        loginPage.navigateToLoginPage();
        Assert.assertTrue(loginPage.isOnLoginPage(), "Should be able to navigate back to login page");
        
        LoggerUtil.info("Login page validation test completed successfully");
    }
    
    @Test(description = "Verify empty login form validation")
    @Story("Form Validation")
    @Severity(SeverityLevel.NORMAL)
    @Description("Test login behavior with empty username and password fields")
    public void testEmptyLoginForm() {
        LoggerUtil.logTestStart("testEmptyLoginForm");
        
        // Navigate to login page
        loginPage.navigateToLoginPage();
        Assert.assertTrue(loginPage.isOnLoginPage(), "Should be on login page");
        
        // Clear any existing values and attempt login with empty fields
        loginPage.clearAllFields();
        loginPage.clickLogin();
        
        // Verify form validation prevents submission or shows appropriate message
        // Note: This depends on the HTML5 validation or JavaScript validation in the app
        String username = loginPage.getUsernameValue();
        String password = loginPage.getPasswordValue();
        
        Assert.assertTrue(username.isEmpty(), "Username field should be empty");
        Assert.assertTrue(password.isEmpty(), "Password field should be empty");
        
        // Should still be on login page
        Assert.assertTrue(loginPage.isOnLoginPage(), "Should remain on login page");
        
        LoggerUtil.info("Empty login form test completed successfully");
    }
    
    @Test(description = "Verify partial credentials login")
    @Story("Invalid Login")
    @Severity(SeverityLevel.NORMAL)
    @Description("Test login with only username or only password provided")
    public void testPartialCredentialsLogin() {
        LoggerUtil.logTestStart("testPartialCredentialsLogin");
        
        // Navigate to login page
        loginPage.navigateToLoginPage();
        Assert.assertTrue(loginPage.isOnLoginPage(), "Should be on login page");
        
        // Test with only username
        loginPage.clearAllFields();
        loginPage.enterUsername(LoginPage.DEMO_USERNAME);
        loginPage.clickLogin();
        
        // Should still be on login page (form validation should prevent submission)
        Assert.assertTrue(loginPage.isOnLoginPage(), "Should remain on login page with only username");
        
        // Test with only password
        loginPage.clearAllFields();
        loginPage.enterPassword(LoginPage.DEMO_PASSWORD);
        loginPage.clickLogin();
        
        // Should still be on login page
        Assert.assertTrue(loginPage.isOnLoginPage(), "Should remain on login page with only password");
        
        LoggerUtil.info("Partial credentials login test completed successfully");
    }
}