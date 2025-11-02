# Self-Healing Locator System

## 🔧 What It Does

The Self-Healing System automatically fixes broken element locators during test execution. When a locator fails (like `By.id("username")`), the system finds alternative ways to locate the same element without stopping the test.

## 📋 Table of Contents

- [How It Works](#how-it-works)
- [Quick Setup](#quick-setup)
- [Viewing Results](#viewing-results)
- [Configuration](#configuration)
- [Examples](#examples)

## 🚀 How It Works

### Step 1: Normal Test Execution
```java
// Your test runs normally
HealingTextBox usernameField = new HealingTextBox(By.id("username"));
usernameField.type("testuser"); // Original locator: By.id("username")
```

### Step 2: Locator Breaks
```
❌ Element not found: By.id("username")
🔧 Self-healing system activates automatically
```

### Step 3: Smart Analysis
```
🔍 System scans the page for similar elements
🧠 Finds: "username-modified", "user-field", "login-username"
📊 Scores each candidate: 1.0, 0.6, 0.4
```

### Step 4: Auto-Healing
```java
✅ Best match found: By.id("username-modified") (Score: 1.0)
✅ Action completed: element.sendKeys("testuser")
💾 Healing saved for future use
```

### Step 5: Test Continues
```
🎉 Test continues seamlessly
📝 Healing event logged and stored
```

## ⚙️ Quick Setup

### 1. Enable Healing
```properties
# config.properties
healing.enabled=true
healing.mode=auto
healing.confidence.threshold=0.5
```

### 2. Use Healing Elements
```java
// Replace regular elements with healing versions
HealingTextBox usernameField = new HealingTextBox(By.id("username"));
HealingButton loginButton = new HealingButton(By.id("login-btn"));

// Use normally - healing happens automatically
usernameField.type("testuser");
loginButton.click();
```

### 3. Run Your Tests
```bash
mvn test -Dtest=RealHealingDemo
```

## 📊 Viewing Results

### 1. Console Output
```
🔧 HEALING ACTIVATED for locator: By.id: username
🎯 Found candidate: username-modified (confidence: 1.0)
✅ HEALING SUCCESS: Element found and action completed
📊 Analysis completed in 1,247ms

🔧 HEALING SUMMARY:
   Total Locators: 4
   Successful Healings: 3
   Success Rate: 75%
   Average Confidence: 0.82
```

### 2. Repository Files

**View discovered candidates:**
```bash
cat healing/locator_repository.json
```
```json
{
  "id": "Username Field (Healed)",
  "originalLocator": {"type": "id", "value": "By.id: username"},
  "healedLocator": {"type": "id", "value": "By.id: username-modified"},
  "confidence": 1.0,
  "lastSeen": "2025-11-02T18:56:28"
}
```

**View healing events:**
```bash
cat healing/healing_suggestions.json
```
```json
{
  "originalLocator": "By.id: username",
  "healedLocator": "By.id: username-modified", 
  "confidence": 1.0,
  "success": true,
  "timestamp": "2025-11-02T18:56:28"
}
```

### 3. Test Logs
```bash
tail -f logs/automation.log | grep "HEALING"
```
```
INFO  [HealingManager] 🔧 HEALING ACTIVATED for locator: By.id: username
DEBUG [SmartAnalyzer] 🎯 ID pattern match: username -> username-modified (similarity: 0.8)
INFO  [HealingManager] ✅ HEALING SUCCESS: Found element with healed locator
INFO  [HealingManager] 💾 Healing candidate saved to repository
```

## ⚙️ Configuration

### Basic Settings
```properties
# Enable/disable healing
healing.enabled=true

# Healing modes
healing.mode=auto          # auto, manual, disabled

# Confidence threshold (0.0-1.0)
healing.confidence.threshold=0.5

# Maximum candidates to analyze
healing.max.candidates=10
```

### Environment-Specific
```properties
# Development (learning mode)
healing.mode=manual
healing.confidence.threshold=0.4

# Production (conservative)
healing.mode=auto
healing.confidence.threshold=0.8
```

## 💡 Examples

### Example 1: Login Form Healing
```java
@Test
public void testLoginWithHealing() {
    // Original locators
    HealingTextBox username = new HealingTextBox(By.id("username"));
    HealingTextBox password = new HealingTextBox(By.id("password"));
    HealingButton login = new HealingButton(By.id("login-btn"));
    
    // If page changes from "username" to "username-modified", 
    // healing automatically detects and uses the new locator
    username.type("testuser");     // Auto-heals if needed
    password.type("password123");  // Auto-heals if needed
    login.click();                // Auto-heals if needed
}
```

**Healing Result:**
```
🔧 HEALING ACTIVATED for locator: By.id: username
🎯 Found candidate: username-modified (confidence: 1.0)
✅ HEALING SUCCESS: Element typed 'testuser'

🔧 HEALING ACTIVATED for locator: By.id: login-btn  
🎯 Found candidate: login-btn-modified (confidence: 0.6)
✅ HEALING SUCCESS: Button clicked successfully
```

### Example 2: Manual Review Mode
```java
@Test
public void testWithManualReview() {
    // Set manual mode
    healingConfig.setMode(HealingMode.MANUAL);
    
    try {
        usernameField.type("testuser");
    } catch (NoSuchElementException e) {
        // Review suggestions manually
        List<CandidateLocator> suggestions = healingManager.getHealingSuggestions(
            By.id("username"));
        
        suggestions.forEach(candidate -> 
            System.out.println("Suggestion: " + candidate.getLocatorInfo().getValue() + 
                             " (Score: " + candidate.getScore() + ")")
        );
    }
}
```

### Example 3: Viewing Real-Time Healing
```java
@Test  
public void demonstrateHealing() {
    // Run the demo test to see healing in action
    mvn test -Dtest=RealHealingDemo#testCompleteLoginFlowWithHealing
}
```

**Expected Output:**
```
🔧 HEALING ACTIVATED for locator: By.id: username
🔍 DOM snapshot captured: 16 elements found
🎯 Analyzing candidates...
   ✅ username-modified (Score: 1.0) - ID pattern match
   ✅ password_modified (Score: 0.6) - Partial match
   ✅ login-btn-modified (Score: 0.6) - Button pattern
📊 Best candidate selected: username-modified
✅ HEALING SUCCESS: Action completed successfully
💾 Candidate saved to repository

🔧 HEALING SUMMARY:
   Total Locators: 4
   Successful Healings: 3 (75%)
   Failed Healings: 1 (25%)
   Average Confidence: 0.82
   Analysis Time: 1,247ms
```

## 🔍 Quick Troubleshooting

### Low Success Rate
```properties
# Lower confidence threshold for more candidates
healing.confidence.threshold=0.4
healing.max.candidates=15
```

### Slow Performance  
```properties
# Optimize for speed
healing.max.candidates=3
healing.timeout=3000
```

### Check Repository Health
```bash
# View repository status
cat healing/locator_repository.json | jq '.metadata'

# Check recent healing events  
cat healing/healing_suggestions.json | jq '.statistics'
```

---

**Quick Start:** Enable healing → Use healing elements → Run tests → Check results in console and repository files

**Version:** 2.0.0 | **Updated:** November 2025