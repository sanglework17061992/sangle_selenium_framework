# 🌐 Smart Locator Inspector - Spring Boot Web Application Requirements

## 📋 Project Overview

**Objective**: Build a web-based version of Smart Locator Inspector using Spring Boot + Thymeleaf that displays real-time element locators in a web application instead of browser popups.

**Key Difference**: Instead of injecting a modal into the target website, locators are displayed in a separate web application that communicates with Chrome via CDP (Chrome DevTools Protocol).

---

## 🏗️ System Architecture

### 🎯 **High-Level Architecture**

```
┌─────────────────┐    CDP WebSocket    ┌──────────────────┐
│   Target Web    │ ◄─────────────────► │  Chrome Browser  │
│   Application   │                     │   (Headless)     │
└─────────────────┘                     └──────────────────┘
                                                 │
                                                 │ CDP Commands
                                                 ▼
┌─────────────────┐    REST/WebSocket   ┌──────────────────┐
│   Spring Boot   │ ◄─────────────────► │   CDP Service    │
│  Web Dashboard  │                     │    (Backend)     │
└─────────────────┘                     └──────────────────┘
        │                                        │
        │ Thymeleaf + HTMX                      │ Real-time
        ▼                                        ▼
┌─────────────────┐                     ┌──────────────────┐
│   Web Browser   │                     │  Locator Engine  │
│  (Dashboard)    │                     │   (Service)      │
└─────────────────┘                     └──────────────────┘
```

### 🔧 **Component Breakdown**

1. **Spring Boot Backend**: RESTful API + WebSocket server
2. **Thymeleaf Frontend**: Real-time dashboard with HTMX
3. **CDP Service**: Chrome DevTools Protocol communication
4. **Locator Engine**: Element analysis and XPath generation
5. **WebSocket Handler**: Real-time communication between frontend/backend

---

## 🎯 Functional Requirements

### 1. **🚀 Core Functionality**

#### **F1.1 - Target Website Connection**
- **Input**: URL of target website to inspect
- **Process**: Launch Chrome with CDP enabled, navigate to URL
- **Output**: Connection status and page load confirmation
- **UI**: Connection form with URL input and "Connect" button

#### **F1.2 - Real-Time Element Detection**
- **Trigger**: Mouse movement over target website
- **Process**: CDP captures mouse coordinates, identifies DOM element
- **Output**: Element information sent to web dashboard
- **Performance**: < 100ms response time for element detection

#### **F1.3 - Locator Generation**
- **Input**: DOM element from CDP
- **Process**: Generate multiple locator strategies with scoring
- **Output**: Array of locators with reliability scores
- **Strategies**: ID, CSS, XPath, Text, Framework, Accessibility, Table

#### **F1.4 - Real-Time Dashboard Display**
- **Input**: Generated locators from backend
- **Process**: Update dashboard UI without page refresh
- **Output**: Live locator table with copy functionality
- **Technology**: WebSocket + HTMX for real-time updates

### 2. **🎨 User Interface Requirements**

