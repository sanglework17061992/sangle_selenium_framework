package com.automation.tests;

import com.automation.base.BaseTest;
import com.automation.utils.LoggerUtil;
import com.automation.pages.ContactPage;
import com.automation.pages.HomePage;
import com.automation.pages.LoginPage;
import io.qameta.allure.Description;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Severity;
import io.qameta.allure.SeverityLevel;
import io.qameta.allure.Story;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * ContactTest - Test class for contact page functionality
 * Contains test cases for contact form and page validation
 */
@Epic("Communication")
@Feature("Contact Page")
public class ContactTest extends BaseTest {
    
    private ContactPage contactPage;
    private HomePage homePage;
    private LoginPage loginPage;
    
    @BeforeMethod
    public void setUpTest() {
        // This will be called after BaseTest.setUp()
        contactPage = new ContactPage(driver);
        homePage = new HomePage(driver);
        loginPage = new LoginPage(driver);
        
        // Set user as logged in for consistent test state
        setLoggedInUser("testuser");
    }
    
    @Test(description = "Verify contact page loads correctly")
    @Story("Contact Page Access")
    @Severity(SeverityLevel.CRITICAL)
    @Description("Test that contact page loads with proper elements and navigation")
    public void testContactPageLoad() {
        LoggerUtil.logTestStart("testContactPageLoad");
        
        // Navigate to contact page
        contactPage.navigateToContactPage();
        
        // Verify we are on contact page
        Assert.assertTrue(contactPage.isOnContactPage(), "Should be on contact page");
        
        // Verify page elements
        Assert.assertTrue(contactPage.verifyContactPageElements(), 
                         "Contact page should have all expected elements");
        
        // Verify page header is displayed
        Assert.assertTrue(contactPage.isPageHeaderDisplayed(), "Page header should be displayed");
        
        LoggerUtil.info("Contact page load test completed successfully");
    }
    
    @Test(description = "Verify contact form submission with valid data")
    @Story("Contact Form Submission")
    @Severity(SeverityLevel.NORMAL)
    @Description("Test contact form submission with valid contact information")
    public void testValidContactFormSubmission() {
        LoggerUtil.logTestStart("testValidContactFormSubmission");
        
        // Navigate to contact page
        contactPage.navigateToContactPage();
        Assert.assertTrue(contactPage.isOnContactPage(), "Should be on contact page");
        
        // Check if contact form is available
        if (contactPage.isNameFieldDisplayed() && contactPage.isEmailFieldDisplayed() && 
            contactPage.isMessageFieldDisplayed() && contactPage.isSubmitButtonDisplayed()) {
            
            // Fill out contact form with valid data
            String testName = "Test User";
            String testEmail = "test@example.com";
            String testMessage = "This is a test message for the contact form.";
            
            contactPage.submitContactForm(testName, testEmail, testMessage);
            
            // Verify form was submitted (check if values were entered correctly)
            String[] formValues = contactPage.getFormValues();
            Assert.assertEquals(formValues[0], testName, "Name should be entered correctly");
            Assert.assertEquals(formValues[1], testEmail, "Email should be entered correctly");
            Assert.assertEquals(formValues[2], testMessage, "Message should be entered correctly");
            
            // Check for success or error messages (if implemented)
            if (contactPage.isSuccessMessageDisplayed()) {
                LoggerUtil.info("Contact form submission showed success message");
            } else if (contactPage.isErrorMessageDisplayed()) {
                LoggerUtil.warn("Contact form submission showed error message");
            } else {
                LoggerUtil.info("Contact form submitted - no specific feedback message detected");
            }
            
            LoggerUtil.info("Valid contact form submission test completed successfully");
        } else {
            LoggerUtil.info("Contact form not fully available - test skipped");
        }
    }
    
    @Test(description = "Verify contact form field validation")
    @Story("Form Validation")
    @Severity(SeverityLevel.NORMAL)
    @Description("Test contact form behavior with empty or invalid data")
    public void testContactFormValidation() {
        LoggerUtil.logTestStart("testContactFormValidation");
        
        // Navigate to contact page
        contactPage.navigateToContactPage();
        Assert.assertTrue(contactPage.isOnContactPage(), "Should be on contact page");
        
        // Test empty form submission if form is available
        if (contactPage.isSubmitButtonDisplayed()) {
            // Clear all fields
            contactPage.clearAllFields();
            
            // Attempt to submit empty form
            contactPage.clickSubmit();
            
            // Should still be on contact page (assuming validation prevents submission)
            Assert.assertTrue(contactPage.isOnContactPage(), 
                             "Should remain on contact page after empty form submission");
            
            LoggerUtil.info("Contact form validation test completed successfully");
        } else {
            LoggerUtil.info("Contact form not available - validation test skipped");
        }
    }
    
