package com.automation.tests.healing;

import org.testng.annotations.*;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.NoSuchElementException;
import com.automation.core.DriverFactory;
import com.automation.healing.HealingManager;
import com.automation.healing.HealingConfiguration;
import com.automation.utils.LoggerUtil;
import io.qameta.allure.*;

import java.util.Optional;

/**
 * RealHealingDemo - Test actual healing with broken locators  
 */
@Epic("Self-Healing System")
@Feature("Real Healing Demonstration")
public class RealHealingDemo {
    
    private WebDriver driver;
    private HealingManager healingManager;
    
    @BeforeMethod
    @Step("Initialize healing system for real broken locator demo")
    public void setUp() {
        driver = DriverFactory.createDriver("chrome", false);
        driver.get("http://localhost:8080");
        
        // Initialize healing system
        healingManager = HealingManager.getInstance();
        healingManager.initialize(driver);
        
        // Configure healing
        HealingConfiguration config = HealingConfiguration.getInstance();
        config.setHealingEnabled(true);
        config.setHealingMode("auto");
        config.setConfidenceThreshold(0.5); // Lower threshold for better healing
        config.setMaxCandidates(10);
        
        LoggerUtil.info("Real healing demo initialized");
    }
    
    @Test(priority = 1)
    @Story("Broken Username Field Healing")
    @Description("Test healing when username field ID is changed from 'username' to 'username-modified'")
    @Severity(SeverityLevel.CRITICAL)
    public void testBrokenUsernameFieldHealing() {
        LoggerUtil.info("=== TESTING REAL BROKEN USERNAME FIELD HEALING ===");
        
        // Navigate to login page
        driver.get("http://localhost:8080/login.html");
        
        // FIRST: Simulate what would have happened when the element was working
        Allure.step("Simulate baseline from working element", () -> {
            try {
                // Find the current working element 
                WebElement workingElement = driver.findElement(By.id("username-modified"));
                LoggerUtil.info("✅ Found current working element with id 'username-modified'");
                
                // Record it as if it was the original working locator
                healingManager.recordSuccessfulInteraction(By.id("username-modified"), "Username Field", "LoginPage");
                LoggerUtil.info("📊 Recorded successful interaction for username-modified");
                
                // Create a manual mapping to help healing
                healingManager.recordSuccessfulInteraction(By.name("username"), "Username Field", "LoginPage");
                LoggerUtil.info("📊 Recorded successful interaction for name attribute");
                
                workingElement.clear();
                workingElement.sendKeys("baseline-user");
                LoggerUtil.info("✅ Established element baseline");
            } catch (Exception e) {
                LoggerUtil.warn("Could not establish baseline: " + e.getMessage());
            }
        });
        
        Allure.step("Attempt to find original username field", () -> {
            try {
                WebElement originalElement = driver.findElement(By.id("username"));
                LoggerUtil.info("❌ Original username field found - this should NOT happen!");
                originalElement.sendKeys("test");
            } catch (NoSuchElementException e) {
                LoggerUtil.info("✅ Original username field NOT found (expected)");
                LoggerUtil.info("Error: " + e.getMessage());
            }
        });
        
        Allure.step("Try healing to find the modified username field", () -> {
            LoggerUtil.info("🔧 ATTEMPTING HEALING: Looking for username field with modified ID");
            
            // Try healing approach
            By originalLocator = By.id("username");
            Optional<WebElement> healedElement = healingManager.healAndRetry(originalLocator, "type");
            
            if (healedElement.isPresent()) {
                LoggerUtil.info("✅ HEALING SUCCESS: Found username field with modified ID!");
                healedElement.get().sendKeys("healed-user");
                
                Allure.addAttachment("Healing Success", "Successfully found username field despite ID change from 'username' to 'username-modified'");
            } else {
                LoggerUtil.info("❌ HEALING FAILED: Could not find username field");
                
                // Manual fallback to show what healing should do
                LoggerUtil.info("🔧 MANUAL FALLBACK: Trying to find by new ID");
                try {
                    WebElement manualElement = driver.findElement(By.id("username-modified"));
                    manualElement.clear();
                    manualElement.sendKeys("manual-fallback");
                    LoggerUtil.info("✅ MANUAL SUCCESS: Found field with ID 'username-modified'");
                    
                    Allure.addAttachment("Manual Fallback", "Found element manually with new ID 'username-modified' - this is what healing should do automatically");
                } catch (NoSuchElementException e) {
                    LoggerUtil.info("❌ MANUAL ALSO FAILED: " + e.getMessage());
                }
            }
        });
        
        // Add complete login flow
        Allure.step("Complete the login process", () -> {
            LoggerUtil.info("🔑 COMPLETING LOGIN FLOW");
            
            // Fill password field (test if this gets modified too)
            try {
                WebElement passwordField = driver.findElement(By.id("password"));
                passwordField.clear();
                passwordField.sendKeys("demo-password");
                LoggerUtil.info("✅ Password field filled successfully");
                healingManager.recordSuccessfulInteraction(By.id("password"), "Password Field", "LoginPage");
            } catch (Exception e) {
                LoggerUtil.warn("❌ Password field failed: " + e.getMessage());
                // Try healing for password field
                try {
                    WebElement altPasswordField = driver.findElement(By.name("password"));
                    altPasswordField.clear();
                    altPasswordField.sendKeys("demo-password");
                    LoggerUtil.info("✅ Password field found via name attribute");
                } catch (Exception ex) {
                    LoggerUtil.warn("❌ Password field completely failed");
                }
            }
            
            // Click login button (test if this gets modified too)
            try {
                WebElement loginButton = driver.findElement(By.id("login-btn"));
                loginButton.click();
                LoggerUtil.info("✅ Login button clicked successfully");
                healingManager.recordSuccessfulInteraction(By.id("login-btn"), "Login Button", "LoginPage");
                
                // Wait for result and check for success/error messages
                Thread.sleep(1000);
                
                try {
                    WebElement successMessage = driver.findElement(By.id("success-message"));
                    if (successMessage.isDisplayed()) {
                        LoggerUtil.info("🎉 LOGIN SUCCESS: " + successMessage.getText());
                        Allure.addAttachment("Login Result", "Login successful: " + successMessage.getText());
                    }
                } catch (Exception ignore) {
                    try {
                        WebElement errorMessage = driver.findElement(By.id("error-message"));
                        if (errorMessage.isDisplayed()) {
                            LoggerUtil.info("⚠️ LOGIN ERROR: " + errorMessage.getText());
                            Allure.addAttachment("Login Result", "Login failed: " + errorMessage.getText());
                        }
                    } catch (Exception ignore2) {
                        LoggerUtil.info("ℹ️ No success/error message found");
                    }
                }
                
            } catch (Exception e) {
                LoggerUtil.warn("❌ Login button failed: " + e.getMessage());
                // Try healing for login button
                try {
                    WebElement altLoginButton = driver.findElement(By.cssSelector("button[type='submit']"));
                    altLoginButton.click();
                    LoggerUtil.info("✅ Login button found via CSS selector");
                } catch (Exception ex) {
                    LoggerUtil.warn("❌ Login button completely failed");
                }
            }
        });
        
        LoggerUtil.info("✅ Broken username field healing test completed");
    }