#### **F2.1 - Dashboard Layout**
```
┌─────────────────────────────────────────────────────────┐
│  Smart Locator Inspector - Web Dashboard               │
├─────────────────────────────────────────────────────────┤
│  🔗 Connection Panel                                    │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ Target URL: [https://example.com     ] [Connect]   │ │
│  │ Status: ● Connected | Browser: Chrome | Page: Loaded│ │
│  └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│  📊 Current Element Info                                │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ Tag: button | ID: login-btn | Classes: btn primary  │ │
│  │ Text: "Login" | Parent: form#login-form             │ │
│  └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│  🎯 Generated Locators (Live Updates)                   │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ Strategy    │ Locator                │ Score │ Copy │ │
│  │ ID          │ #login-btn             │  100  │ 📋  │ │
│  │ CSS         │ .btn.btn-primary       │   85  │ 📋  │ │
│  │ XPath       │ //button[@id='login']  │   98  │ 📋  │ │
│  │ Text        │ //button[text()="Login"]│   90  │ 📋  │ │
│  │ Framework   │ [data-testid="login"]  │   97  │ 📋  │ │
│  └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│  🌲 DOM Hierarchy                                       │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ html > body > main > form#login > button#login-btn │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

#### **F2.2 - Real-Time Updates**
- **Live Element Highlighting**: Show currently hovered element info
- **Instant Locator Updates**: Update locator table without page refresh
- **Visual Feedback**: Loading indicators, connection status
- **Responsive Design**: Mobile and desktop compatible

#### **F2.3 - Copy Functionality**
- **One-Click Copy**: Click copy button to copy locator to clipboard
- **Toast Notifications**: "Locator copied!" confirmation
- **Keyboard Shortcuts**: Ctrl+C for current best locator

### 3. **🔧 Technical Requirements**

#### **F3.1 - Chrome DevTools Protocol Integration**
- **CDP Library**: Use Chrome DevTools Java library
- **Connection Management**: Maintain stable WebSocket connection
- **Event Handling**: Mouse move, click, keyboard events
- **Page Navigation**: Handle page loads, redirects, SPA navigation

#### **F3.2 - Real-Time Communication**
- **WebSocket Server**: Spring WebSocket configuration
- **STOMP Protocol**: Message routing and subscriptions
- **Event Broadcasting**: Send element updates to all connected clients
- **Connection Management**: Handle client connect/disconnect

#### **F3.3 - Locator Generation Engine**
- **Multiple Strategies**: Implement all strategies from original tool
- **Scoring Algorithm**: Port scoring system from JavaScript to Java
- **Framework Detection**: Angular, React, Vue attribute recognition
- **Table Handling**: Specialized XPath for table structures

---

## 🛠️ Technical Specifications

### 1. **🏗️ Backend Architecture (Spring Boot)**

#### **1.1 Project Structure**
```
src/main/java/com/smartlocator/
├── SmartLocatorApplication.java     # Main Spring Boot application
├── config/
│   ├── WebSocketConfig.java         # WebSocket configuration
│   ├── CDPConfig.java              # Chrome CDP configuration
│   └── SecurityConfig.java         # Security settings
├── controller/
│   ├── DashboardController.java     # Thymeleaf page controller
│   ├── ConnectionController.java    # REST API for connections
│   └── LocatorController.java       # REST API for locators
├── service/
│   ├── CDPService.java             # Chrome DevTools Protocol service
│   ├── LocatorService.java         # Locator generation service
│   ├── ElementService.java         # DOM element analysis
│   └── WebSocketService.java       # Real-time communication
├── model/
│   ├── ElementInfo.java            # DOM element data model
│   ├── LocatorResult.java          # Generated locator model
│   ├── ConnectionStatus.java       # CDP connection status
│   └── WebSocketMessage.java       # WebSocket message model
├── websocket/
│   ├── LocatorWebSocketHandler.java # WebSocket message handler
│   └── WebSocketEventListener.java # Connection events
└── util/
    ├── XPathGenerator.java         # XPath generation utilities
    ├── CSSSelector.java           # CSS selector utilities
    └── FrameworkDetector.java     # Framework attribute detector
```

#### **1.2 Key Dependencies (pom.xml)**
```xml
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
    
    <!-- Chrome DevTools Protocol -->
    <dependency>
        <groupId>com.github.kklisura.cdt</groupId>
        <artifactId>cdt-java-client</artifactId>
        <version>4.0.0</version>
    </dependency>
    
    <!-- JSON Processing -->
    <dependency>
        <groupId>com.fasterxml.jackson.core</groupId>
        <artifactId>jackson-databind</artifactId>
    </dependency>
    
    <!-- DOM Parsing -->
    <dependency>
        <groupId>org.jsoup</groupId>
        <artifactId>jsoup</artifactId>
        <version>1.16.1</version>
    </dependency>
    
    <!-- WebDriver for element detection -->
    <dependency>
        <groupId>org.seleniumhq.selenium</groupId>
        <artifactId>selenium-chrome-driver</artifactId>
        <version>4.15.0</version>
    </dependency>
</dependencies>
```

### 2. **🎨 Frontend Architecture (Thymeleaf + HTMX)**

#### **2.1 Template Structure**
```
src/main/resources/templates/
├── layout/
│   ├── base.html               # Base template with common elements
│   └── fragments.html          # Reusable fragments
├── dashboard.html              # Main dashboard page
├── connection.html             # Connection management
├── locators.html              # Locator display fragments
└── error.html                 # Error pages
```

#### **2.2 Static Resources**
```
src/main/resources/static/
├── css/
│   ├── dashboard.css          # Dashboard styles
│   ├── locators.css           # Locator table styles
│   └── animations.css         # Loading animations
├── js/
│   ├── dashboard.js           # Dashboard JavaScript
│   ├── websocket.js           # WebSocket client
│   ├── clipboard.js           # Copy functionality
│   └── htmx-extensions.js     # HTMX custom extensions
└── images/
    ├── icons/                 # UI icons
    └── logo.png              # Application logo
