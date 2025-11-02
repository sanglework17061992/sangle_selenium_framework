# Selenium Java Test Automation Framework

A comprehensive, enterprise-grade Selenium WebDriver framework built with Java, TestNG, and Allure reporting for robust web application testing.

## 🚀 Features

### Core Framework Capabilities
- **Multi-Browser Support**: Chrome, Firefox, Edge, Safari (with automatic driver management)
- **Parallel Test Execution**: Run tests concurrently across multiple browsers/devices
- **Custom Element Wrappers**: Built-in waits, retries, and enhanced error handling
- **Page Object Model**: Clean separation of test logic and page structure
- **Advanced Reporting**: Allure Framework integration with screenshots and detailed logs
- **Configuration Management**: Centralized property-based configuration
- **Comprehensive Logging**: Log4j2 integration with timestamped log files
- **Retry Mechanism**: Automatic retry for flaky tests
- **Authentication Helpers**: Built-in support for session management

### Technical Architecture
- **Design Patterns**: Factory, Singleton, Page Object Model
- **Element Abstraction**: Custom wrapper classes for reliable element interactions
- **Wait Strategies**: Intelligent explicit waits with customizable timeouts
- **Error Handling**: Comprehensive exception handling and recovery mechanisms
- **Thread Safety**: Full support for parallel test execution

## 📋 Prerequisites

- **Java 11+** (OpenJDK or Oracle JDK)
- **Maven 3.6+**
- **Chrome/Firefox/Edge browsers** installed
- **Internet connection** for WebDriverManager

## 🛠 Installation & Setup

### 1. Clone and Navigate
```bash
git clone <repository-url>
cd selenium-java-framework
```

### 2. Install Dependencies
```bash
mvn clean install
```

### 3. Configure Test Environment
Edit `src/test/resources/config.properties`:
```properties
# Browser Configuration
browser=chrome
headless=false
implicit_wait=10
explicit_wait=15
page_load_timeout=30

# Application Under Test
base_url=http://localhost:3000
login_url=http://localhost:3000/login.html
products_url=http://localhost:3000/products.html
contact_url=http://localhost:3000/contact.html

# Test Credentials
username=admin
password=admin123
```

### 4. Download Allure Commandline (for reporting)
```bash
curl -o allure-2.24.0.tgz -Ls https://repo1.maven.org/maven2/io/qameta/allure/allure-commandline/2.24.0/allure-commandline-2.24.0.tgz
tar -zxf allure-2.24.0.tgz
```

## 🧪 Running Tests

### Execute All Tests
```bash
mvn test
```

### Run Specific Test Class
```bash
mvn test -Dtest=LoginTest
mvn test -Dtest=ProductTest
mvn test -Dtest=ContactTest
```

### Run with Different Browser
```bash
mvn test -Dbrowser=firefox
mvn test -Dbrowser=edge
```

### Run in Headless Mode
```bash
mvn test -Dheadless=true
```

### Parallel Execution
```bash
mvn test -DsuiteXmlFile=src/test/resources/testng.xml
```

## 📊 Test Reporting

### Generate Allure Report
```bash
# After test execution
./allure-2.24.0/bin/allure serve target/allure-results
```

The report will open automatically in your browser showing:
- Test execution summary with pass/fail statistics
- Detailed test steps with screenshots
- Error logs and stack traces
- Test execution timeline
- Environment information

### View Surefire Reports
```bash
open target/surefire-reports/index.html
```

### Element Abstractions
- `BaseElement` - Foundation class with common functionality
- `Button` - Enhanced button interactions with retry logic
- `TextBox` - Text input with validation and special key support
- `Dropdown` - Full dropdown/select element support
- `Link` - Link navigation and validation
- `Checkbox` - Checkbox state management
- `RadioButton` - Radio button group handling
- `Label` - Label text and association validation

## 🏗 Framework Structure

```
src/
├── main/java/
│   ├── com/automation/
│   │   ├── config/
│   │   │   └── ConfigManager.java          # Configuration management
│   │   ├── driver/
│   │   │   └── DriverFactory.java          # WebDriver factory with browser setup
│   │   ├── elements/
│   │   │   ├── BaseElement.java            # Abstract element wrapper
│   │   │   ├── Button.java                 # Button interactions
│   │   │   ├── TextBox.java                # Input field operations
│   │   │   ├── Dropdown.java               # Select element handling
│   │   │   ├── Link.java                   # Link interactions
│   │   │   ├── Checkbox.java               # Checkbox operations
│   │   │   ├── Label.java                  # Text element reading
│   │   │   └── RadioButton.java            # Radio button selection
│   │   ├── pages/
│   │   │   ├── BasePage.java               # Common page functionality
│   │   │   ├── LoginPage.java              # Login page object
│   │   │   ├── HomePage.java               # Home page object
│   │   │   ├── ProductsPage.java           # Products page object
│   │   │   └── ContactPage.java            # Contact page object
│   │   └── utils/
│   │       ├── WaitHelper.java             # Custom wait strategies
│   │       ├── RetryHelper.java            # Retry mechanism
│   │       └── LoggerUtil.java             # Logging utilities
├── test/java/
│   ├── com/automation/
│   │   ├── base/
│   │   │   └── BaseTest.java               # Base test class with setup/teardown
│   │   └── tests/
│   │       ├── LoginTest.java              # Login functionality tests
│   │       ├── ProductTest.java            # Product page tests
│   │       └── ContactTest.java            # Contact form tests
└── test/resources/
    ├── config.properties                   # Test configuration
    ├── log4j2.xml                         # Logging configuration
    ├── allure.properties                  # Allure configuration
    └── testng.xml                         # TestNG suite configuration
```

