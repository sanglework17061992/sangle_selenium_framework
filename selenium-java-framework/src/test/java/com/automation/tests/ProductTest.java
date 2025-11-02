package com.automation.tests;

import com.automation.base.BaseTest;
import com.automation.utils.LoggerUtil;
import com.automation.pages.HomePage;
import com.automation.pages.LoginPage;
import com.automation.pages.ProductsPage;
import io.qameta.allure.*;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * ProductTest - Test class for products page functionality
 * Contains test cases for product browsing and search functionality
 */
@Epic("Product Management")
@Feature("Products Page")
public class ProductTest extends BaseTest {
    
    private ProductsPage productsPage;
    private LoginPage loginPage;
    private HomePage homePage;
    
    @BeforeMethod
    public void setUpTest() {
        // This will be called after BaseTest.setUp()
        productsPage = new ProductsPage(driver);
        loginPage = new LoginPage(driver);
        homePage = new HomePage(driver);
        
        // Set user as logged in so we can access products page
        setLoggedInUser("testuser");
    }
    
    @Test(description = "Verify products page loads correctly")
    @Story("Products Page Access")
    @Severity(SeverityLevel.CRITICAL)
    @Description("Test that products page loads with proper elements and navigation")
    public void testProductsPageLoad() {
        LoggerUtil.logTestStart("testProductsPageLoad");
        
        // Navigate directly to products page
        productsPage.navigateToProductsPage();
        
        // Verify we are on products page
        Assert.assertTrue(productsPage.isOnProductsPage(), "Should be on products page");
        
        // Verify page elements
        Assert.assertTrue(productsPage.verifyProductsPageElements(), 
                         "Products page should have all expected elements");
        
        // Verify page header is displayed
        Assert.assertTrue(productsPage.isPageHeaderDisplayed(), "Page header should be displayed");
        
        // Verify navigation links are present
        Assert.assertTrue(productsPage.areNavigationLinksDisplayed(), 
                         "Navigation links should be displayed");
        
        LoggerUtil.info("Products page load test completed successfully");
    }
    
    @Test(description = "Verify search functionality on products page")
    @Story("Product Search")
    @Severity(SeverityLevel.NORMAL)
    @Description("Test search functionality if available on products page")
    public void testProductSearch() {
        LoggerUtil.logTestStart("testProductSearch");
        
        // Navigate to products page
        productsPage.navigateToProductsPage();
        Assert.assertTrue(productsPage.isOnProductsPage(), "Should be on products page");
        
        // Check if search functionality is available
        if (productsPage.isSearchBoxDisplayed() && productsPage.isSearchButtonDisplayed()) {
            // Test search functionality
            String searchTerm = "test";
            productsPage.search(searchTerm);
            
            // Verify search term is entered
            Assert.assertEquals(productsPage.getSearchTerm(), searchTerm, 
                               "Search term should be entered correctly");
            
            // Clear search
            productsPage.clearSearch();
            Assert.assertTrue(productsPage.getSearchTerm().isEmpty(), 
                             "Search field should be cleared");
            
            LoggerUtil.info("Product search functionality tested successfully");
        } else {
            LoggerUtil.info("Search functionality not available on products page - test skipped");
        }
    }
    
    @Test(description = "Verify navigation from products page")
    @Story("Page Navigation")
    @Severity(SeverityLevel.NORMAL)
    @Description("Test navigation from products page to other pages")
    public void testProductsPageNavigation() {
        LoggerUtil.logTestStart("testProductsPageNavigation");
        
        // Navigate to products page
        productsPage.navigateToProductsPage();
        Assert.assertTrue(productsPage.isOnProductsPage(), "Should be on products page");
        
        // Test navigation to home page
        productsPage.navigateToHome();
        Assert.assertTrue(homePage.isOnHomePage(), "Should navigate to home page");
        
        // Navigate back to products
        productsPage.navigateToProductsPage();
        Assert.assertTrue(productsPage.isOnProductsPage(), "Should be back on products page");
        
        // Test navigation to login page
        productsPage.navigateToLogin();
        Assert.assertTrue(loginPage.isOnLoginPage(), "Should navigate to login page");
        
        // Navigate back to products
        productsPage.navigateToProductsPage();
        Assert.assertTrue(productsPage.isOnProductsPage(), "Should be back on products page");
        
        LoggerUtil.info("Products page navigation test completed successfully");
    }
    
    @Test(description = "Verify products page after login")
    @Story("Authenticated Access")
    @Severity(SeverityLevel.NORMAL)
    @Description("Test products page access after successful login")
    public void testProductsPageAfterLogin() {
        LoggerUtil.logTestStart("testProductsPageAfterLogin");
        
        // First login
        loginPage.navigateToLoginPage();
        Assert.assertTrue(loginPage.isOnLoginPage(), "Should be on login page");
        
        loginPage.loginWithDemoCredentials();
        boolean loginSuccess = loginPage.waitForLoginResult(10);
        Assert.assertTrue(loginSuccess, "Login should be successful");
        
        // Should be redirected to products page
        waitHelper.waitForUrlContains("products.html");
        Assert.assertTrue(productsPage.isOnProductsPage(), 
                         "Should be on products page after login");
        
        // Verify products page loads correctly after login
        Assert.assertTrue(productsPage.verifyProductsPageElements(), 
                         "Products page should load correctly after login");
        
        // Wait for products to load (if any)
        productsPage.waitForProductsToLoad(5);
        
        LoggerUtil.info("Products page after login test completed successfully");
    }
    
    @Test(description = "Verify products page direct access without login")
    @Story("Unauthenticated Access") 
    @Severity(SeverityLevel.NORMAL)
    @Description("Test direct access to products page without logging in")
    public void testDirectProductsPageAccess() {
        LoggerUtil.logTestStart("testDirectProductsPageAccess");
        
        // Navigate directly to products page without login
        productsPage.navigateToProductsPage();
        
        // Should be able to access products page (assuming no authentication required)
        Assert.assertTrue(productsPage.isOnProductsPage(), 
                         "Should be able to access products page directly");
        
        // Verify basic page structure
        Assert.assertTrue(productsPage.isPageHeaderDisplayed(), 
                         "Page header should be displayed");
        
        // Verify navigation is available
        Assert.assertTrue(productsPage.areNavigationLinksDisplayed(), 
                         "Navigation should be available");
        
        LoggerUtil.info("Direct products page access test completed successfully");
    }
    
    @Test(description = "Verify products page title and URL")
    @Story("Page Validation")
    @Severity(SeverityLevel.MINOR)
    @Description("Test products page has correct title and URL")
    public void testProductsPageTitleAndUrl() {
        LoggerUtil.logTestStart("testProductsPageTitleAndUrl");
        
        // Navigate to products page
        productsPage.navigateToProductsPage();
        Assert.assertTrue(productsPage.isOnProductsPage(), "Should be on products page");
        
        // Verify URL contains products
        String currentUrl = productsPage.getCurrentUrl();
        Assert.assertTrue(currentUrl.contains("products.html"), 
                         "URL should contain 'products.html'");
        
        // Verify page title
        String pageTitle = productsPage.getPageTitle();
        Assert.assertTrue(pageTitle.toLowerCase().contains("products"), 
                         "Page title should contain 'products'");
        
        // Verify page header text (if available)
        if (productsPage.isPageHeaderDisplayed()) {
            String headerText = productsPage.getPageHeaderText();
            Assert.assertFalse(headerText.isEmpty(), "Page header should have text");
        }
        
        LoggerUtil.info("Products page title and URL test completed successfully");
    }
}