    @Test(priority = 2)
    @Story("Complete Login Flow with Healing")
    @Description("Test complete login flow with potential healing for all form elements")
    @Severity(SeverityLevel.CRITICAL)
    public void testCompleteLoginFlowWithHealing() {
        LoggerUtil.info("=== TESTING COMPLETE LOGIN FLOW WITH HEALING ===");
        
        driver.get("http://localhost:8080/login.html");
        
        Allure.step("Fill username field with healing support", () -> {
            LoggerUtil.info("👤 STEP 1: Finding username field");
            
            boolean usernameSuccess = false;
            
            // Try original locator first
            try {
                WebElement usernameField = driver.findElement(By.id("username"));
                usernameField.clear();
                usernameField.sendKeys("testuser");
                LoggerUtil.info("✅ Username filled with original locator");
                usernameSuccess = true;
            } catch (Exception e) {
                LoggerUtil.info("❌ Original username locator failed: " + e.getMessage());
                
                // Try healing
                LoggerUtil.info("🔧 Attempting healing for username field");
                Optional<WebElement> healedUsername = healingManager.healAndRetry(By.id("username"), "type");
                
                if (healedUsername.isPresent()) {
                    healedUsername.get().sendKeys("testuser-healed");
                    LoggerUtil.info("✅ Username filled via healing");
                    usernameSuccess = true;
                } else {
                    // Manual fallback strategies
                    LoggerUtil.info("🔧 Trying manual fallback strategies for username");
                    
                    // Strategy 1: Try modified ID
                    try {
                        WebElement altUsername = driver.findElement(By.id("username-modified"));
                        altUsername.clear();
                        altUsername.sendKeys("testuser");
                        LoggerUtil.info("✅ Username filled with modified ID");
                        usernameSuccess = true;
                    } catch (Exception ex1) {
                        // Strategy 2: Try name attribute
                        try {
                            WebElement nameUsername = driver.findElement(By.name("username"));
                            nameUsername.clear();
                            nameUsername.sendKeys("testuser");
                            LoggerUtil.info("✅ Username filled with name attribute");
                            usernameSuccess = true;
                        } catch (Exception ex2) {
                            LoggerUtil.warn("❌ All username strategies failed");
                        }
                    }
                }
            }
            
            if (usernameSuccess) {
                Allure.addAttachment("Username Status", "Successfully filled username field");
            }
        });
        
        Allure.step("Fill password field with healing support", () -> {
            LoggerUtil.info("🔒 STEP 2: Finding password field");
            
            boolean passwordSuccess = false;
            
            // Try original locator first
            try {
                WebElement passwordField = driver.findElement(By.id("password"));
                passwordField.clear();
                passwordField.sendKeys("password123");
                LoggerUtil.info("✅ Password filled with original locator");
                passwordSuccess = true;
            } catch (Exception e) {
                LoggerUtil.info("❌ Original password locator failed: " + e.getMessage());
                
                // Try healing
                LoggerUtil.info("🔧 Attempting healing for password field");
                Optional<WebElement> healedPassword = healingManager.healAndRetry(By.id("password"), "type");
                
                if (healedPassword.isPresent()) {
                    healedPassword.get().sendKeys("password123");
                    LoggerUtil.info("✅ Password filled via healing");
                    passwordSuccess = true;
                } else {
                    // Manual fallback strategies
                    LoggerUtil.info("🔧 Trying manual fallback strategies for password");
                    
                    // Strategy 1: Try modified ID
                    try {
                        WebElement altPassword = driver.findElement(By.id("password-modified"));
                        altPassword.clear();
                        altPassword.sendKeys("password123");
                        LoggerUtil.info("✅ Password filled with modified ID");
                        passwordSuccess = true;
                    } catch (Exception ex1) {
                        // Strategy 2: Try name attribute
                        try {
                            WebElement namePassword = driver.findElement(By.name("password"));
                            namePassword.clear();
                            namePassword.sendKeys("password123");
                            LoggerUtil.info("✅ Password filled with name attribute");
                            passwordSuccess = true;
                        } catch (Exception ex2) {
                            // Strategy 3: Try type attribute
                            try {
                                WebElement typePassword = driver.findElement(By.cssSelector("input[type='password']"));
                                typePassword.clear();
                                typePassword.sendKeys("password123");
                                LoggerUtil.info("✅ Password filled with type selector");
                                passwordSuccess = true;
                            } catch (Exception ex3) {
                                LoggerUtil.warn("❌ All password strategies failed");
                            }
                        }
                    }
                }
            }
            
            if (passwordSuccess) {
                Allure.addAttachment("Password Status", "Successfully filled password field");
            }
        });
        
        Allure.step("Click login button with healing support", () -> {
            LoggerUtil.info("🔘 STEP 3: Finding login button");
            
            boolean loginButtonSuccess = false;
            
            // Try original locator first
            try {
                WebElement loginButton = driver.findElement(By.id("login-btn"));
                loginButton.click();
                LoggerUtil.info("✅ Login button clicked with original locator");
                loginButtonSuccess = true;
            } catch (Exception e) {
                LoggerUtil.info("❌ Original login button locator failed: " + e.getMessage());
                
                // Try healing
                LoggerUtil.info("🔧 Attempting healing for login button");
                Optional<WebElement> healedButton = healingManager.healAndRetry(By.id("login-btn"), "click");
                
                if (healedButton.isPresent()) {
                    healedButton.get().click();
                    LoggerUtil.info("✅ Login button clicked via healing");
                    loginButtonSuccess = true;
                } else {
                    // Manual fallback strategies
                    LoggerUtil.info("🔧 Trying manual fallback strategies for login button");
                    
                    // Strategy 1: Try modified ID
                    try {
                        WebElement altButton = driver.findElement(By.id("login-btn-modified"));
                        altButton.click();
                        LoggerUtil.info("✅ Login button clicked with modified ID");
                        loginButtonSuccess = true;
                    } catch (Exception ex1) {
                        // Strategy 2: Try submit type
                        try {
                            WebElement submitButton = driver.findElement(By.cssSelector("button[type='submit']"));
                            submitButton.click();
                            LoggerUtil.info("✅ Login button clicked with submit selector");
                            loginButtonSuccess = true;
                        } catch (Exception ex2) {
                            // Strategy 3: Try button text
                            try {
                                WebElement textButton = driver.findElement(By.xpath("//button[contains(text(), 'Login')]"));
                                textButton.click();
                                LoggerUtil.info("✅ Login button clicked with text xpath");
                                loginButtonSuccess = true;
                            } catch (Exception ex3) {
                                LoggerUtil.warn("❌ All login button strategies failed");
                            }
                        }
                    }
                }
            }
            
            if (loginButtonSuccess) {
                Allure.addAttachment("Login Button Status", "Successfully clicked login button");
            }
        });
        
        Allure.step("Check login result with comprehensive verification", () -> {
            LoggerUtil.info("📋 STEP 4: Comprehensive login result verification");
            
            try {
                Thread.sleep(1500); // Wait longer for response
                
                boolean loginSuccessDetected = false;
                boolean loginErrorDetected = false;
                
                // === PHASE 1: MESSAGE-BASED VERIFICATION ===
                LoggerUtil.info("🔍 Phase 1: Checking for success/error messages");
                
                // Check for success message with multiple strategies
                String[] successSelectors = {
                    "success-message",           // ID
                    "success-message-modified",  // Modified ID (for your test)
                    "login-success",            // Alternative ID
                    "welcome-message"           // Another alternative
                };
                
                for (String selector : successSelectors) {
                    try {
                        WebElement successMessage = driver.findElement(By.id(selector));
                        if (successMessage.isDisplayed() && !successMessage.getText().trim().isEmpty()) {
                            LoggerUtil.info("🎉 LOGIN SUCCESS (ID: " + selector + "): " + successMessage.getText());
                            Allure.addAttachment("Login Success Message", "Found via ID '" + selector + "': " + successMessage.getText());
                            loginSuccessDetected = true;
                            break;
                        }
                    } catch (Exception ignore) {
                        // Try class name approach
                        try {
                            WebElement successMessage = driver.findElement(By.className(selector));
                            if (successMessage.isDisplayed() && !successMessage.getText().trim().isEmpty()) {
                                LoggerUtil.info("🎉 LOGIN SUCCESS (Class: " + selector + "): " + successMessage.getText());
                                Allure.addAttachment("Login Success Message", "Found via class '" + selector + "': " + successMessage.getText());
                                loginSuccessDetected = true;
                                break;
                            }
                        } catch (Exception ignore2) {
                            // Continue to next selector
                        }
                    }
                }
                
                // Check for error messages with multiple strategies
                if (!loginSuccessDetected) {
                    String[] errorSelectors = {
                        "error-message",           // ID
                        "error-message-modified",  // Modified ID (for your test)
                        "login-error",            // Alternative ID
                        "validation-error"        // Another alternative
                    };
                    
                    for (String selector : errorSelectors) {
                        try {
                            WebElement errorMessage = driver.findElement(By.id(selector));
                            if (errorMessage.isDisplayed() && !errorMessage.getText().trim().isEmpty()) {
                                LoggerUtil.info("⚠️ LOGIN ERROR (ID: " + selector + "): " + errorMessage.getText());
                                Allure.addAttachment("Login Error Message", "Found via ID '" + selector + "': " + errorMessage.getText());
                                loginErrorDetected = true;
                                break;
                            }
                        } catch (Exception ignore) {
                            try {
                                WebElement errorMessage = driver.findElement(By.className(selector));
                                if (errorMessage.isDisplayed() && !errorMessage.getText().trim().isEmpty()) {
                                    LoggerUtil.info("⚠️ LOGIN ERROR (Class: " + selector + "): " + errorMessage.getText());
                                    Allure.addAttachment("Login Error Message", "Found via class '" + selector + "': " + errorMessage.getText());
                                    loginErrorDetected = true;
                                    break;
                                }
                            } catch (Exception ignore2) {
                                // Continue to next selector
                            }
                        }
                    }
                }
                
                // === PHASE 2: URL-BASED VERIFICATION ===
                LoggerUtil.info("🔍 Phase 2: Checking URL changes");
                String currentUrl = driver.getCurrentUrl();
                String pageTitle = driver.getTitle();
                
                if (!currentUrl.contains("login.html")) {
                    LoggerUtil.info("🎉 LOGIN SUCCESS: URL changed from login page");
                    LoggerUtil.info("📍 Current URL: " + currentUrl);
                    LoggerUtil.info("📄 Current Title: " + pageTitle);
                    Allure.addAttachment("Login Success - URL Change", "Redirected to: " + currentUrl + "\nTitle: " + pageTitle);
                    loginSuccessDetected = true;
                }
                
                // === PHASE 3: DOM STATE VERIFICATION ===
                LoggerUtil.info("🔍 Phase 3: Checking DOM state changes");
                
                // Check if login form is still present (might be hidden on success)
                try {
                    WebElement loginForm = driver.findElement(By.id("login-form"));
                    if (!loginForm.isDisplayed()) {
                        LoggerUtil.info("🎉 LOGIN SUCCESS: Login form hidden (likely successful)");
                        Allure.addAttachment("Login Success - Form Hidden", "Login form no longer displayed");
                        loginSuccessDetected = true;
                    }
                } catch (Exception ignore) {
                    LoggerUtil.info("ℹ️ Login form element not found - page might have changed");
                }
                
                // Check for user profile elements that appear after login
                String[] postLoginElements = {
                    "user-profile", "dashboard", "logout-btn", "welcome-user", "user-menu"
                };
                
                for (String elementId : postLoginElements) {
                    try {
                        WebElement element = driver.findElement(By.id(elementId));
                        if (element.isDisplayed()) {
                            LoggerUtil.info("🎉 LOGIN SUCCESS: Found post-login element '" + elementId + "'");
                            Allure.addAttachment("Login Success - Post-login Element", "Found element: " + elementId);
                            loginSuccessDetected = true;
                            break;
                        }
                    } catch (Exception ignore) {
                        // Continue checking other elements
                    }
                }
                
                // === PHASE 4: FORM FIELD STATE VERIFICATION ===
                LoggerUtil.info("🔍 Phase 4: Checking form field states");
                
                // Check if form fields were cleared (some systems clear on success)
                try {
                    WebElement usernameField = driver.findElement(By.name("username"));
                    WebElement passwordField = driver.findElement(By.name("password"));
                    
                    String usernameValue = usernameField.getAttribute("value");
                    String passwordValue = passwordField.getAttribute("value");
                    
                    if ((usernameValue == null || usernameValue.trim().isEmpty()) && 
                        (passwordValue == null || passwordValue.trim().isEmpty())) {
                        LoggerUtil.info("🎉 LOGIN SUCCESS: Form fields cleared (likely successful)");
                        Allure.addAttachment("Login Success - Fields Cleared", "Username and password fields cleared");
                        loginSuccessDetected = true;
                    }
                } catch (Exception ignore) {
                    LoggerUtil.info("ℹ️ Could not check form field states");
                }
                
                // === PHASE 5: BROWSER CONSOLE LOG VERIFICATION ===
                LoggerUtil.info("🔍 Phase 5: Checking for JavaScript console messages");
                try {
                    // Execute JavaScript to check for custom login success indicators
                    Object loginStatus = ((org.openqa.selenium.JavascriptExecutor) driver)
                        .executeScript("return window.loginStatus || document.body.getAttribute('data-login-status') || 'unknown';");
                    
                    if (loginStatus != null && !loginStatus.toString().equals("unknown")) {
                        LoggerUtil.info("🎯 LOGIN STATUS from JavaScript: " + loginStatus);
                        if (loginStatus.toString().toLowerCase().contains("success")) {
                            LoggerUtil.info("🎉 LOGIN SUCCESS: JavaScript confirms success");
                            Allure.addAttachment("Login Success - JavaScript", "Status: " + loginStatus);
                            loginSuccessDetected = true;
                        } else if (loginStatus.toString().toLowerCase().contains("error") || 
                                   loginStatus.toString().toLowerCase().contains("fail")) {
                            LoggerUtil.info("⚠️ LOGIN ERROR: JavaScript confirms error");
                            Allure.addAttachment("Login Error - JavaScript", "Status: " + loginStatus);
                            loginErrorDetected = true;
                        }
                    }
                } catch (Exception e) {
                    LoggerUtil.info("ℹ️ Could not check JavaScript login status: " + e.getMessage());
                }
                
                // === FINAL RESULT SUMMARY ===
                LoggerUtil.info("📊 === LOGIN VERIFICATION SUMMARY ===");
                if (loginSuccessDetected) {
                    LoggerUtil.info("✅ FINAL RESULT: LOGIN SUCCESS DETECTED");
                    Allure.addAttachment("Final Login Result", "SUCCESS - Login verified through multiple methods");
                } else if (loginErrorDetected) {
                    LoggerUtil.info("❌ FINAL RESULT: LOGIN ERROR DETECTED");
                    Allure.addAttachment("Final Login Result", "ERROR - Login failed with error messages");
                } else {
                    LoggerUtil.info("❓ FINAL RESULT: LOGIN STATUS UNCLEAR");
                    LoggerUtil.info("📍 Current URL: " + currentUrl);
                    LoggerUtil.info("📄 Current Title: " + pageTitle);
                    Allure.addAttachment("Final Login Result", "UNCLEAR - No definitive success/error indicators found\nURL: " + currentUrl + "\nTitle: " + pageTitle);
                }
                
            } catch (Exception e) {
                LoggerUtil.warn("❌ Error during comprehensive login verification: " + e.getMessage());
                Allure.addAttachment("Login Verification Error", e.getMessage());
            }
        });
        
        LoggerUtil.info("✅ Complete login flow test completed");
    }
    
