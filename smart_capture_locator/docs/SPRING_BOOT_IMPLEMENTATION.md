# 🛠️ Spring Boot Smart Locator Inspector - Implementation Guide

## 🚀 Step-by-Step Implementation

This guide provides practical code examples and implementation steps to build the Spring Boot version of Smart Locator Inspector.

---

## 📋 Phase 1: Project Setup & Foundation

### **1.1 Create Spring Boot Project**

#### **Using Spring Initializr**
```bash
# Generate project
curl https://start.spring.io/starter.zip \
  -d dependencies=web,thymeleaf,websocket,devtools \
  -d type=maven-project \
  -d language=java \
  -d bootVersion=3.1.5 \
  -d groupId=com.smartlocator \
  -d artifactId=smart-locator-inspector \
  -d name="Smart Locator Inspector" \
  -d description="Web-based element locator inspector" \
  -d packageName=com.smartlocator.inspector \
  -o smart-locator-inspector.zip

unzip smart-locator-inspector.zip
cd smart-locator-inspector
```

#### **Enhanced pom.xml**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>
    
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.1.5</version>
        <relativePath/>
    </parent>
    
    <groupId>com.smartlocator</groupId>
    <artifactId>smart-locator-inspector</artifactId>
    <version>1.0.0</version>
    <name>Smart Locator Inspector</name>
    <description>Web-based element locator inspector for QA automation</description>
    
    <properties>
        <java.version>17</java.version>
    </properties>
    
    <dependencies>
        <!-- Spring Boot Starters -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-thymeleaf</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-websocket</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        
        <!-- Chrome DevTools Protocol -->
        <dependency>
            <groupId>com.github.kklisura.cdt</groupId>
            <artifactId>cdt-java-client</artifactId>
            <version>4.0.0</version>
        </dependency>
        
        <!-- HTML Parsing -->
        <dependency>
            <groupId>org.jsoup</groupId>
            <artifactId>jsoup</artifactId>
            <version>1.16.1</version>
        </dependency>
        
        <!-- JSON Processing -->
        <dependency>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-databind</artifactId>
        </dependency>
        
        <!-- Utilities -->
        <dependency>
            <groupId>org.apache.commons</groupId>
            <artifactId>commons-lang3</artifactId>
        </dependency>
        
        <!-- Development Tools -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-devtools</artifactId>
            <scope>runtime</scope>
            <optional>true</optional>
        </dependency>
        
        <!-- Testing -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
    
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

### **1.2 Application Configuration**

#### **application.yml**
```yaml
server:
  port: 8080
  servlet:
    context-path: /

spring:
  application:
    name: smart-locator-inspector
  thymeleaf:
    cache: false
    prefix: classpath:/templates/
    suffix: .html
    encoding: UTF-8
  web:
    resources:
      static-locations: classpath:/static/
      cache:
        period: 0
  devtools:
    restart:
      enabled: true

# Chrome Configuration
chrome:
  binary-path: "C:/Program Files/Google/Chrome/Application/chrome.exe"  # Windows
  # binary-path: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"  # macOS
  # binary-path: "/usr/bin/google-chrome"  # Linux
  headless: false
  remote-debugging-port: 9222
  user-data-dir: "./chrome-data"
  window-size: "1280,720"

# WebSocket Configuration
websocket:
  allowed-origins: "*"
  endpoint: "/ws"

# Locator Engine Configuration
locator:
  max-results: 15
  timeout-ms: 5000
  scoring:
    id-weight: 30
    uniqueness-weight: 25
    framework-weight: 20
    accessibility-weight: 15
    simplicity-weight: 10

# Logging
logging:
  level:
    com.smartlocator: DEBUG
    org.springframework.web.socket: DEBUG
    com.github.kklisura: INFO
  pattern:
    console: "%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n"
```

### **1.3 Main Application Class**

#### **SmartLocatorInspectorApplication.java**
```java
package com.smartlocator.inspector;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
@ConfigurationPropertiesScan
public class SmartLocatorInspectorApplication {

    public static void main(String[] args) {
        System.out.println("🧠 Starting Smart Locator Inspector...");
        SpringApplication.run(SmartLocatorInspectorApplication.class, args);
        System.out.println("🚀 Dashboard available at: http://localhost:8080/dashboard");
    }
}
```

---

## 🏗️ Phase 2: Core Data Models

### **2.1 Element Information Model**

