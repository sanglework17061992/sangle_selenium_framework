# 🧪 Self-Healing Locator Testing Guide

## Overview
This guide demonstrates how to test the self-healing locator system with your AUT (Application Under Test). The healing system automatically detects broken locators and attempts to find alternative ways to locate elements.

## Quick Start Testing

### 1. Enable Healing for Your Tests

Add this to your test setup:

```java
@BeforeClass
public void setupHealing() {
    // Initialize healing manager
    SmartHealingManager healingManager = SmartHealingManager.getInstance();
    healingManager.initialize(driver);
    
    // Configure healing settings
    HealingConfiguration config = HealingConfiguration.getInstance();
    config.setHealingEnabled(true);
    config.setHealingMode("auto");          // auto | suggest-only
    config.setConfidenceThreshold(0.75);    // 75% confidence required
}
```

### 2. Use Healing-Enabled Page Objects

Replace your regular page object with healing-enabled version:

```java
// Before: Regular page object
LoginPage loginPage = new LoginPage(driver);

// After: Healing-enabled page object  
HealingLoginPage healingLoginPage = new HealingLoginPage(driver);
```

### 3. Run the Demo Test

Execute the healing demo test to see the system in action:

```bash
mvn test -Dtest=HealingDemoTest
```

## Testing Scenarios

### Scenario 1: ID Attribute Changes

**What it tests:** Element ID changes (most common scenario)

**How to trigger:**
1. Run your normal test to establish baseline
2. Use browser dev tools to change element ID:
   ```javascript
   document.getElementById('username').id = 'username-new';
   ```
3. Re-run the same test
4. **Expected Result:** Test continues to work, healing is logged

**Manual trigger in your AUT:**
```java
// Modify element ID during test
JavascriptExecutor js = (JavascriptExecutor) driver;
js.executeScript("document.getElementById('login-btn').id = 'submit-button';");

// This interaction should trigger healing
healingLoginPage.clickLogin(); // Will heal and find the button
```

### Scenario 2: Class Attribute Changes

**What it tests:** CSS class modifications

**How to trigger:**
```java
// Change button class during test
js.executeScript("document.getElementById('login-btn').className = 'new-button-class';");

// Test should heal and continue working
healingLoginPage.clickLogin();
```

### Scenario 3: Element Structure Changes

**What it tests:** DOM restructuring scenarios

**How to trigger:**
```java
// Wrap element in additional div
js.executeScript(
    "var btn = document.getElementById('login-btn');" +
    "var wrapper = document.createElement('div');" +
    "btn.parentNode.insertBefore(wrapper, btn);" +
    "wrapper.appendChild(btn);"
);

// Should still find the button
healingLoginPage.clickLogin();
```

### Scenario 4: Multiple Element Changes

**What it tests:** Complex healing scenarios

**How to trigger:**
```java
// Modify multiple elements at once
js.executeScript(
    "document.getElementById('username').id = 'user-field';" +
    "document.getElementById('password').id = 'pass-field';" +
    "document.getElementById('login-btn').id = 'submit-btn';"
);

// Complete login flow should heal all elements
healingLoginPage.enterUsername("test");
healingLoginPage.enterPassword("pass");
healingLoginPage.clickLogin();
```

## Creating Your Own Healing Tests

### Step 1: Create Healing Page Object

```java
package com.automation.pages.healing;

import com.automation.healing.elements.*;
import com.automation.pages.BasePage;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class HealingYourPage extends BasePage {
    
    private final HealingTextBox inputField;
    private final HealingButton submitButton;
    private final HealingLabel resultMessage;
    
    public HealingYourPage(WebDriver driver) {
        super(driver);
        
        // Initialize healing elements with page name
        this.inputField = new HealingTextBox(driver, 
            By.id("input-field"), "Input Field", "YourPage");
        
        this.submitButton = new HealingButton(driver, 
            By.id("submit-btn"), "Submit Button", "YourPage");
        
        this.resultMessage = new HealingLabel(driver, 
            By.id("result-msg"), "Result Message", "YourPage");
    }
    
    // Your page methods using healing elements
    public void enterData(String data) {
        inputField.clearAndType(data);
    }
    
    public void clickSubmit() {
        submitButton.click();
    }
    
    public String getResult() {
        return resultMessage.getText();
    }
}
```

### Step 2: Create Test with Healing Scenarios

```java
@Test
public void testYourPageWithHealing() {
    HealingYourPage page = new HealingYourPage(driver);
    
    // Normal flow first (establishes baseline)
    page.enterData("test data");
    page.clickSubmit();
    
    // Modify elements to trigger healing
    JavascriptExecutor js = (JavascriptExecutor) driver;
    js.executeScript("document.getElementById('input-field').id = 'data-input';");
    
    // This should heal and continue working
    page.enterData("healed data");
    Assert.assertEquals(page.getResult(), "Expected result");
}
```

