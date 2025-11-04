```mermaid
classDiagram
    %% Configuration Layer
    class ConfigLoader {
        +config: FrameworkConfig
        +getInstance(): ConfigLoader
        +getConfig(): FrameworkConfig
        +getBrowserConfig(): BrowserConfig
        +getTimeoutConfig(): TimeoutConfig
        +getTestConfig(): TestConfig
        +getAppConfig(): AppConfig
        +reload(): void
        +printConfig(): void
    }

    %% Driver Layer
    class DriverManager {
        -factories: Map~string, BrowserFactory~
        +register(name: string, factory: BrowserFactory): void
        +getDriver(name?: BrowserName, options?: any): Promise~WebDriver~
        +getConfiguredDriver(): Promise~WebDriver~
    }

    class BrowserFactory {
        <<interface>>
        +build(options?: any): Promise~WebDriver~
    }

    class DefaultChromeFactory {
        +build(options?: any): Promise~WebDriver~
    }

    class DefaultFirefoxFactory {
        +build(options?: any): Promise~WebDriver~
    }

    %% Core Layer
    class SanElement {
        -driver: ThenableWebDriver
        -locator: Locator
        -defaultTimeout: number
        +constructor(driver: ThenableWebDriver, locator: Locator, defaultTimeout?: number)
        +click(timeout?: number): Promise~void~
        +type(text: string, timeout?: number): Promise~void~
        +getText(timeout?: number): Promise~string~
        +getAttribute(name: string, timeout?: number): Promise~string|null~
        +isDisplayed(timeout?: number): Promise~boolean~
        +raw(timeout?: number): Promise~WebElement~
    }

    %% Assertion Layer
    class ElementAssertions {
        -element: SanElement
        -timeout: number
        +constructor(element: SanElement, timeout?: number)
        +toHaveText(expectedText: string): Promise~void~
        +toContainText(expectedSubstring: string): Promise~void~
        +toHaveAttribute(attributeName: string, expectedValue: string): Promise~void~
        +toHaveAttributeContaining(attributeName: string, expectedSubstring: string): Promise~void~
        +toBeVisible(): Promise~void~
        +toBeHidden(): Promise~void~
        +toBeEnabled(): Promise~void~
        +toBeDisabled(): Promise~void~
        +toHaveClass(className: string): Promise~void~
        +toHaveValue(expectedValue: string): Promise~void~
        +toHaveValueContaining(expectedSubstring: string): Promise~void~
    }

    %% Page Object Layer
    class BasePage {
        +driver: ThenableWebDriver
        +constructor(driver: ThenableWebDriver)
        +$(locator: Locator): SanElement
    }

    class ExamplePage {
        +title: SanElement
        +moreInfo: SanElement
        +constructor(driver: ThenableWebDriver)
        +open(): Promise~void~
    }

    %% Relationships
    ConfigLoader --> DriverManager : uses
    ConfigLoader --> SanElement : uses
    ConfigLoader --> ElementAssertions : uses

    DriverManager --> BrowserFactory : manages
    BrowserFactory <|.. DefaultChromeFactory : implements
    BrowserFactory <|.. DefaultFirefoxFactory : implements

    SanElement --> ElementAssertions : wrapped by

    BasePage <|-- ExamplePage : extends
    BasePage --> SanElement : creates

    %% Usage relationships
    ExamplePage ..> ElementAssertions : uses in tests
    ExamplePage ..> DriverManager : uses for navigation

    %% Configuration interfaces
    class BrowserConfig {
        +name: string
        +headless: boolean
        +noSandbox: boolean
        +args: string[]
    }

    class TimeoutConfig {
        +default: number
        +element: number
        +pageLoad: number
    }

    class TestConfig {
        +environment: string
        +retryCount: number
        +retryInterval: number
        +parallel: boolean
        +threadCount: number
    }

    class AppConfig {
        +baseUrl: string
        +loginUrl: string
        +productsUrl: string
        +username: string
        +password: string
    }

    class FrameworkConfig {
        +browser: BrowserConfig
        +timeouts: TimeoutConfig
        +test: TestConfig
        +logging: LoggingConfig
        +reporting: ReportingConfig
        +app: AppConfig
    }

    ConfigLoader --> BrowserConfig : contains
    ConfigLoader --> TimeoutConfig : contains
    ConfigLoader --> TestConfig : contains
    ConfigLoader --> AppConfig : contains
    ConfigLoader --> FrameworkConfig : contains
```</content>
<parameter name="filePath">/home/sangle/Documents/sangle_selenium_framework/CLASS_DIAGRAM.md