## 🔧 Key Components

### Custom Element Wrappers
All interactions go through custom wrapper classes that provide:
- **Automatic Waits**: Elements are automatically waited for before interaction
- **Retry Logic**: Failed operations are retried with configurable attempts
- **Enhanced Logging**: All actions are logged with details
- **Error Recovery**: Graceful handling of stale elements and timeouts

Example usage:
```java
// Instead of direct WebElement usage
Button loginButton = new Button(driver.findElement(By.id("login")));
loginButton.click(); // Automatically waits, retries, and logs

TextBox usernameField = new TextBox(driver.findElement(By.name("username")));
usernameField.type("admin"); // Clears, types, and verifies input
```

### Page Object Model
Clean separation of page structure and test logic:
```java
public class LoginPage extends BasePage {
    private Button loginButton = new Button(By.id("login"));
    private TextBox usernameField = new TextBox(By.name("username"));
    
    public HomePage login(String username, String password) {
        usernameField.type(username);
        passwordField.type(password);
        loginButton.click();
        return new HomePage();
    }
}
```

### Configuration Management
Centralized configuration with environment-specific overrides:
```java
@Test
public void testLogin() {
    String username = ConfigManager.getProperty("username");
    String password = ConfigManager.getProperty("password");
    // Test implementation
}
```

## 🎯 Best Practices

### Test Design
- **Single Responsibility**: Each test method focuses on one specific functionality
- **Independent Tests**: Tests can run independently without dependencies
- **Data-Driven**: Use TestNG data providers for parameterized tests
- **Assertions**: Use descriptive assertion messages for better failure analysis

### Element Interactions
- **Use Custom Wrappers**: Always use framework element classes instead of raw WebElement
- **Explicit Waits**: Leverage built-in waiting mechanisms in element wrappers
- **Page Objects**: Encapsulate page-specific logic in page object classes
- **Locator Strategy**: Prefer ID > Name > CSS > XPath for element location

### Reporting & Debugging
- **Allure Annotations**: Use @Epic, @Feature, @Story for organized reporting
- **Screenshots**: Automatic screenshot capture on test failures
- **Detailed Logging**: Framework provides comprehensive operation logging
- **Environment Info**: Test execution environment details in reports

## 🔄 Authentication Support

The framework includes built-in authentication helpers for applications using localStorage:

```java
@BeforeMethod
public void setUp(Method method) {
    super.setUp();
    
    // For tests requiring authentication
    if (method.getName().contains("Products")) {
        setLoggedInUser("admin");
    }
}

@AfterMethod  
public void tearDown() {
    clearLoggedInUser();
    super.tearDown();
}
```

## 🌐 Browser Configuration

### Chrome Options (Default)
- Password manager disabled
- Notification blocking
- Popup prevention
- Anti-automation detection disabled

### Headless Mode Support
```bash
mvn test -Dheadless=true
```

### Cross-Browser Testing
The framework supports Chrome, Firefox, Edge, and Safari with consistent behavior across all browsers.

## � Troubleshooting

### Common Issues

1. **ChromeDriver Issues**
   - WebDriverManager automatically handles driver versions
   - Ensure Chrome browser is installed and up-to-date

2. **Test Failures Due to Timing**
   - Increase wait timeouts in config.properties
   - Use explicit waits for dynamic content

3. **Authentication Problems**
   - Verify localStorage authentication helpers are used
   - Check base_url configuration matches test application

4. **Report Generation**
   - Ensure Allure commandline is downloaded and extracted
   - Run tests before generating reports

### Debug Mode
Enable verbose logging by modifying log4j2.xml:
```xml
<Logger name="com.automation" level="DEBUG"/>
```

## 📈 Advanced Features

### Parallel Execution
Configure in testng.xml:
```xml
<suite name="ParallelTests" parallel="methods" thread-count="3">
```

### Retry Failed Tests
Automatic retry mechanism for flaky tests:
```java
@Test(retryAnalyzer = RetryHelper.class)
public void testMethod() {
    // Test implementation
}
```

### Environment-Specific Configuration
Override properties:
```bash
mvn test -Dbase_url=http://staging.example.com
```

## 🤝 Contributing

1. Follow existing code patterns and conventions
2. Add comprehensive logging to new components
3. Include unit tests for utility classes
4. Update documentation for new features
5. Ensure cross-browser compatibility

## 📄 License

This framework is open source and available under the MIT License.

---

**Framework Version**: 1.0.0  
**Last Updated**: November 2024  
**Maintainer**: Selenium Automation Team