    @Test(priority = 2)
    @Story("Alternative Locator Strategy Test")
    @Description("Test multiple locator strategies to find the modified username field")
    public void testAlternativeLocatorStrategies() {
        LoggerUtil.info("=== TESTING ALTERNATIVE LOCATOR STRATEGIES ===");
        
        driver.get("http://localhost:8080/login.html");
        
        // Test different locator strategies
        String[] strategies = {
            "By.id('username')",
            "By.id('username-modified')",
            "By.name('username')",
            "By.xpath(\"//input[@name='username']\")",
            "By.xpath(\"//input[contains(@id, 'username')]\")",
            "By.cssSelector(\"input[name='username']\")",
            "By.cssSelector(\"input[type='text']\")"
        };
        
        By[] locators = {
            By.id("username"),
            By.id("username-modified"),
            By.name("username"),
            By.xpath("//input[@name='username']"),
            By.xpath("//input[contains(@id, 'username')]"),
            By.cssSelector("input[name='username']"),
            By.cssSelector("input[type='text']")
        };
        
        Allure.step("Test multiple locator strategies", () -> {
            for (int i = 0; i < strategies.length; i++) {
                try {
                    WebElement element = driver.findElement(locators[i]);
                    LoggerUtil.info("✅ SUCCESS: " + strategies[i] + " - Found element");
                    element.clear();
                    element.sendKeys("strategy-" + i);
                    
                    // This shows what strategies work for healing
                    if (i > 0) { // Skip the broken original locator
                        LoggerUtil.info("🎯 HEALING CANDIDATE: " + strategies[i] + " could be used for healing");
                    }
                } catch (NoSuchElementException e) {
                    LoggerUtil.info("❌ FAILED: " + strategies[i] + " - " + e.getMessage());
                }
            }
        });
        
        LoggerUtil.info("✅ Alternative locator strategies test completed");
    }
    