```

#### **2.3 Key Frontend Technologies**
- **Thymeleaf**: Server-side templating
- **HTMX**: Real-time DOM updates without JavaScript
- **Bootstrap 5**: Responsive UI framework
- **WebSocket**: Real-time communication
- **Clipboard API**: Copy locators to clipboard

---

## 📊 Data Models

### 1. **🏷️ Core Data Models**

#### **ElementInfo.java**
```java
public class ElementInfo {
    private String tagName;
    private String id;
    private String className;
    private String textContent;
    private Map<String, String> attributes;
    private String xpath;
    private ElementInfo parent;
    private List<ElementInfo> children;
    private BoundingBox boundingBox;
    private Long timestamp;
    
    // getters, setters, constructors
}
```

#### **LocatorResult.java**
```java
public class LocatorResult {
    private String strategy;        // "ID", "CSS", "XPath", etc.
    private String locator;         // The actual locator string
    private int score;             // Reliability score 0-100
    private boolean isUnique;      // Whether it matches one element
    private String description;    // Human-readable description
    private LocatorType type;      // Enum: ID, CSS, XPATH, TEXT, etc.
    private Long generatedAt;      // Timestamp
    
    // getters, setters, constructors
}
```

#### **ConnectionStatus.java**
```java
public class ConnectionStatus {
    private String targetUrl;
    private boolean isConnected;
    private String browserVersion;
    private String pageTitle;
    private ConnectionState state; // DISCONNECTED, CONNECTING, CONNECTED
    private String errorMessage;
    private Long connectedAt;
    
    // getters, setters, constructors
}
```

### 2. **📡 WebSocket Messages**

#### **WebSocketMessage.java**
```java
public class WebSocketMessage {
    private MessageType type;       // ELEMENT_UPDATE, LOCATOR_UPDATE, etc.
    private String sessionId;
    private ElementInfo element;
    private List<LocatorResult> locators;
    private Object payload;
    private Long timestamp;
    
    public enum MessageType {
        ELEMENT_HOVER,
        ELEMENT_CLICK,
        LOCATORS_GENERATED,
        CONNECTION_STATUS,
        ERROR
    }
}
```

---

## 🔧 Core Services Implementation

### 1. **🌐 CDPService.java**

```java
@Service
public class CDPService {
    private ChromeService chromeService;
    private ChromeDevToolsService devToolsService;
    
    public ConnectionStatus connectToUrl(String url) {
        // Launch Chrome with CDP enabled
        // Navigate to target URL
        // Set up mouse event listeners
        // Return connection status
    }
    
    public void enableMouseTracking() {
        // Enable DOM and Runtime events
        // Set up mouse move event handlers
        // Configure element highlighting
    }
    
    public ElementInfo getElementAtCoordinates(int x, int y) {
        // Use CDP to get element at coordinates
        // Extract element information
        // Return ElementInfo object
    }
    
    public void injectMouseTracker() {
        // Inject JavaScript for mouse tracking
        // Similar to original injector.js but minimal
    }
}
```

### 2. **🎯 LocatorService.java**

```java
@Service
public class LocatorService {
    
    public List<LocatorResult> generateLocators(ElementInfo element) {
        List<LocatorResult> locators = new ArrayList<>();
        
        // Generate ID-based locators
        locators.addAll(generateIdLocators(element));
        
        // Generate CSS selectors
        locators.addAll(generateCssLocators(element));
        
        // Generate XPath expressions
        locators.addAll(generateXPathLocators(element));
        
        // Generate text-based locators
        locators.addAll(generateTextLocators(element));
        
        // Generate framework-specific locators
        locators.addAll(generateFrameworkLocators(element));
        
        // Generate accessibility locators
        locators.addAll(generateAccessibilityLocators(element));
        
        // Score and sort locators
        return scoreAndSortLocators(locators);
    }
    
    private List<LocatorResult> generateIdLocators(ElementInfo element) {
        // Port ID generation logic from JavaScript
    }
    
    private List<LocatorResult> generateXPathLocators(ElementInfo element) {
        // Port XPath generation logic from JavaScript
    }
    