#### **ElementInfo.java**
```java
package com.smartlocator.inspector.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ElementInfo {
    
    private String tagName;
    private String id;
    private String className;
    private String textContent;
    private Map<String, String> attributes;
    private String xpath;
    private BoundingBox boundingBox;
    private ElementInfo parent;
    private List<ElementInfo> children;
    private LocalDateTime detectedAt;
    
    // Constructors
    public ElementInfo() {
        this.detectedAt = LocalDateTime.now();
    }
    
    public ElementInfo(String tagName, String id, String className) {
        this();
        this.tagName = tagName;
        this.id = id;
        this.className = className;
    }
    
    // Utility methods
    public boolean hasId() {
        return id != null && !id.trim().isEmpty();
    }
    
    public boolean hasClasses() {
        return className != null && !className.trim().isEmpty();
    }
    
    public boolean hasText() {
        return textContent != null && !textContent.trim().isEmpty();
    }
    
    public String getDisplayText() {
        if (textContent == null) return "";
        return textContent.length() > 50 ? 
            textContent.substring(0, 47) + "..." : textContent;
    }
    
    // Getters and Setters
    public String getTagName() { return tagName; }
    public void setTagName(String tagName) { this.tagName = tagName; }
    
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }
    
    public String getTextContent() { return textContent; }
    public void setTextContent(String textContent) { this.textContent = textContent; }
    
    public Map<String, String> getAttributes() { return attributes; }
    public void setAttributes(Map<String, String> attributes) { this.attributes = attributes; }
    
    public String getXpath() { return xpath; }
    public void setXpath(String xpath) { this.xpath = xpath; }
    
    public BoundingBox getBoundingBox() { return boundingBox; }
    public void setBoundingBox(BoundingBox boundingBox) { this.boundingBox = boundingBox; }
    
    public ElementInfo getParent() { return parent; }
    public void setParent(ElementInfo parent) { this.parent = parent; }
    
    public List<ElementInfo> getChildren() { return children; }
    public void setChildren(List<ElementInfo> children) { this.children = children; }
    
    public LocalDateTime getDetectedAt() { return detectedAt; }
    public void setDetectedAt(LocalDateTime detectedAt) { this.detectedAt = detectedAt; }
    
    @Override
    public String toString() {
        return String.format("ElementInfo{tagName='%s', id='%s', className='%s'}", 
                           tagName, id, className);
    }
}
```

#### **BoundingBox.java**
```java
package com.smartlocator.inspector.model;

public class BoundingBox {
    private double x;
    private double y;
    private double width;
    private double height;
    
    public BoundingBox() {}
    
    public BoundingBox(double x, double y, double width, double height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    
    // Getters and Setters
    public double getX() { return x; }
    public void setX(double x) { this.x = x; }
    
    public double getY() { return y; }
    public void setY(double y) { this.y = y; }
    
    public double getWidth() { return width; }
    public void setWidth(double width) { this.width = width; }
    
    public double getHeight() { return height; }
    public void setHeight(double height) { this.height = height; }
    
    @Override
    public String toString() {
        return String.format("BoundingBox{x=%.1f, y=%.1f, width=%.1f, height=%.1f}", 
                           x, y, width, height);
    }
}
```

### **2.2 Locator Result Model**

