package com.automation.utils;

import com.automation.exceptions.RetryException;
import org.openqa.selenium.StaleElementReferenceException;
import org.openqa.selenium.ElementClickInterceptedException;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriverException;

import java.util.function.Supplier;

/**
 * RetryUtil - Utility class for central retry logic
 */
public class RetryUtil {

    private RetryUtil() {}

    public static <T> T executeWithRetry(Supplier<T> action, String elementName, String actionName, int maxRetries) {
        Exception lastException = null;

        for (int attempt = 1; attempt <= maxRetries + 1; attempt++) {
            try {
                if (attempt > 1) {
                    LoggerUtil.logRetryAttempt(elementName, actionName, attempt - 1, maxRetries);
                    Thread.sleep(500);
                }

                return action.get();

            } catch (WebDriverException e) {
                lastException = e;
                if (!handleRetryAttempt(elementName, actionName, attempt, maxRetries, e)) {
                    break;
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new RetryException("Retry interrupted", e);
            }
        }

        throw new RetryException(String.format("Failed to execute '%s' on element '%s' after %d retries", actionName, elementName, maxRetries), lastException);
    }

    private static boolean handleRetryAttempt(String elementName, String actionName, int attempt, int maxRetries, Exception e) {
        if (attempt <= maxRetries) {
            LoggerUtil.warn(String.format("Attempt %d failed for action '%s' on element '%s': %s", attempt, actionName, elementName, e.getMessage()));
            return true;
        } else {
            LoggerUtil.logActionFailure(elementName, actionName, e);
            return false;
        }
    }

    public static void executeWithRetry(Runnable action, String elementName, String actionName, int maxRetries) {
        executeWithRetry(() -> { action.run(); return null; }, elementName, actionName, maxRetries);
    }

    public static <T> T executeWithRetry(Supplier<T> action, String elementName, String actionName) {
        int retryCount = com.automation.core.ConfigManager.getInstance().getRetryCount();
        return executeWithRetry(action, elementName, actionName, retryCount);
    }

    public static void executeWithRetry(Runnable action, String elementName, String actionName) {
        int retryCount = com.automation.core.ConfigManager.getInstance().getRetryCount();
        executeWithRetry(action, elementName, actionName, retryCount);
    }

    public static boolean isRetryableException(Exception exception) {
        return exception instanceof StaleElementReferenceException ||
               exception instanceof ElementClickInterceptedException ||
               exception instanceof NoSuchElementException ||
               exception instanceof TimeoutException ||
               exception instanceof WebDriverException;
    }
}