## Monitoring and Debugging

### View Healing Statistics

```java
SmartHealingManager manager = SmartHealingManager.getInstance();
Map<String, Object> stats = manager.getHealingStatistics();

stats.forEach((key, value) -> {
    System.out.println(key + ": " + value);
});
```

### Check Allure Reports

The healing system integrates with Allure reporting:

1. Run tests with Allure: `mvn clean test allure:report`
2. Open report: `allure serve target/allure-results`
3. Look for healing indicators:
   - 🔧 **Auto-healed** - Successfully healed automatically
   - 💡 **Suggestions** - Healing suggestions provided
   - ❌ **Failed healing** - Healing attempts failed

### Enable Debug Logging

Add to your `log4j2.xml`:

```xml
<Logger name="com.automation.healing" level="DEBUG" additivity="false">
    <AppenderRef ref="Console"/>
</Logger>
```

## Common Test Patterns

### Pattern 1: Gradual Degradation Testing

```java
@Test
public void testGradualDegradation() {
    // Start with working elements
    page.performAction();
    
    // Gradually break elements
    modifyElementId("element1", "element1-v2");
    page.performAction(); // Should heal
    
    modifyElementClass("element2", "new-class");
    page.performAction(); // Should heal again
    
    removeElementCompletely("element3");
    // Should fail gracefully with clear error
}
```

### Pattern 2: Recovery Testing

```java
@Test
public void testRecoveryAfterHealing() {
    // Break element
    modifyElement();
    
    // Trigger healing
    page.performAction();
    
    // Verify healing worked
    Assert.assertTrue("Action should succeed after healing", 
        page.wasActionSuccessful());
    
    // Verify subsequent actions still work
    page.performAnotherAction();
}
```

### Pattern 3: Stress Testing

```java
@Test
public void testHealingStress() {
    for (int i = 0; i < 10; i++) {
        // Break different elements each iteration
        breakRandomElement(i);
        
        // Verify healing handles it
        page.performCompleteWorkflow();
        
        // Reset for next iteration
        resetElements();
    }
}
```

## Configuration for Different Environments

### Development Environment
```properties
healing.enabled=true
healing.mode=auto
healing.confidence.threshold=0.6
healing.notifications.enabled=true
```

### Staging Environment
```properties
healing.enabled=true
healing.mode=suggest-only
healing.confidence.threshold=0.8
healing.notifications.enabled=true
```

### Production Environment
```properties
healing.enabled=false
# Healing disabled in production
```

## Best Practices

### 1. **Gradual Adoption**
- Start with one page object
- Test thoroughly before expanding
- Monitor healing statistics

### 2. **Baseline Testing**
- Always run normal tests first
- Establish successful interaction patterns
- Then test with modifications

### 3. **Selective Healing**
- Not all elements need healing
- Focus on critical path elements
- Use regular elements for stable parts

### 4. **Monitoring**
- Check healing statistics regularly
- Review Allure reports for patterns
- Investigate frequent healings

### 5. **Element Identification**
- Use descriptive element names
- Group related elements by page
- Maintain consistent naming

## Troubleshooting

### Healing Not Working?

1. **Check configuration:**
   ```java
   HealingConfiguration config = HealingConfiguration.getInstance();
   System.out.println("Healing enabled: " + config.isHealingEnabled());
   ```

2. **Verify initialization:**
   ```java
   SmartHealingManager manager = SmartHealingManager.getInstance();
   System.out.println("Manager initialized: " + manager.isHealingEnabled());
   ```

3. **Check element setup:**
   ```java
   // Ensure elements use healing types
   HealingTextBox field = new HealingTextBox(driver, locator, name, pageName);
   ```

### Common Issues

- **Healing too aggressive:** Increase confidence threshold
- **Healing not triggered:** Decrease confidence threshold
- **False positives:** Review element similarity criteria
- **Performance impact:** Use selective healing

### Getting Help

1. Check logs for healing attempts
2. Review Allure reports for patterns
3. Examine healing statistics
4. Enable debug logging for detailed info

## Advanced Testing

### Custom Healing Scenarios

You can create specific test scenarios by modifying elements in ways that commonly occur in real applications:

```java
// Simulate framework changes
modifyFrameworkClasses();

// Simulate A/B testing changes  
swapElementPositions();

// Simulate dynamic content changes
addRandomAttributes();
```

This comprehensive testing approach ensures your healing system works reliably across different scenarios and provides confidence in its effectiveness.