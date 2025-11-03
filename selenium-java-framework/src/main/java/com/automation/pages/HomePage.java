package com.automation.pages;

import com.automation.constants.FrameworkConstants;
import com.automation.utils.LoggerUtil;
import com.automation.elements.Button;
import com.automation.elements.Label;
import com.automation.elements.Link;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

/**
 * HomePage - Page Object for the test application home page
 * Contains elements and methods for interacting with the home page
 */
public class HomePage extends BasePage {
    
    // Page elements
    private final Label pageTitle;
    private final Label pageDescription;
    private final Button getStartedButton;
    private final Link homeLink;
    private final Link loginLink;
    private final Link productsLink;
    private final Link contactLink;
    private final Label appLogo;
    private final Label loggedUser;
    private final Button logoutButton;
    
    // Expected URL fragment
    private static final String PAGE_URL = "index.html";
    
    public HomePage(WebDriver driver) {
        super(driver);
        
        // Initialize page elements
        this.pageTitle = new Label(driver, By.id("page-title"), "Page Title");
        this.pageDescription = new Label(driver, By.id("page-description"), "Page Description");
        this.getStartedButton = new Button(driver, By.id("get-started-btn"), "Get Started Button");
        this.homeLink = new Link(driver, By.id("home-link"), "Home Link");
        this.loginLink = new Link(driver, By.id("login-link"), "Login Link");
        this.productsLink = new Link(driver, By.id("products-link"), "Products Link");
        this.contactLink = new Link(driver, By.id("contact-link"), "Contact Link");
        this.appLogo = new Label(driver, By.id("app-logo"), "App Logo");
        this.loggedUser = new Label(driver, By.id("logged-user"), "Logged User");
        this.logoutButton = new Button(driver, By.id("logout-btn"), "Logout Button");
    }
    
    /**
     * Navigate to home page
     */
    public void navigateToHomePage() {
        String url = config.getBaseUrl() + "/" + PAGE_URL;
        driver.get(url);
        LoggerUtil.logPageNavigation(FrameworkConstants.HOME_PAGE, url);
        waitForPageLoad();
    }
    
    /**
     * Validate that we are on the home page
     * @return true if on home page
     */
    public boolean isOnHomePage() {
        try {
            pageTitle.waitForVisible();
            String currentUrl = driver.getCurrentUrl();
            boolean isCorrectUrl = currentUrl.contains(PAGE_URL) || currentUrl.endsWith("/");
            boolean hasTitleElement = pageTitle.isDisplayed();
            boolean hasCorrectTitle = "Welcome to TestApp".equals(pageTitle.getText());
            
            boolean isOnPage = isCorrectUrl && hasTitleElement && hasCorrectTitle;
            LoggerUtil.logPageValidation(FrameworkConstants.HOME_PAGE, isOnPage);
            return isOnPage;
        } catch (Exception e) {
            LoggerUtil.logPageValidation(FrameworkConstants.HOME_PAGE, false);
            return false;
        }
    }
    
    /**
     * Get page title text
     * @return Page title text
     */
    public String getPageTitleText() {
        return pageTitle.getText();
    }
    
    /**
     * Get page description text
     * @return Page description text
     */
    public String getPageDescriptionText() {
        return pageDescription.getText();
    }
    
    /**
     * Click Get Started button
     */
    public void clickGetStarted() {
        getStartedButton.click();
    }
    
    /**
     * Navigate to login page
     */
    public void navigateToLogin() {
        loginLink.click();
    }
    
    /**
     * Navigate to products page
     */
    public void navigateToProducts() {
        productsLink.click();
    }
    
    /**
     * Navigate to contact page
     */
    public void navigateToContact() {
        contactLink.click();
    }
    
    /**
     * Get app logo text
     * @return App logo text
     */
    public String getAppLogoText() {
        return appLogo.getText();
    }
    
    /**
     * Check if user is logged in
     * @return true if user info is displayed
     */
    public boolean isUserLoggedIn() {
        try {
            return loggedUser.isDisplayed() && !loggedUser.getText().equals("Guest");
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Get logged in user name
     * @return Logged in user name or "Guest"
     */
    public String getLoggedInUserName() {
        try {
            return loggedUser.getText();
        } catch (Exception e) {
            return "Guest";
        }
    }
    
    /**
     * Click logout button
     */
    public void logout() {
        if (isUserLoggedIn()) {
            logoutButton.click();
            LoggerUtil.info("User logged out");
        } else {
            LoggerUtil.warn("No user is logged in to logout");
        }
    }
    
    /**
     * Verify all navigation links are present
     * @return true if all nav links are displayed
     */
    public boolean areNavigationLinksDisplayed() {
        return homeLink.isDisplayed() && 
               loginLink.isDisplayed() && 
               productsLink.isDisplayed() && 
               contactLink.isDisplayed();
    }
    
    /**
     * Get Get Started button text
     * @return Button text
     */
    public String getGetStartedButtonText() {
        return getStartedButton.getText();
    }
    
    /**
     * Verify home page content
     * @return true if all expected content is present
     */
    public boolean verifyHomePageContent() {
        boolean titleCorrect = "Welcome to TestApp".equals(getPageTitleText());
        boolean descriptionPresent = !getPageDescriptionText().isEmpty();
        boolean logoCorrect = "TestApp".equals(getAppLogoText());
        boolean navLinksPresent = areNavigationLinksDisplayed();
        boolean getStartedPresent = getStartedButton.isDisplayed();
        
        return titleCorrect && descriptionPresent && logoCorrect && navLinksPresent && getStartedPresent;
    }
}