    private int calculateScore(LocatorResult locator, ElementInfo element) {
        // Port scoring algorithm from JavaScript
    }
}
```

### 3. **📡 WebSocketService.java**

```java
@Service
public class WebSocketService {
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    public void broadcastElementUpdate(ElementInfo element) {
        WebSocketMessage message = new WebSocketMessage();
        message.setType(MessageType.ELEMENT_HOVER);
        message.setElement(element);
        message.setTimestamp(System.currentTimeMillis());
        
        messagingTemplate.convertAndSend("/topic/elements", message);
    }
    
    public void broadcastLocators(List<LocatorResult> locators) {
        WebSocketMessage message = new WebSocketMessage();
        message.setType(MessageType.LOCATORS_GENERATED);
        message.setLocators(locators);
        message.setTimestamp(System.currentTimeMillis());
        
        messagingTemplate.convertAndSend("/topic/locators", message);
    }
}
```

---

## 🎨 Frontend Implementation

### 1. **📄 Main Dashboard Template (dashboard.html)**

```html
<!DOCTYPE html>
<html lang="en" xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Smart Locator Inspector - Dashboard</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="/css/dashboard.css" rel="stylesheet">
    <script src="https://unpkg.com/htmx.org@1.9.6"></script>
    <script src="https://unpkg.com/htmx.org/dist/ext/ws.js"></script>
</head>
<body>
    <div class="container-fluid">
        <!-- Header -->
        <div class="row">
            <div class="col-12">
                <nav class="navbar navbar-dark bg-primary">
                    <span class="navbar-brand">🧠 Smart Locator Inspector</span>
                    <span class="navbar-text" id="connection-status">
                        <span class="badge bg-secondary">Disconnected</span>
                    </span>
                </nav>
            </div>
        </div>
        
        <!-- Connection Panel -->
        <div class="row mt-3">
            <div class="col-12">
                <div class="card">
                    <div class="card-header">🔗 Target Website Connection</div>
                    <div class="card-body">
                        <form hx-post="/api/connect" hx-target="#connection-result">
                            <div class="input-group">
                                <input type="url" class="form-control" 
                                       name="targetUrl" placeholder="https://example.com" required>
                                <button class="btn btn-primary" type="submit">Connect</button>
                            </div>
                        </form>
                        <div id="connection-result" class="mt-2"></div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Current Element Info -->
        <div class="row mt-3">
            <div class="col-12">
                <div class="card">
                    <div class="card-header">📊 Current Element</div>
                    <div class="card-body">
                        <div id="current-element" 
                             hx-ext="ws" 
                             ws-connect="/ws/elements">
                            <div class="text-muted">Hover over elements to see information here...</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Locators Table -->
        <div class="row mt-3">
            <div class="col-12">
                <div class="card">
                    <div class="card-header">🎯 Generated Locators</div>
                    <div class="card-body">
                        <div id="locators-table" 
                             hx-ext="ws" 
                             ws-connect="/ws/locators">
                            <table class="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Strategy</th>
                                        <th>Locator</th>
                                        <th>Score</th>
                                        <th>Unique</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td colspan="5" class="text-muted text-center">
                                            No element selected
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- DOM Hierarchy -->
        <div class="row mt-3 mb-3">
            <div class="col-12">
                <div class="card">
                    <div class="card-header">🌲 DOM Hierarchy</div>
                    <div class="card-body">
                        <div id="dom-hierarchy">
                            <div class="text-muted">Element hierarchy will appear here...</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <script src="/js/websocket.js"></script>
    <script src="/js/clipboard.js"></script>
    <script src="/js/dashboard.js"></script>
</body>
</html>
```

### 2. **📊 Locator Table Fragment (locators-fragment.html)**

```html
<div th:fragment="locators-table">
    <table class="table table-striped">
        <thead>
            <tr>
                <th>Strategy</th>
                <th>Locator</th>
                <th>Score</th>
                <th>Unique</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            <tr th:each="locator : ${locators}">
                <td>
                    <span class="badge" 
                          th:classappend="${locator.score >= 90} ? 'bg-success' : (${locator.score >= 70} ? 'bg-warning' : 'bg-danger')"
                          th:text="${locator.strategy}">ID</span>
                </td>
                <td>
                    <code th:text="${locator.locator}">#login-btn</code>
                </td>
                <td>
                    <div class="progress" style="width: 60px;">
                        <div class="progress-bar" 
                             th:style="'width: ' + ${locator.score} + '%'"
                             th:classappend="${locator.score >= 90} ? 'bg-success' : (${locator.score >= 70} ? 'bg-warning' : 'bg-danger')">
                        </div>
                    </div>
                    <small th:text="${locator.score}">95</small>
                </td>
                <td>
                    <span class="badge" 
                          th:classappend="${locator.unique} ? 'bg-success' : 'bg-danger'"
                          th:text="${locator.unique} ? 'UNIQUE' : 'NON-UNIQUE'">UNIQUE</span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary copy-btn" 
                            th:data-locator="${locator.locator}"
                            onclick="copyToClipboard(this.dataset.locator)">
                        📋 Copy
                    </button>
                </td>
            </tr>
        </tbody>
    </table>
