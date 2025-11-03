package com.automation.base;

import com.automation.core.ConfigManager;
import com.automation.core.DriverFactory;
import com.automation.utils.LoggerUtil;
import com.automation.utils.WaitUtil;
import io.qameta.allure.Allure;
import org.openqa.selenium.WebDriver;
import org.testng.ITestResult;
import org.testng.annotations.AfterClass;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.BeforeMethod;

/**
 * BaseTest - moved to test sources. Handles driver lifecycle and common test setup/teardown
 */
@SuppressWarnings("java:S2187") // This is a base class for tests, not a test class itself
public class BaseTest {
    protected WebDriver driver;
    protected ConfigManager config;
    protected WaitUtil waitHelper;
    private long testStartTime;

    @BeforeMethod
    public void setUp() {
        testStartTime = System.currentTimeMillis();

        config = ConfigManager.getInstance();
        driver = DriverFactory.createDriver();
        waitHelper = new WaitUtil(driver, 10);

        String baseUrl = config.getBaseUrl();
        driver.get(baseUrl);
        LoggerUtil.info("Test setup completed. Navigated to: " + baseUrl);
    }

    @AfterMethod
    public void tearDown(ITestResult result) {
        long testDuration = System.currentTimeMillis() - testStartTime;
        String testName = result.getMethod().getMethodName();
        String status = result.isSuccess() ? "PASS" : "FAIL";

        if (!result.isSuccess()) {
            takeScreenshotOnFailure(testName);
        }

        LoggerUtil.logTestEnd(testName, status, testDuration);
        DriverFactory.quitDriver();
    }

    @BeforeClass
    public void classSetUp() {
        String className = this.getClass().getSimpleName();
        LoggerUtil.info("Starting test class: " + className);
    }

    @AfterClass
    public void classTearDown() {
        String className = this.getClass().getSimpleName();
        LoggerUtil.info("Completed test class: " + className);
    }

    private void takeScreenshotOnFailure(String testName) {
        try {
            if (DriverFactory.isDriverAvailable()) {
                org.openqa.selenium.TakesScreenshot takesScreenshot = (org.openqa.selenium.TakesScreenshot) driver;
                byte[] screenshot = takesScreenshot.getScreenshotAs(org.openqa.selenium.OutputType.BYTES);
                Allure.addAttachment(testName + "_failure_screenshot", "image/png",
                        new java.io.ByteArrayInputStream(screenshot), "png");
                LoggerUtil.info("Screenshot captured for failed test: " + testName);
            }
        } catch (Exception e) {
            LoggerUtil.error("Failed to capture screenshot: " + e.getMessage(), e);
        }
    }

    protected String getPageTitle() { return driver.getTitle(); }
    protected String getCurrentUrl() { return driver.getCurrentUrl(); }
    protected void navigateToUrl(String url) { driver.get(url); LoggerUtil.logPageNavigation("Unknown", url); }
    protected void refreshPage() { driver.navigate().refresh(); LoggerUtil.info("Page refreshed"); }
    protected void navigateBack() { driver.navigate().back(); LoggerUtil.info("Navigated back"); }
    protected void navigateForward() { driver.navigate().forward(); LoggerUtil.info("Navigated forward"); }

    protected void waitForPageLoad() {
        waitHelper.waitForCustomCondition(
                webDriver -> ((org.openqa.selenium.JavascriptExecutor) webDriver).executeScript("return document.readyState").equals("complete"),
                "page to load completely"
        );
    }

    protected Object executeJavaScript(String script) { return ((org.openqa.selenium.JavascriptExecutor) driver).executeScript(script); }
    protected Object executeJavaScript(String script, Object... args) { return ((org.openqa.selenium.JavascriptExecutor) driver).executeScript(script, args); }

    protected void setLoggedInUser(String username) {
        executeJavaScript("localStorage.setItem('loggedUser', arguments[0]);", username);
        LoggerUtil.info("Set logged in user: " + username);
    }

    protected void clearLoggedInUser() {
        executeJavaScript("localStorage.removeItem('loggedUser');");
        LoggerUtil.info("Cleared logged in user");
    }

    protected boolean isUserLoggedIn() {
        Object result = executeJavaScript("return localStorage.getItem('loggedUser');");
        return result != null && !result.toString().isEmpty();
    }

    protected String getLoggedInUser() {
        Object result = executeJavaScript("return localStorage.getItem('loggedUser');");
        return result != null ? result.toString() : null;
    }
}
