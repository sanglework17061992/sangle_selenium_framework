package com.automation.utils;

import com.automation.constants.DriverConstants;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.ExpectedCondition;

import java.time.Duration;

/**
 * WaitUtil - Utility class for smart waiting logic
 */
public class WaitUtil {
    private final WebDriverWait wait;
    private final WebDriver driver;
    private final int timeoutInSeconds;

    public WaitUtil(WebDriver driver, int timeoutInSeconds) {
        this.driver = driver;
        this.timeoutInSeconds = timeoutInSeconds;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(timeoutInSeconds));
    }

    public WebElement waitForVisibility(By locator, String elementName) {
        LoggerUtil.logWait(elementName, DriverConstants.VISIBILITY, timeoutInSeconds);
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(locator));
        } catch (Exception e) {
            LoggerUtil.logActionFailure(elementName, DriverConstants.WAIT_FOR_VISIBILITY, e);
            throw e;
        }
    }

    public WebElement waitForVisibility(WebElement element, String elementName) {
        LoggerUtil.logWait(elementName, DriverConstants.VISIBILITY, timeoutInSeconds);
        try {
            return wait.until(ExpectedConditions.visibilityOf(element));
        } catch (Exception e) {
            LoggerUtil.logActionFailure(elementName, DriverConstants.WAIT_FOR_VISIBILITY, e);
            throw e;
        }
    }

    public WebElement waitForClickability(By locator, String elementName) {
        LoggerUtil.logWait(elementName, DriverConstants.CLICKABILITY, timeoutInSeconds);
        try {
            return wait.until(ExpectedConditions.elementToBeClickable(locator));
        } catch (Exception e) {
            LoggerUtil.logActionFailure(elementName, DriverConstants.WAIT_FOR_CLICKABILITY, e);
            throw e;
        }
    }

    public WebElement waitForClickability(WebElement element, String elementName) {
        LoggerUtil.logWait(elementName, DriverConstants.CLICKABILITY, timeoutInSeconds);
        try {
            return wait.until(ExpectedConditions.elementToBeClickable(element));
        } catch (Exception e) {
            LoggerUtil.logActionFailure(elementName, DriverConstants.WAIT_FOR_CLICKABILITY, e);
            throw e;
        }
    }

    public WebElement waitForPresence(By locator, String elementName) {
        LoggerUtil.logWait(elementName, DriverConstants.PRESENCE, timeoutInSeconds);
        try {
            return wait.until(ExpectedConditions.presenceOfElementLocated(locator));
        } catch (Exception e) {
            LoggerUtil.logActionFailure(elementName, "wait for presence", e);
            throw e;
        }
    }

    public boolean waitForInvisibility(By locator, String elementName) {
        LoggerUtil.logWait(elementName, DriverConstants.INVISIBILITY, timeoutInSeconds);
        try {
            return wait.until(ExpectedConditions.invisibilityOfElementLocated(locator));
        } catch (Exception e) {
            LoggerUtil.logActionFailure(elementName, "wait for invisibility", e);
            throw e;
        }
    }

    public boolean waitForTextPresent(By locator, String text, String elementName) {
        LoggerUtil.logWait(elementName, "text '" + text + "' to be present", timeoutInSeconds);
        try {
            return wait.until(ExpectedConditions.textToBePresentInElementLocated(locator, text));
        } catch (Exception e) {
            LoggerUtil.logActionFailure(elementName, "wait for text present", e);
            throw e;
        }
    }

    public boolean waitForAttribute(By locator, String attribute, String value, String elementName) {
        LoggerUtil.logWait(elementName, "attribute '" + attribute + "' to have value '" + value + "'", timeoutInSeconds);
        try {
            return wait.until(ExpectedConditions.attributeToBe(locator, attribute, value));
        } catch (Exception e) {
            LoggerUtil.logActionFailure(elementName, "wait for attribute", e);
            throw e;
        }
    }

    public boolean waitForTitle(String title) {
        LoggerUtil.logWait("Page", "title to be '" + title + "'", timeoutInSeconds);
        try {
            return wait.until(ExpectedConditions.titleIs(title));
        } catch (Exception e) {
            LoggerUtil.logActionFailure("Page", "wait for title", e);
            throw e;
        }
    }

    public boolean waitForTitleContains(String titleText) {
        LoggerUtil.logWait("Page", "title to contain '" + titleText + "'", timeoutInSeconds);
        try {
            return wait.until(ExpectedConditions.titleContains(titleText));
        } catch (Exception e) {
            LoggerUtil.logActionFailure("Page", "wait for title contains", e);
            throw e;
        }
    }

    public boolean waitForUrl(String url) {
        LoggerUtil.logWait("Page", "URL to be '" + url + "'", timeoutInSeconds);
        try {
            return wait.until(ExpectedConditions.urlToBe(url));
        } catch (Exception e) {
            LoggerUtil.logActionFailure("Page", "wait for URL", e);
            throw e;
        }
    }

    public boolean waitForUrlContains(String urlText) {
        LoggerUtil.logWait("Page", "URL to contain '" + urlText + "'", timeoutInSeconds);
        try {
            return wait.until(ExpectedConditions.urlContains(urlText));
        } catch (Exception e) {
            LoggerUtil.logActionFailure("Page", "wait for URL contains", e);
            throw e;
        }
    }

    public java.util.List<WebElement> waitForAllElementsVisible(By locator, String elementName) {
        LoggerUtil.logWait(elementName + " (all)", "visibility", timeoutInSeconds);
        try {
            return wait.until(ExpectedConditions.visibilityOfAllElementsLocatedBy(locator));
        } catch (Exception e) {
            LoggerUtil.logActionFailure(elementName + " (all)", "wait for visibility", e);
            throw e;
        }
    }

    public <T> T waitForCustomCondition(ExpectedCondition<T> condition, String description) {
        LoggerUtil.logWait("Custom", description, timeoutInSeconds);
        try {
            return wait.until(condition);
        } catch (Exception e) {
            LoggerUtil.logActionFailure("Custom", description, e);
            throw e;
        }
    }

    public WaitUtil withTimeout(int timeoutInSeconds) {
        return new WaitUtil(driver, timeoutInSeconds);
    }
}