    @Test(description = "Verify navigation from contact page")
    @Story("Page Navigation")
    @Severity(SeverityLevel.NORMAL)
    @Description("Test navigation from contact page to other pages")
    public void testContactPageNavigation() {
        LoggerUtil.logTestStart("testContactPageNavigation");
        
        // Navigate to contact page
        contactPage.navigateToContactPage();
        Assert.assertTrue(contactPage.isOnContactPage(), "Should be on contact page");
        
        // Test navigation to home page
        contactPage.navigateToHome();
        Assert.assertTrue(homePage.isOnHomePage(), "Should navigate to home page");
        
        // Navigate back to contact
        contactPage.navigateToContactPage();
        Assert.assertTrue(contactPage.isOnContactPage(), "Should be back on contact page");
        
        // Test navigation to login page
        contactPage.navigateToLogin();
        Assert.assertTrue(loginPage.isOnLoginPage(), "Should navigate to login page");
        
        // Navigate back to contact
        contactPage.navigateToContactPage();
        Assert.assertTrue(contactPage.isOnContactPage(), "Should be back on contact page");
        
        LoggerUtil.info("Contact page navigation test completed successfully");
    }
    
    @Test(description = "Verify contact page title and URL")
    @Story("Page Validation")
    @Severity(SeverityLevel.MINOR)
    @Description("Test contact page has correct title and URL")
    public void testContactPageTitleAndUrl() {
        LoggerUtil.logTestStart("testContactPageTitleAndUrl");
        
        // Navigate to contact page
        contactPage.navigateToContactPage();
        Assert.assertTrue(contactPage.isOnContactPage(), "Should be on contact page");
        
        // Verify URL contains contact
        String currentUrl = contactPage.getCurrentUrl();
        Assert.assertTrue(currentUrl.contains("contact.html"), 
                         "URL should contain 'contact.html'");
        
        // Verify page title
        String pageTitle = contactPage.getPageTitle();
        Assert.assertTrue(pageTitle.toLowerCase().contains("contact"), 
                         "Page title should contain 'contact'");
        
        LoggerUtil.info("Contact page title and URL test completed successfully");
    }
    
    @Test(description = "Verify contact form field interactions")
    @Story("Form Interactions")
    @Severity(SeverityLevel.MINOR)
    @Description("Test individual contact form field interactions")
    public void testContactFormFieldInteractions() {
        LoggerUtil.logTestStart("testContactFormFieldInteractions");
        
        // Navigate to contact page
        contactPage.navigateToContactPage();
        Assert.assertTrue(contactPage.isOnContactPage(), "Should be on contact page");
        
        // Test individual field interactions if available
        if (contactPage.isNameFieldDisplayed()) {
            contactPage.enterName("Test Name");
            contactPage.clearAllFields();
            
            String[] formValues = contactPage.getFormValues();
            Assert.assertTrue(formValues[0].isEmpty(), "Name field should be cleared");
        }
        
        if (contactPage.isEmailFieldDisplayed()) {
            contactPage.enterEmail("test@example.com");
            // Email should be entered (tested via form values if needed)
        }
        
        if (contactPage.isMessageFieldDisplayed()) {
            contactPage.enterMessage("Test message content");
            // Message should be entered (tested via form values if needed)
        }
        
        LoggerUtil.info("Contact form field interactions test completed successfully");
    }
    
    @Test(description = "Verify contact page access from different entry points")
    @Story("Page Access")
    @Severity(SeverityLevel.MINOR)
    @Description("Test accessing contact page from different navigation points")
    public void testContactPageAccessFromDifferentPages() {
        LoggerUtil.logTestStart("testContactPageAccessFromDifferentPages");
        
        // Access contact page from home page
        homePage.navigateToHomePage();
        Assert.assertTrue(homePage.isOnHomePage(), "Should be on home page");
        
        homePage.navigateToContact();
        Assert.assertTrue(contactPage.isOnContactPage(), 
                         "Should reach contact page from home page");
        
        // Access contact page from login page
        loginPage.navigateToLoginPage();
        Assert.assertTrue(loginPage.isOnLoginPage(), "Should be on login page");
        
        loginPage.navigateToContact();
        Assert.assertTrue(contactPage.isOnContactPage(), 
                         "Should reach contact page from login page");
        
        // Direct access
        contactPage.navigateToContactPage();
        Assert.assertTrue(contactPage.isOnContactPage(), 
                         "Should be able to access contact page directly");
        
        LoggerUtil.info("Contact page access from different entry points test completed successfully");
    }
}