#### **LocatorResult.java**
```java
package com.smartlocator.inspector.model;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class LocatorResult {
    
    private String strategy;
    private String locator;
    private int score;
    private boolean unique;
    private String description;
    private LocatorType type;
    private LocalDateTime generatedAt;
    
    // Enums
    public enum LocatorType {
        ID("ID Selector"),
        CSS("CSS Selector"),
        XPATH("XPath Expression"),
        TEXT("Text Content"),
        FRAMEWORK("Framework Attribute"),
        ACCESSIBILITY("Accessibility Attribute"),
        TABLE("Table Navigation"),
        STRUCTURAL("Structural Position");
        
        private final String displayName;
        
        LocatorType(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() { return displayName; }
    }
    
    // Constructors
    public LocatorResult() {
        this.generatedAt = LocalDateTime.now();
    }
    
    public LocatorResult(String strategy, String locator, int score, boolean unique) {
        this();
        this.strategy = strategy;
        this.locator = locator;
        this.score = score;
        this.unique = unique;
    }
    
    public LocatorResult(String strategy, String locator, int score, boolean unique, 
                        LocatorType type, String description) {
        this(strategy, locator, score, unique);
        this.type = type;
        this.description = description;
    }
    
    // Utility methods
    public String getScoreClass() {
        if (score >= 90) return "success";
        if (score >= 70) return "warning";
        return "danger";
    }
    
    public String getScoreDescription() {
        if (score >= 95) return "Excellent";
        if (score >= 85) return "Very Good";
        if (score >= 70) return "Good";
        if (score >= 50) return "Fair";
        return "Poor";
    }
    
    public boolean isHighQuality() {
        return score >= 85 && unique;
    }
    
    // Getters and Setters
    public String getStrategy() { return strategy; }
    public void setStrategy(String strategy) { this.strategy = strategy; }
    
    public String getLocator() { return locator; }
    public void setLocator(String locator) { this.locator = locator; }
    
    public int getScore() { return score; }
    public void setScore(int score) { this.score = Math.max(0, Math.min(100, score)); }
    
    public boolean isUnique() { return unique; }
    public void setUnique(boolean unique) { this.unique = unique; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public LocatorType getType() { return type; }
    public void setType(LocatorType type) { this.type = type; }
    
    public LocalDateTime getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; }
    
    @Override
    public String toString() {
        return String.format("LocatorResult{strategy='%s', locator='%s', score=%d, unique=%s}", 
                           strategy, locator, score, unique);
    }
}
```

### **2.3 Connection Status Model**

#### **ConnectionStatus.java**
```java
package com.smartlocator.inspector.model;

import java.time.LocalDateTime;

public class ConnectionStatus {
    
    private String targetUrl;
    private boolean connected;
    private String browserVersion;
    private String pageTitle;
    private ConnectionState state;
    private String errorMessage;
    private LocalDateTime connectedAt;
    private LocalDateTime lastActivity;
    
    public enum ConnectionState {
        DISCONNECTED("Disconnected", "secondary"),
        CONNECTING("Connecting...", "warning"), 
        CONNECTED("Connected", "success"),
        ERROR("Error", "danger");
        
        private final String displayText;
        private final String badgeClass;
        
        ConnectionState(String displayText, String badgeClass) {
            this.displayText = displayText;
            this.badgeClass = badgeClass;
        }
        
        public String getDisplayText() { return displayText; }
        public String getBadgeClass() { return badgeClass; }
    }
    
    // Constructors
    public ConnectionStatus() {
        this.state = ConnectionState.DISCONNECTED;
    }
    
    public ConnectionStatus(String targetUrl) {
        this();
        this.targetUrl = targetUrl;
    }
    
    // Utility methods
    public void setConnected(String browserVersion, String pageTitle) {
        this.connected = true;
        this.state = ConnectionState.CONNECTED;
        this.browserVersion = browserVersion;
        this.pageTitle = pageTitle;
        this.connectedAt = LocalDateTime.now();
        this.lastActivity = LocalDateTime.now();
        this.errorMessage = null;
    }
    
    public void setError(String errorMessage) {
        this.connected = false;
        this.state = ConnectionState.ERROR;
        this.errorMessage = errorMessage;
    }
    
    public void updateActivity() {
        this.lastActivity = LocalDateTime.now();
    }
    
    // Getters and Setters
    public String getTargetUrl() { return targetUrl; }
    public void setTargetUrl(String targetUrl) { this.targetUrl = targetUrl; }
    
    public boolean isConnected() { return connected; }
    public void setConnected(boolean connected) { this.connected = connected; }
    
    public String getBrowserVersion() { return browserVersion; }
    public void setBrowserVersion(String browserVersion) { this.browserVersion = browserVersion; }
    
    public String getPageTitle() { return pageTitle; }
    public void setPageTitle(String pageTitle) { this.pageTitle = pageTitle; }
    
    public ConnectionState getState() { return state; }
    public void setState(ConnectionState state) { this.state = state; }
    
    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
    
    public LocalDateTime getConnectedAt() { return connectedAt; }
    public void setConnectedAt(LocalDateTime connectedAt) { this.connectedAt = connectedAt; }
    
    public LocalDateTime getLastActivity() { return lastActivity; }
    public void setLastActivity(LocalDateTime lastActivity) { this.lastActivity = lastActivity; }
}
```

---

## 🔧 Phase 3: Chrome DevTools Protocol Service

### **3.1 Chrome Configuration**

