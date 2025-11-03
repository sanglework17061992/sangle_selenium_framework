package com.automation.pages;

import com.automation.constants.FrameworkConstants;
import com.automation.utils.LoggerUtil;
import com.automation.elements.Button;
import com.automation.elements.Label;
import com.automation.elements.Link;
import com.automation.elements.TextBox;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import java.util.List;

/**
 * ProductsPage - Page Object for the products page
 * Contains elements and methods for browsing products
 */
public class ProductsPage extends BasePage {
    
    // Page elements
    private final Label pageHeader;
    private final TextBox searchBox;
    private final Button searchButton;
    private final Link homeLink;
    private final Link loginLink;
    private final Link contactLink;
    
    // Expected URL fragment
    private static final String PAGE_URL = "products.html";
    
    public ProductsPage(WebDriver driver) {
        super(driver);
        
        // Initialize page elements with correct selectors from the actual HTML
        this.pageHeader = new Label(driver, By.id("page-title"), "Products Page Header");
        this.searchBox = new TextBox(driver, By.id("search-input"), "Search Box");
        this.searchButton = new Button(driver, By.id("search-btn"), "Search Button");
        this.homeLink = new Link(driver, By.id("home-link"), "Home Link");
        this.loginLink = new Link(driver, By.id("login-link"), "Login Link");
        this.contactLink = new Link(driver, By.id("contact-link"), "Contact Link");
    }
    
    /**
     * Navigate to products page
     */
    public void navigateToProductsPage() {
        String url = config.getBaseUrl() + "/" + PAGE_URL;
        driver.get(url);
        LoggerUtil.logPageNavigation(FrameworkConstants.PRODUCTS_PAGE, url);
        waitForPageLoad();
    }
    
    /**
     * Validate that we are on the products page
     * @return true if on products page
     */
    public boolean isOnProductsPage() {
        try {
            String currentUrl = driver.getCurrentUrl();
            boolean isCorrectUrl = currentUrl.contains(PAGE_URL);
            boolean hasPageHeader = isPageHeaderDisplayed();
            boolean titleContainsProducts = getPageTitle().contains("Products"); // "Test App - Products"
            
            boolean isOnPage = isCorrectUrl && hasPageHeader && titleContainsProducts;
            LoggerUtil.logPageValidation(FrameworkConstants.PRODUCTS_PAGE, isOnPage);
            return isOnPage;
        } catch (Exception e) {
            LoggerUtil.logPageValidation(FrameworkConstants.PRODUCTS_PAGE, false);
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
            // Try alternative selector if the main one fails
            try {
                WebElement header = driver.findElement(By.xpath("//h1"));
                return header.isDisplayed();
            } catch (Exception ex) {
                return false;
            }
        }
    }
    
    /**
     * Get page header text
     * @return Page header text
     */
    public String getPageHeaderText() {
        try {
            return pageHeader.getText();
        } catch (Exception e) {
            // Try alternative selector
            try {
                WebElement header = driver.findElement(By.xpath("//h1"));
                return header.getText();
            } catch (Exception ex) {
                return "";
            }
        }
    }
    
    /**
     * Enter search term
     * @param searchTerm Term to search for
     */
    public void enterSearchTerm(String searchTerm) {
        if (isSearchBoxDisplayed()) {
            searchBox.clearAndType(searchTerm);
        } else {
            LoggerUtil.warn("Search box is not available on products page");
        }
    }
    
    /**
     * Click search button
     */
    public void clickSearch() {
        if (isSearchButtonDisplayed()) {
            searchButton.click();
        } else {
            LoggerUtil.warn("Search button is not available on products page");
        }
    }
    
    /**
     * Perform search
     * @param searchTerm Term to search for
     */
    public void search(String searchTerm) {
        LoggerUtil.info("Searching for: " + searchTerm);
        enterSearchTerm(searchTerm);
        clickSearch();
    }
    
    /**
     * Check if search box is displayed
     * @return true if search box is visible
     */
    public boolean isSearchBoxDisplayed() {
        try {
            return searchBox.isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Check if search button is displayed
     * @return true if search button is visible
     */
    public boolean isSearchButtonDisplayed() {
        try {
            return searchButton.isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Get search box value
     * @return Current search term
     */
    public String getSearchTerm() {
        if (isSearchBoxDisplayed()) {
            return searchBox.getValue();
        }
        return "";
    }
    
    /**
     * Clear search box
     */
    public void clearSearch() {
        if (isSearchBoxDisplayed()) {
            searchBox.clear();
        }
    }
    
    /**
     * Get all product elements (if any products are displayed)
     * @return List of product elements
     */
    public List<WebElement> getProductElements() {
        try {
            return driver.findElements(By.className("product-item"));
        } catch (Exception e) {
            LoggerUtil.warn("No products found or products container not available");
            return java.util.Collections.emptyList();
        }
    }
    
    /**
     * Get product count
     * @return Number of products displayed
     */
    public int getProductCount() {
        return getProductElements().size();
    }
    
    /**
     * Navigate to home page from products page
     */
    public void navigateToHome() {
        homeLink.click();
    }
    
    /**
     * Navigate to login page from products page
     */
    public void navigateToLogin() {
        loginLink.click();
    }
    
    /**
     * Navigate to contact page from products page
     */
    public void navigateToContact() {
        contactLink.click();
    }
    
    /**
     * Check if navigation links are displayed
     * @return true if all nav links are visible
     */
    public boolean areNavigationLinksDisplayed() {
        return homeLink.isDisplayed() && 
               loginLink.isDisplayed() && 
               contactLink.isDisplayed();
    }
    
    /**
     * Verify products page elements
     * @return true if page has expected structure
     */
    public boolean verifyProductsPageElements() {
        boolean hasHeader = isPageHeaderDisplayed();
        boolean hasNavigation = areNavigationLinksDisplayed();
        boolean hasSearchFeatures = isSearchBoxDisplayed() && isSearchButtonDisplayed();
        
        LoggerUtil.info("Products page verification - Header: " + hasHeader + 
                       ", Navigation: " + hasNavigation + 
                       ", Search: " + hasSearchFeatures);
        
        return hasHeader && hasNavigation;
    }
    
    /**
     * Wait for products to load
     * @param timeoutSeconds Timeout in seconds
     * @return true if products are loaded
     */
    public boolean waitForProductsToLoad(int timeoutSeconds) {
        long startTime = System.currentTimeMillis();
        long timeout = (long) timeoutSeconds * 1000;
        
        while (System.currentTimeMillis() - startTime < timeout) {
            if (getProductCount() > 0) {
                LoggerUtil.info("Products loaded - found " + getProductCount() + " products");
                return true;
            }
            try {
                Thread.sleep(500);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            }
        }
        
        LoggerUtil.warn("Timeout waiting for products to load after " + timeoutSeconds + " seconds");
        return false;
    }
}