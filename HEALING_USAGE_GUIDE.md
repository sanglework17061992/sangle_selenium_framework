# Self-Healing Locator System - Implementation Guide

## 📋 **Step-by-Step Usage Instructions**

### **Step 1: Enable Healing in Your Test Configuration**

1. **Add TestNG Listener to your test suite**:
   ```xml
   <!-- In your testng.xml -->
   <suite name="SeleniumTests">
       <listeners>
           <listener class-name="com.automation.healing.listeners.HealingTestListener"/>
       </listeners>
       <!-- Your test classes -->
   </suite>
   ```

2. **Or add programmatically in BaseTest**:
   ```java
   @Listeners({HealingTestListener.class})
   public class BaseTest {
       // Your test setup
   }
   ```

### **Step 2: Configure Healing Settings**

Create `src/main/resources/healing.properties`:
```properties
# Enable healing functionality
healing.enabled=true

# Healing mode: auto (apply healing) or suggest-only (report only)
healing.mode=auto

# Confidence threshold for auto-healing (0.0 to 1.0)
healing.confidenceThreshold=0.75

# Maximum candidates to analyze
healing.maxCandidates=5

# Enable notifications for healing events
healing.notifications.enabled=true
healing.notifyOnHeal=true
```

### **Step 3: Update Your Page Objects**

**Option A: Extend HealingBaseElement (Recommended)**
```java
// Instead of extending BaseElement, extend HealingBaseElement
public class LoginPage extends HealingPageBase {
    
    public LoginPage(WebDriver driver) {
        super(driver, "LoginPage");
    }
    
    // Your existing elements will automatically get healing
    private final Button loginButton = new HealingButton(driver, 
        By.id("loginBtn"), "Login Button", "LoginPage");
}
```

**Option B: Manual Healing Integration**
```java
// Add healing to existing elements
public class LoginPage extends BasePage {
    private HealingManager healingManager = SmartHealingManager.getInstance();
    
    public void clickLogin() {
        try {
            loginButton.click();
        } catch (NoSuchElementException e) {
            // Trigger healing
            Optional<WebElement> healed = healingManager.healAndRetry(
                By.id("loginBtn"), "click");
            if (healed.isPresent()) {
                healed.get().click();
            } else {
                throw e; // Re-throw if healing failed
            }
        }
    }
}
```

### **Step 4: Initialize Healing Manager**

In your BaseTest or test setup:
```java
@BeforeMethod
public void setUp() {
    // Initialize WebDriver
    driver = new ChromeDriver();
    
    // Initialize healing manager
    SmartHealingManager.getInstance().initialize(driver);
    
    // Configure healing settings
    HealingConfiguration config = HealingConfiguration.getInstance();
    config.setHealingEnabled(true);
    config.setHealingMode("auto");
    config.setConfidenceThreshold(0.75);
}

@AfterMethod  
public void tearDown() {
    SmartHealingManager.getInstance().shutdown();
    if (driver != null) {
        driver.quit();
    }
}
```

### **Step 5: Test Healing with Modified Locators**

**Scenario 1: Change ID attribute**
```java
// Original working locator: By.id("loginBtn")
// Modify test-app to use: By.id("login-button") 
// Healing will find the button by text, class, or position
```

**Scenario 2: Change class names**
```java
// Original: By.className("btn-primary")
// Modified: By.className("btn-login-primary")
// Healing will match by partial class similarity
```

**Scenario 3: Change element hierarchy**
```java
// Original: //div[@class='form']/button
// Modified: //div[@class='login-form']/div/button
// Healing will find by structural similarity
```

### **Step 6: Monitor Healing in Allure Reports**

After test execution, check Allure reports for:
- 🔧 **Healing Applied** - Automatic healing succeeded
- 💡 **Healing Suggestion** - Manual review needed  
- ❌ **Healing Failed** - No viable candidates found

### **Step 7: Review and Accept Healing Suggestions**

1. Check `healing/healing_suggestions.json` for suggestions
2. Review high-confidence suggestions (>80%)
3. Update Page Objects with approved locators
4. Mark suggestions as reviewed in the repository

## 🧪 **Testing Strategy for AUT**

### **Test Scenarios to Implement**

1. **ID Changes**: Modify button/input IDs
2. **Class Changes**: Update CSS classes  
3. **Text Changes**: Modify button/link text
4. **Structure Changes**: Add/remove wrapper divs
5. **Attribute Changes**: Update data-* attributes

### **Expected Healing Behavior**

- **High Confidence (>80%)**: Auto-heal and continue test
- **Medium Confidence (60-80%)**: Generate suggestion, manual review
- **Low Confidence (<60%)**: Report failure, suggest alternatives

## 📊 **Monitoring and Maintenance**

### **Healing Statistics**
```java
// Get healing statistics
Map<String, Object> stats = SmartHealingManager.getInstance().getHealingStatistics();
System.out.println("Success Rate: " + stats.get("successRate"));
System.out.println("Total Healings: " + stats.get("successfulHealings"));
```

### **Backup and Recovery**
```java
// Backup locator repository
LocatorRepository repo = new JsonLocatorRepository();
repo.backup("healing/backups/backup-" + LocalDate.now());
```

## 🚨 **Troubleshooting**

### **Common Issues**

1. **Healing not triggering**: Check if healing is enabled and manager is initialized
2. **Low confidence scores**: Review attribute weights in SmartAnalyzer
3. **Performance issues**: Reduce maxCandidates or increase timeout
4. **CDP issues**: Ensure Chrome supports DevTools Protocol

### **Debug Mode**
```properties
# Enable debug logging
healing.debug=true
logging.level.com.automation.healing=DEBUG
```

## 🎯 **Best Practices**

1. **Start with suggest-only mode** to understand healing behavior
2. **Use descriptive element names** for better healing context
3. **Regular backup** of locator repository
4. **Review suggestions weekly** for permanent fixes
5. **Monitor success rates** and adjust thresholds accordingly

---

**Next**: I'll create example implementations for your specific test-app pages!