#### **ChromeConfig.java**
```java
package com.smartlocator.inspector.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "chrome")
public class ChromeConfig {
    
    private String binaryPath;
    private boolean headless = false;
    private int remoteDebuggingPort = 9222;
    private String userDataDir = "./chrome-data";
    private String windowSize = "1280,720";
    
    // Getters and Setters
    public String getBinaryPath() { return binaryPath; }
    public void setBinaryPath(String binaryPath) { this.binaryPath = binaryPath; }
    
    public boolean isHeadless() { return headless; }
    public void setHeadless(boolean headless) { this.headless = headless; }
    
    public int getRemoteDebuggingPort() { return remoteDebuggingPort; }
    public void setRemoteDebuggingPort(int remoteDebuggingPort) { 
        this.remoteDebuggingPort = remoteDebuggingPort; 
    }
    
    public String getUserDataDir() { return userDataDir; }
    public void setUserDataDir(String userDataDir) { this.userDataDir = userDataDir; }
    
    public String getWindowSize() { return windowSize; }
    public void setWindowSize(String windowSize) { this.windowSize = windowSize; }
}
```

### **3.2 CDP Service Implementation**

#### **CDPService.java**
```java
package com.smartlocator.inspector.service;

import com.github.kklisura.cdt.launch.ChromeLauncher;
import com.github.kklisura.cdt.protocol.commands.*;
import com.github.kklisura.cdt.services.ChromeDevToolsService;
import com.github.kklisura.cdt.services.ChromeService;
import com.github.kklisura.cdt.services.types.ChromeTab;
import com.smartlocator.inspector.config.ChromeConfig;
import com.smartlocator.inspector.model.ConnectionStatus;
import com.smartlocator.inspector.model.ElementInfo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.annotation.PreDestroy;
import java.util.function.Consumer;

@Service
public class CDPService {
    
    private static final Logger logger = LoggerFactory.getLogger(CDPService.class);
    
    @Autowired
    private ChromeConfig chromeConfig;
    
    @Autowired
    private WebSocketService webSocketService;
    
    private ChromeLauncher chromeLauncher;
    private ChromeService chromeService;
    private ChromeDevToolsService devToolsService;
    private ConnectionStatus connectionStatus;
    private Consumer<ElementInfo> elementCallback;
    
    public CDPService() {
        this.connectionStatus = new ConnectionStatus();
    }
    
    /**
     * Connect to target URL and set up element detection
     */
    public ConnectionStatus connectToUrl(String targetUrl) {
        logger.info("Connecting to URL: {}", targetUrl);
        
        try {
            connectionStatus.setTargetUrl(targetUrl);
            connectionStatus.setState(ConnectionStatus.ConnectionState.CONNECTING);
            webSocketService.broadcastConnectionStatus(connectionStatus);
            
            // Launch Chrome
            launchChrome();
            
            // Navigate to target URL
            navigateToUrl(targetUrl);
            
            // Set up element detection
            setupElementDetection();
            
            // Update connection status
            String browserVersion = getBrowserVersion();
            String pageTitle = getPageTitle();
            connectionStatus.setConnected(browserVersion, pageTitle);
            
            logger.info("Successfully connected to: {}", targetUrl);
            webSocketService.broadcastConnectionStatus(connectionStatus);
            
            return connectionStatus;
            
        } catch (Exception e) {
            logger.error("Failed to connect to URL: {}", targetUrl, e);
            connectionStatus.setError("Failed to connect: " + e.getMessage());
            webSocketService.broadcastConnectionStatus(connectionStatus);
            return connectionStatus;
        }
    }
    
    /**
     * Launch Chrome with CDP enabled
     */
    private void launchChrome() {
        logger.debug("Launching Chrome with CDP on port: {}", chromeConfig.getRemoteDebuggingPort());
        
        chromeLauncher = new ChromeLauncher();
        
        // Configure Chrome launch options
        ChromeLauncher.Builder builder = chromeLauncher.builder()
                .setRemoteDebuggingPort(chromeConfig.getRemoteDebuggingPort())
                .setUserDataDir(chromeConfig.getUserDataDir())
                .addArgument("--window-size=" + chromeConfig.getWindowSize())
                .addArgument("--disable-web-security")
                .addArgument("--disable-features=VizDisplayCompositor");
        
        if (chromeConfig.getBinaryPath() != null) {
            builder.setChromeBinary(chromeConfig.getBinaryPath());
        }
        
        if (chromeConfig.isHeadless()) {
            builder.addArgument("--headless");
        }
        
        // Launch Chrome
        chromeService = builder.build().launch();
        
        // Create DevTools service
        ChromeTab tab = chromeService.createTab();
        devToolsService = chromeService.createDevToolsService(tab);
        
        // Enable domains
        devToolsService.getPage().enable();
        devToolsService.getRuntime().enable();
        devToolsService.getDOM().enable();
        
        logger.info("Chrome launched successfully");
    }
    
    /**
     * Navigate to target URL
     */
    private void navigateToUrl(String url) {
        logger.debug("Navigating to: {}", url);
        devToolsService.getPage().navigate(url);
        
        // Wait for page load
        devToolsService.getPage().onLoadEventFired(event -> {
            logger.info("Page loaded: {}", url);
        });
    }
    
    /**
     * Set up element detection via mouse tracking
     */
    private void setupElementDetection() {
        logger.debug("Setting up element detection");
        
        // Inject mouse tracking script
        String mouseTrackingScript = getMouseTrackingScript();
        devToolsService.getRuntime().evaluate(mouseTrackingScript);
        
        // Set up runtime console to capture element data
        devToolsService.getRuntime().onConsoleAPICalled(event -> {
            if (event.getType().equals("log") && 
                event.getArgs().size() > 0 && 
                event.getArgs().get(0).getValue() != null) {
                
                String message = event.getArgs().get(0).getValue().toString();
                if (message.startsWith("SMART_LOCATOR_ELEMENT:")) {
                    handleElementDetection(message);
                }
            }
        });
        
        logger.info("Element detection setup complete");
    }
    
    /**
     * Generate mouse tracking JavaScript
     */
    private String getMouseTrackingScript() {
        return """
            (function() {
                let lastElement = null;
                let debounceTimer = null;
                
                function extractElementInfo(element) {
                    const rect = element.getBoundingClientRect();
                    const attributes = {};
                    
                    // Extract relevant attributes
                    ['id', 'class', 'name', 'data-testid', 'data-cy', 'data-test', 
                     'aria-label', 'aria-labelledby', 'role', 'type', 'placeholder',
                     'ng-model', 'v-model', 'data-bind'].forEach(attr => {
                        const value = element.getAttribute(attr);
                        if (value) attributes[attr] = value;
                    });
                    
                    return {
                        tagName: element.tagName,
                        id: element.id || null,
                        className: element.className || null,
                        textContent: element.textContent ? element.textContent.substring(0, 200).trim() : null,
                        attributes: attributes,
                        boundingBox: {
                            x: rect.left,
                            y: rect.top,
                            width: rect.width,
                            height: rect.height
                        }
                    };
                }
                
                function sendElementInfo(elementInfo) {
                    console.log('SMART_LOCATOR_ELEMENT:' + JSON.stringify(elementInfo));
                }
                
                document.addEventListener('mouseover', function(event) {
                    if (event.target === lastElement) return;
                    lastElement = event.target;
                    
                    // Debounce to avoid too many calls
                    clearTimeout(debounceTimer);
                    debounceTimer = setTimeout(() => {
                        const elementInfo = extractElementInfo(event.target);
                        sendElementInfo(elementInfo);
                    }, 50);
                });
                
                console.log('Smart Locator Inspector: Mouse tracking active');
            })();
            """;
    }
    
    /**
     * Handle element detection from JavaScript
     */
    private void handleElementDetection(String message) {
        try {
            String jsonData = message.substring("SMART_LOCATOR_ELEMENT:".length());
            // Parse JSON and create ElementInfo object
            ElementInfo elementInfo = parseElementInfo(jsonData);
            
            // Update connection activity
            connectionStatus.updateActivity();
            
            // Notify callback if set
            if (elementCallback != null) {
                elementCallback.accept(elementInfo);
            }
            
        } catch (Exception e) {
            logger.error("Failed to parse element info: {}", message, e);
        }
    }
    
    /**
     * Parse JSON string to ElementInfo object
     */
    private ElementInfo parseElementInfo(String jsonData) {
        // TODO: Implement JSON parsing to ElementInfo
        // This is a simplified version - use Jackson ObjectMapper in real implementation
        ElementInfo elementInfo = new ElementInfo();
        // Parse and populate elementInfo fields
        return elementInfo;
    }
    
    /**
     * Get browser version
     */
    private String getBrowserVersion() {
        try {
            return devToolsService.getBrowser().getVersion().getProduct();
        } catch (Exception e) {
            return "Unknown";
        }
    }
    
    /**
     * Get page title
     */
    private String getPageTitle() {
        try {
            String script = "document.title";
            return devToolsService.getRuntime().evaluate(script).getResult().getValue().toString();
        } catch (Exception e) {
            return "Unknown";
        }
    }
    
    /**
     * Set element detection callback
     */
    public void setElementCallback(Consumer<ElementInfo> callback) {
        this.elementCallback = callback;
    }
    
    /**
     * Get current connection status
     */
    public ConnectionStatus getConnectionStatus() {
        return connectionStatus;
    }
    
    /**
     * Disconnect from Chrome
     */
    public void disconnect() {
        logger.info("Disconnecting from Chrome");
        
        try {
            if (devToolsService != null) {
                devToolsService.close();
            }
            if (chromeService != null) {
                chromeService.close();
            }
            if (chromeLauncher != null) {
                chromeLauncher.close();
            }
        } catch (Exception e) {
            logger.error("Error during disconnect", e);
        }
        
        connectionStatus.setState(ConnectionStatus.ConnectionState.DISCONNECTED);
        connectionStatus.setConnected(false);
        webSocketService.broadcastConnectionStatus(connectionStatus);
        
        logger.info("Disconnected successfully");
    }
    
    /**
     * Cleanup on application shutdown
     */
    @PreDestroy
    public void cleanup() {
        disconnect();
    }
}
```