</div>
```

### 3. **📡 WebSocket JavaScript (websocket.js)**

```javascript
class LocatorWebSocket {
    constructor() {
        this.socket = null;
        this.stompClient = null;
        this.connect();
    }
    
    connect() {
        const socket = new SockJS('/ws');
        this.stompClient = Stomp.over(socket);
        
        this.stompClient.connect({}, (frame) => {
            console.log('Connected: ' + frame);
            
            // Subscribe to element updates
            this.stompClient.subscribe('/topic/elements', (message) => {
                this.handleElementUpdate(JSON.parse(message.body));
            });
            
            // Subscribe to locator updates
            this.stompClient.subscribe('/topic/locators', (message) => {
                this.handleLocatorUpdate(JSON.parse(message.body));
            });
        });
    }
    
    handleElementUpdate(message) {
        const element = message.element;
        const elementInfo = document.getElementById('current-element');
        
        elementInfo.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <strong>Tag:</strong> ${element.tagName}<br>
                    <strong>ID:</strong> ${element.id || 'N/A'}<br>
                    <strong>Classes:</strong> ${element.className || 'N/A'}
                </div>
                <div class="col-md-6">
                    <strong>Text:</strong> ${element.textContent || 'N/A'}<br>
                    <strong>XPath:</strong> <code>${element.xpath}</code>
                </div>
            </div>
        `;
    }
    
    handleLocatorUpdate(message) {
        const locators = message.locators;
        const tableBody = document.querySelector('#locators-table tbody');
        
        // Clear existing rows
        tableBody.innerHTML = '';
        
        // Add new locator rows
        locators.forEach(locator => {
            const row = this.createLocatorRow(locator);
            tableBody.appendChild(row);
        });
    }
    
    createLocatorRow(locator) {
        const row = document.createElement('tr');
        const scoreColor = locator.score >= 90 ? 'success' : 
                          locator.score >= 70 ? 'warning' : 'danger';
        
        row.innerHTML = `
            <td><span class="badge bg-${scoreColor}">${locator.strategy}</span></td>
            <td><code>${locator.locator}</code></td>
            <td>
                <div class="progress" style="width: 60px;">
                    <div class="progress-bar bg-${scoreColor}" style="width: ${locator.score}%"></div>
                </div>
                <small>${locator.score}</small>
            </td>
            <td>
                <span class="badge bg-${locator.unique ? 'success' : 'danger'}">
                    ${locator.unique ? 'UNIQUE' : 'NON-UNIQUE'}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-outline-primary copy-btn" 
                        onclick="copyToClipboard('${locator.locator}')">
                    📋 Copy
                </button>
            </td>
        `;
        
        return row;
    }
}

// Initialize WebSocket connection when page loads
document.addEventListener('DOMContentLoaded', () => {
    new LocatorWebSocket();
});
```

---

## 🔄 Workflow Implementation

### 1. **🎯 Element Detection Workflow**

```java
// CDPService.java - Mouse tracking
public void enableMouseTracking() {
    devToolsService.getRuntime().enable();
    devToolsService.getDOM().enable();
    
    // Inject mouse tracking script
    String mouseScript = """
        document.addEventListener('mouseover', function(event) {
            const rect = event.target.getBoundingClientRect();
            window.smartLocator.sendElementInfo({
                x: rect.left,
                y: rect.top,
                width: rect.width,
                height: rect.height,
                target: event.target
            });
        });
    """;
    
    devToolsService.getRuntime().evaluate(mouseScript);
}

// When mouse event received
public void handleMouseEvent(MouseEventData event) {
    ElementInfo element = extractElementInfo(event.getTarget());
    List<LocatorResult> locators = locatorService.generateLocators(element);
    
    // Send to WebSocket subscribers
    webSocketService.broadcastElementUpdate(element);
    webSocketService.broadcastLocators(locators);
}
```

### 2. **⚡ Real-Time Update Flow**

```
User hovers element on target site
        ↓
CDP captures mouse event
        ↓
Extract element information
        ↓
Generate locators with scoring
        ↓
Send via WebSocket to dashboard
        ↓
Update UI in real-time (HTMX)
        ↓
User clicks copy button
        ↓
Locator copied to clipboard
```

---

## 🚀 API Endpoints

### 1. **🔗 Connection Management**

```java
@RestController
@RequestMapping("/api")
public class ConnectionController {
    
    @PostMapping("/connect")
    public ResponseEntity<ConnectionStatus> connect(@RequestParam String targetUrl) {
        ConnectionStatus status = cdpService.connectToUrl(targetUrl);
        return ResponseEntity.ok(status);
    }
    
    @GetMapping("/status")
    public ResponseEntity<ConnectionStatus> getStatus() {
        return ResponseEntity.ok(cdpService.getConnectionStatus());
    }
    
    @PostMapping("/disconnect")
    public ResponseEntity<Void> disconnect() {
        cdpService.disconnect();
        return ResponseEntity.ok().build();
    }
}
```

### 2. **🎯 Locator Generation**

```java
@RestController
@RequestMapping("/api/locators")
public class LocatorController {
    
    @PostMapping("/generate")
    public ResponseEntity<List<LocatorResult>> generateLocators(@RequestBody ElementInfo element) {
        List<LocatorResult> locators = locatorService.generateLocators(element);
        return ResponseEntity.ok(locators);
    }
    
    @GetMapping("/current")
    public ResponseEntity<List<LocatorResult>> getCurrentLocators() {
        return ResponseEntity.ok(locatorService.getCurrentLocators());
    }
}
```

### 3. **📡 WebSocket Endpoints**

```java
@Controller
public class WebSocketController {
    
    @MessageMapping("/element")
    @SendTo("/topic/elements")
    public WebSocketMessage handleElementMessage(WebSocketMessage message) {
        // Process element message
        return message;
    }
    
    @MessageMapping("/locator")
    @SendTo("/topic/locators") 
    public WebSocketMessage handleLocatorMessage(WebSocketMessage message) {
        // Process locator message
        return message;
    }
}
```

---

## 🎯 Configuration Files

### 1. **📄 application.yml**

```yaml
server:
  port: 8080
  servlet:
    context-path: /smart-locator

spring:
  application:
    name: smart-locator-inspector
  thymeleaf:
    cache: false
    prefix: classpath:/templates/
    suffix: .html
  web:
    resources:
      static-locations: classpath:/static/

chrome:
  binary-path: "C:/Program Files/Google/Chrome/Application/chrome.exe"
  headless: false
  remote-debugging-port: 9222
  user-data-dir: "./chrome-data"

websocket:
  allowed-origins: "*"
  endpoint: "/ws"

locator:
  max-results: 10
  scoring:
    id-weight: 30
    uniqueness-weight: 25
    framework-weight: 20
    accessibility-weight: 15
    simplicity-weight: 10

logging:
  level:
    com.smartlocator: DEBUG
    org.springframework.web.socket: DEBUG
```

### 2. **🔧 WebSocket Configuration**

```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }
    
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }
}
```

---

## 🧪 Testing Strategy

### 1. **🔧 Unit Tests**

```java
@SpringBootTest
class LocatorServiceTest {
    
    @Autowired
    private LocatorService locatorService;
    
    @Test
    void shouldGenerateIdLocator() {
        ElementInfo element = createElementWithId("login-btn");
        List<LocatorResult> locators = locatorService.generateLocators(element);
        
        Optional<LocatorResult> idLocator = locators.stream()
            .filter(l -> l.getStrategy().equals("ID"))
            .findFirst();
            
        assertTrue(idLocator.isPresent());
        assertEquals("#login-btn", idLocator.get().getLocator());
        assertTrue(idLocator.get().getScore() >= 95);
    }
}
```

### 2. **🌐 Integration Tests**

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class DashboardIntegrationTest {
    
    @Autowired
    private TestRestTemplate restTemplate;
    
    @Test
    void shouldLoadDashboard() {
        ResponseEntity<String> response = restTemplate.getForEntity("/dashboard", String.class);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().contains("Smart Locator Inspector"));
    }
}
```

---

## 📋 Implementation Checklist

### **Phase 1: Core Infrastructure** ⏱️ 2-3 weeks

- [ ] **Spring Boot Project Setup**
  - [ ] Create Maven/Gradle project
  - [ ] Configure dependencies
  - [ ] Set up basic project structure
  
- [ ] **Chrome CDP Integration** 
  - [ ] Implement CDPService with chrome-devtools-java
  - [ ] Test browser connection and navigation
  - [ ] Implement basic element detection

- [ ] **WebSocket Foundation**
  - [ ] Configure Spring WebSocket
  - [ ] Create basic message handling
  - [ ] Test real-time communication

### **Phase 2: Locator Engine** ⏱️ 2-3 weeks

- [ ] **Port Locator Generation Logic**
  - [ ] Convert JavaScript XPath generators to Java
  - [ ] Implement CSS selector generation
  - [ ] Create scoring algorithm
  - [ ] Add framework detection

- [ ] **Element Analysis Service**
  - [ ] DOM parsing and analysis
  - [ ] Attribute extraction
  - [ ] Hierarchy generation

### **Phase 3: Frontend Development** ⏱️ 1-2 weeks

- [ ] **Thymeleaf Templates**
  - [ ] Create dashboard layout
  - [ ] Implement real-time update fragments
  - [ ] Add responsive design

- [ ] **JavaScript Integration**
  - [ ] WebSocket client implementation
  - [ ] Copy to clipboard functionality
  - [ ] HTMX integration for real-time updates

### **Phase 4: Testing & Polish** ⏱️ 1-2 weeks

- [ ] **Testing Implementation**
  - [ ] Unit tests for all services
  - [ ] Integration tests for WebSocket
  - [ ] End-to-end testing with real websites

- [ ] **Performance Optimization**
  - [ ] Optimize real-time updates
  - [ ] Add connection pooling
  - [ ] Implement caching where appropriate

### **Phase 5: Deployment** ⏱️ 1 week

- [ ] **Production Configuration**
  - [ ] Security configuration
  - [ ] Production profiles
  - [ ] Docker containerization

- [ ] **Documentation**
  - [ ] API documentation
  - [ ] User manual
  - [ ] Deployment guide

---

## 🎯 Success Criteria

### **Functional Requirements**
- ✅ Real-time element detection with < 100ms latency
- ✅ Generate 8+ locator strategies per element
- ✅ Reliability scoring with 0-100 scale
- ✅ One-click copy to clipboard functionality
- ✅ Framework detection (Angular, React, Vue)
- ✅ Table-specific XPath generation
- ✅ WebSocket real-time updates

### **Technical Requirements**
- ✅ Spring Boot application with embedded server
- ✅ Thymeleaf templates with responsive design
- ✅ Chrome CDP integration for browser control
- ✅ WebSocket for real-time communication
- ✅ RESTful API for connection management
- ✅ Comprehensive test coverage (80%+)

### **User Experience Requirements**
- ✅ Intuitive dashboard interface
- ✅ Instant visual feedback
- ✅ Mobile-responsive design
- ✅ Professional appearance
- ✅ Minimal learning curve

---

## 🚀 Getting Started

### **Prerequisites**
- Java 17 or higher
- Maven 3.6+ or Gradle 7+
- Google Chrome browser
- IDE (IntelliJ IDEA, Eclipse, VS Code)

### **Quick Setup**
```bash
# 1. Create Spring Boot project
curl https://start.spring.io/starter.zip \
  -d dependencies=web,thymeleaf,websocket \
  -d type=maven-project \
  -d language=java \
  -d bootVersion=3.1.5 \
  -d groupId=com.smartlocator \
  -d artifactId=smart-locator-inspector \
  -o smart-locator-inspector.zip

# 2. Extract and setup
unzip smart-locator-inspector.zip
cd smart-locator-inspector

# 3. Add additional dependencies to pom.xml
# (Chrome CDP, JSoup, etc.)

# 4. Run application
mvn spring-boot:run

# 5. Access dashboard
# http://localhost:8080/dashboard
```

This comprehensive requirements document provides everything needed to build a Spring Boot + Thymeleaf version of the Smart Locator Inspector with real-time web dashboard capabilities!

---

*Ready to revolutionize web element inspection with a modern web application!* 🚀