    @Test(priority = 3)
    @Story("DOM Analysis for Healing")
    @Description("Analyze DOM to understand why healing might not work")
    public void testDomAnalysisForHealing() {
        LoggerUtil.info("=== TESTING DOM ANALYSIS FOR HEALING ===");
        
        driver.get("http://localhost:8080/login.html");
        
        Allure.step("Analyze DOM structure for healing candidates", () -> {
            // Check if healing manager can capture DOM
            try {
                LoggerUtil.info("🔍 TESTING DOM CAPTURE");
                
                // First record a successful interaction to give healing context
                WebElement workingElement = driver.findElement(By.id("username-modified"));
                workingElement.sendKeys("context-test");
                
                // Record this interaction for healing
                healingManager.recordSuccessfulInteraction(By.id("username-modified"), "Username Field", "LoginPage");
                LoggerUtil.info("✅ Recorded successful interaction with modified username field");
                
                // Now try the broken locator to trigger healing
                By brokenLocator = By.id("username");
                Optional<WebElement> healedElement = healingManager.healAndRetry(brokenLocator, "DOM Analysis");
                
                if (healedElement.isPresent()) {
                    LoggerUtil.info("✅ DOM ANALYSIS SUCCESS: Healing worked!");
                } else {
                    LoggerUtil.info("❌ DOM ANALYSIS: Healing failed - need to improve algorithm");
                }
                
            } catch (Exception e) {
                LoggerUtil.info("❌ DOM ANALYSIS ERROR: " + e.getMessage());
            }
        });
        
        LoggerUtil.info("✅ DOM analysis test completed");
    }
    
    @AfterMethod
    public void tearDown() {
        if (driver != null) {
            driver.quit();
            LoggerUtil.info("Browser closed after real healing demo");
        }
    }
}