---

## 🎯 Phase 4: Locator Generation Engine

### **4.1 Core Locator Service**

#### **LocatorService.java**
```java
package com.smartlocator.inspector.service;

import com.smartlocator.inspector.model.ElementInfo;
import com.smartlocator.inspector.model.LocatorResult;
import com.smartlocator.inspector.util.XPathGenerator;
import com.smartlocator.inspector.util.CSSGenerator;
import com.smartlocator.inspector.util.FrameworkDetector;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class LocatorService {
    
    private static final Logger logger = LoggerFactory.getLogger(LocatorService.class);
    
    @Autowired
    private XPathGenerator xpathGenerator;
    
    @Autowired
    private CSSGenerator cssGenerator;
    
    @Autowired
    private FrameworkDetector frameworkDetector;
    
    private List<LocatorResult> currentLocators = new ArrayList<>();
    
    /**
     * Generate all possible locators for an element
     */
    public List<LocatorResult> generateLocators(ElementInfo element) {
        logger.debug("Generating locators for element: {}", element);
        
        List<LocatorResult> locators = new ArrayList<>();
        
        try {
            // Generate different types of locators
            locators.addAll(generateIdLocators(element));
            locators.addAll(generateCssLocators(element));
            locators.addAll(generateXPathLocators(element));
            locators.addAll(generateTextLocators(element));
            locators.addAll(generateFrameworkLocators(element));
            locators.addAll(generateAccessibilityLocators(element));
            locators.addAll(generateNameLocators(element));
            
            // Score and sort locators
            locators = scoreAndSortLocators(locators, element);
            
            // Update current locators
            this.currentLocators = locators;
            
            logger.info("Generated {} locators for element {}", locators.size(), element.getTagName());
            
        } catch (Exception e) {
            logger.error("Error generating locators for element: {}", element, e);
        }
        
        return locators;
    }
    
    /**
     * Generate ID-based locators
     */
    private List<LocatorResult> generateIdLocators(ElementInfo element) {
        List<LocatorResult> locators = new ArrayList<>();
        
        if (element.hasId() && !isDynamicValue(element.getId())) {
            // CSS ID selector
            LocatorResult cssId = new LocatorResult(
                "ID (CSS)", 
                "#" + element.getId(), 
                100, 
                true, 
                LocatorResult.LocatorType.ID,
                "CSS ID selector - highest reliability"
            );
            locators.add(cssId);
            
            // XPath ID selector
            LocatorResult xpathId = new LocatorResult(
                "ID (XPath)", 
                "//*[@id='" + element.getId() + "']", 
                98, 
                true, 
                LocatorResult.LocatorType.XPATH,
                "XPath ID selector"
            );
            locators.add(xpathId);
        }
        
        return locators;
    }
    
    /**
     * Generate CSS class-based locators
     */
    private List<LocatorResult> generateCssLocators(ElementInfo element) {
        List<LocatorResult> locators = new ArrayList<>();
        
        if (element.hasClasses()) {
            String[] classes = element.getClassName().trim().split("\\s+");
            List<String> stableClasses = Arrays.stream(classes)
                .filter(cls -> !isDynamicValue(cls) && !isCssInJsClass(cls))
                .collect(Collectors.toList());
            
            if (!stableClasses.isEmpty()) {
                // Single class
                for (String cls : stableClasses) {
                    LocatorResult singleClass = new LocatorResult(
                        "CSS Class",
                        "." + cls,
                        calculateClassScore(cls),
                        false, // Assume not unique without validation
                        LocatorResult.LocatorType.CSS,
                        "Single CSS class selector"
                    );
                    locators.add(singleClass);
                }
                
                // Multiple classes combined
                if (stableClasses.size() > 1) {
                    String combinedClasses = "." + String.join(".", stableClasses);
                    LocatorResult multiClass = new LocatorResult(
                        "CSS Classes",
                        combinedClasses,
                        calculateMultiClassScore(stableClasses),
                        false,
                        LocatorResult.LocatorType.CSS,
                        "Multiple CSS classes combined"
                    );
                    locators.add(multiClass);
                }
                
                // Tag + Class combination
                String tagClass = element.getTagName().toLowerCase() + "." + stableClasses.get(0);
                LocatorResult tagWithClass = new LocatorResult(
                    "Tag + Class",
                    tagClass,
                    calculateTagClassScore(),
                    false,
                    LocatorResult.LocatorType.CSS,
                    "Tag name with CSS class"
                );
                locators.add(tagWithClass);
            }
        }
        
        return locators;
    }
    
    /**
     * Generate XPath locators
     */
    private List<LocatorResult> generateXPathLocators(ElementInfo element) {
        return xpathGenerator.generateXPaths(element);
    }
    
    /**
     * Generate text-based locators
     */
    private List<LocatorResult> generateTextLocators(ElementInfo element) {
        List<LocatorResult> locators = new ArrayList<>();
        
        if (element.hasText()) {
            String text = element.getTextContent().trim();
            
            // Exact text match
            LocatorResult exactText = new LocatorResult(
                "Text (Exact)",
                String.format("//%s[text()='%s']", element.getTagName().toLowerCase(), text),
                calculateTextScore(text, true),
                false,
                LocatorResult.LocatorType.TEXT,
                "Exact text content match"
            );
            locators.add(exactText);
            
            // Contains text
            LocatorResult containsText = new LocatorResult(
                "Text (Contains)",
                String.format("//%s[contains(text(),'%s')]", element.getTagName().toLowerCase(), text),
                calculateTextScore(text, false),
                false,
                LocatorResult.LocatorType.TEXT,
                "Partial text content match"
            );
            locators.add(containsText);
            
            // Normalized text (handles whitespace)
            LocatorResult normalizedText = new LocatorResult(
                "Text (Normalized)",
                String.format("//%s[normalize-space(text())='%s']", element.getTagName().toLowerCase(), text),
                calculateTextScore(text, true) - 5,
                false,
                LocatorResult.LocatorType.TEXT,
                "Normalized text content (handles whitespace)"
            );
            locators.add(normalizedText);
        }
        
        return locators;
    }
    
    /**
     * Generate framework-specific locators
     */
    private List<LocatorResult> generateFrameworkLocators(ElementInfo element) {
        return frameworkDetector.detectFrameworkAttributes(element);
    }
    
    /**
     * Generate accessibility-based locators
     */
    private List<LocatorResult> generateAccessibilityLocators(ElementInfo element) {
        List<LocatorResult> locators = new ArrayList<>();
        
        if (element.getAttributes() != null) {
            Map<String, String> attributes = element.getAttributes();
            
            // ARIA label
            if (attributes.containsKey("aria-label")) {
                LocatorResult ariaLabel = new LocatorResult(
                    "ARIA Label",
                    String.format("[aria-label='%s']", attributes.get("aria-label")),
                    92,
                    false,
                    LocatorResult.LocatorType.ACCESSIBILITY,
                    "ARIA label for accessibility"
                );
                locators.add(ariaLabel);
            }
            
            // ARIA role
            if (attributes.containsKey("role")) {
                LocatorResult ariaRole = new LocatorResult(
                    "ARIA Role",
                    String.format("[role='%s']", attributes.get("role")),
                    88,
                    false,
                    LocatorResult.LocatorType.ACCESSIBILITY,
                    "ARIA role for semantic meaning"
                );
                locators.add(ariaRole);
            }
            
            // Title attribute
            if (attributes.containsKey("title")) {
                LocatorResult title = new LocatorResult(
                    "Title",
                    String.format("[title='%s']", attributes.get("title")),
                    85,
                    false,
                    LocatorResult.LocatorType.ACCESSIBILITY,
                    "Title attribute for tooltips"
                );
                locators.add(title);
            }
        }
        
        return locators;
    }
    
    /**
     * Generate name-based locators
     */
    private List<LocatorResult> generateNameLocators(ElementInfo element) {
        List<LocatorResult> locators = new ArrayList<>();
        
        if (element.getAttributes() != null && element.getAttributes().containsKey("name")) {
            String name = element.getAttributes().get("name");
            
            // CSS name selector
            LocatorResult cssName = new LocatorResult(
                "Name (CSS)",
                String.format("[name='%s']", name),
                95,
                false,
                LocatorResult.LocatorType.CSS,
                "Form element name attribute"
            );
            locators.add(cssName);
            
            // XPath name selector
            LocatorResult xpathName = new LocatorResult(
                "Name (XPath)",
                String.format("//*[@name='%s']", name),
                93,
                false,
                LocatorResult.LocatorType.XPATH,
                "XPath name attribute selector"
            );
            locators.add(xpathName);
        }
        
        return locators;
    }
    
    /**
     * Score and sort locators by reliability
     */
    private List<LocatorResult> scoreAndSortLocators(List<LocatorResult> locators, ElementInfo element) {
        // Sort by score (descending) and then by strategy preference
        return locators.stream()
            .sorted((a, b) -> {
                int scoreComparison = Integer.compare(b.getScore(), a.getScore());
                if (scoreComparison != 0) return scoreComparison;
                
                // Secondary sort by strategy preference
                return getStrategyPriority(a.getStrategy()) - getStrategyPriority(b.getStrategy());
            })
            .limit(15) // Limit to top 15 locators
            .collect(Collectors.toList());
    }
    
    /**
     * Get strategy priority for sorting
     */
    private int getStrategyPriority(String strategy) {
        Map<String, Integer> priorities = Map.of(
            "ID (CSS)", 1,
            "ID (XPath)", 2,
            "Framework", 3,
            "Name (CSS)", 4,
            "ARIA Label", 5,
            "CSS Classes", 6,
            "Text (Exact)", 7,
            "CSS Class", 8
        );
        return priorities.getOrDefault(strategy, 99);
    }
    
    // Utility methods for scoring
    private boolean isDynamicValue(String value) {
        return value.matches(".*\\d{10,}.*") || // Timestamps
               value.matches(".*[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}.*") || // UUIDs
               value.matches(".*css-[a-z0-9]+.*"); // CSS-in-JS
    }
    
    private boolean isCssInJsClass(String className) {
        return className.matches("css-[a-z0-9]+") ||
               className.matches("sc-[a-z0-9]+") ||
               className.startsWith("emotion-");
    }
    
    private int calculateClassScore(String className) {
        int score = 75; // Base score for CSS classes
        if (className.length() < 30) score += 5; // Shorter is better
        if (!className.contains("-")) score -= 5; // Prefer semantic class names
        return Math.max(50, Math.min(85, score));
    }
    
    private int calculateMultiClassScore(List<String> classes) {
        return Math.min(80, 70 + (classes.size() * 3)); // More classes = more specific
    }
    
    private int calculateTagClassScore() {
        return 72; // Standard score for tag+class combinations
    }
    
    private int calculateTextScore(String text, boolean exact) {
        int score = exact ? 85 : 75;
        if (text.length() < 50) score += 5;
        if (text.matches("^[A-Za-z\\s]+$")) score += 3; // Letters and spaces only
        return Math.max(60, Math.min(90, score));
    }
    
    /**
     * Get current locators
     */
    public List<LocatorResult> getCurrentLocators() {
        return new ArrayList<>(currentLocators);
    }
}
```

This implementation guide provides a solid foundation for building the Spring Boot version of Smart Locator Inspector. The next parts would cover the WebSocket service, frontend templates, and additional utility classes.

Would you like me to continue with the remaining implementation details?