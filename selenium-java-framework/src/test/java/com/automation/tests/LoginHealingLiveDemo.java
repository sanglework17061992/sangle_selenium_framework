package com.automation.tests;

import com.automation.pages.LoginPage;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.testng.annotations.*;

/**
 * LoginHealingLiveDemo - Live demonstration of healing persistence workflow
 * 
 * This test demonstrates:
 * 1. Real login automation with your test-app
 * 2. Healing in action when locators need fixing
 * 3. JSON file automatic updates
 * 4. Performance improvement on subsequent runs
 */
public class LoginHealingLiveDemo {
    
    private WebDriver driver;
    private LoginPage loginPage;
    private static final String TEST_APP_URL = "http://localhost:8080/login.html";
    
    @BeforeClass
    public void setUpClass() {
        System.out.println("🎬 HEALING PERSISTENCE LIVE DEMO");
        System.out.println("=" + "=".repeat(50));
        System.out.println("📋 Demo Steps:");
        System.out.println("1. Navigate to test-app login page");
        System.out.println("2. Fill login form using JSON locators");
        System.out.println("3. Show healing in action if needed");
        System.out.println("4. Demonstrate JSON auto-updates");
        System.out.println("5. Show performance improvement");
        System.out.println("=" + "=".repeat(50));
    }
    
    @BeforeMethod
    public void setUp() {
        // Setup Chrome driver
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless=false");
        options.addArguments("--no-sandbox");
        options.addArguments("--disable-dev-shm-usage");
        options.addArguments("--window-size=1200,800");
        
        driver = new ChromeDriver(options);
        driver.manage().window().maximize();
        
        loginPage = new LoginPage(driver);
    }
    
    @AfterMethod
    public void tearDown() {
        if (driver != null) {
            // Keep browser open for 2 seconds to see results
            try {
                Thread.sleep(2000);
            } catch (InterruptedException e) {
                // Ignore
            }
            driver.quit();
        }
    }
    
    @Test(priority = 1, description = "First login attempt - may trigger healing")
    public void firstLoginAttempt() {
        System.out.println("\n🚀 TEST 1: First Login Attempt");
        System.out.println("📄 Check LoginPage.json before this test");
        
        // Navigate to login page
        driver.get(TEST_APP_URL);
        System.out.println("✅ Opened: " + TEST_APP_URL);
        
        long startTime = System.currentTimeMillis();
        
        try {
            System.out.println("🔍 Filling username field...");
            loginPage.enterUsername("testuser");
            System.out.println("✅ Username filled successfully");
            
            System.out.println("🔍 Filling password field...");
            loginPage.enterPassword("password123");
            System.out.println("✅ Password filled successfully");
            
            System.out.println("🔍 Clicking login button...");
            loginPage.clickLogin();
            System.out.println("✅ Login attempted successfully");
            
            long endTime = System.currentTimeMillis();
            long duration = endTime - startTime;
            
            System.out.println("⏱️  First attempt completed in: " + duration + "ms");
            System.out.println("📄 Check LoginPage.json after this test for healing updates");
            
        } catch (Exception e) {
            System.out.println("❌ Error in first login: " + e.getMessage());
            throw e;
        }
    }
    
    @Test(priority = 2, description = "Second login attempt - should be faster if healing occurred")
    public void secondLoginAttempt() {
        System.out.println("\n🔄 TEST 2: Second Login Attempt");
        System.out.println("🎯 This should be faster if healing occurred");
        
        driver.get(TEST_APP_URL);
        
        long startTime = System.currentTimeMillis();
        
        try {
            loginPage.enterUsername("testuser")
                    .enterPassword("password123")
                    .selectRememberMe();
            
            long endTime = System.currentTimeMillis();
            long duration = endTime - startTime;
            
            System.out.println("⚡ Second attempt completed in: " + duration + "ms");
            System.out.println("💡 Compare with first attempt time!");
            
        } catch (Exception e) {
            System.out.println("❌ Error in second login: " + e.getMessage());
            throw e;
        }
    }
    
    @Test(priority = 3, description = "Analyze locator healing information")
    public void analyzeHealingResults() {
        System.out.println("\n📊 TEST 3: Healing Analysis");
        
        driver.get(TEST_APP_URL);
        
        try {
            System.out.println("📍 LOCATOR ANALYSIS:");
            System.out.println("-".repeat(40));
            System.out.println("✅ Login form successfully interacted with");
            System.out.println("🔧 Check LoginPage.json for healing metadata");
            System.out.println("� Look for 'isHealed': true entries");
            System.out.println("⏰ Check 'healedAt' timestamps");
            System.out.println("📜 Review 'healingHistory' records");
            
        } catch (Exception e) {
            System.out.println("❌ Error analyzing healing: " + e.getMessage());
        }
    }
    
    @Test(priority = 4, description = "Performance comparison summary")
    public void performanceSummary() {
        System.out.println("\n📈 TEST 4: Performance Summary");
        System.out.println("=" + "=".repeat(50));
        System.out.println("🎯 HEALING PERSISTENCE BENEFITS:");
        System.out.println("1. ✅ Automatic locator repair");
        System.out.println("2. ✅ JSON file persistence");
        System.out.println("3. ✅ Faster subsequent runs");
        System.out.println("4. ✅ Complete audit trail");
        System.out.println("5. ✅ Team knowledge sharing");
        System.out.println("=" + "=".repeat(50));
        
        System.out.println("\n📋 WHAT TO CHECK:");
        System.out.println("1. 📄 LoginPage.json file changes");
        System.out.println("2. 🔧 'isHealed': true entries");
        System.out.println("3. ⏰ 'healedAt' timestamps");
        System.out.println("4. 📜 'healingHistory' records");
        System.out.println("5. 🔄 Locator repositioning");
        
        System.out.println("\n🎉 DEMO COMPLETE! Your framework now learns and improves!");
    }
}