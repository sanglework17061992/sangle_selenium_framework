package com.automation.utils;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import io.qameta.allure.Allure;

/**
 * LoggerUtil - Utility class for logging with Allure integration
 * Note: wait logs are intentionally NOT added as Allure steps to reduce noise in reports
 */
public class LoggerUtil {
    private static final Logger logger = LogManager.getLogger(LoggerUtil.class);

    private LoggerUtil() {
        // Private constructor to prevent instantiation
    }

    public static void logActionStart(String elementName, String action) {
        String message = String.format("Starting action: %s on element [%s]", action, elementName);
        logger.info(message);
        Allure.step(message);
    }

    public static void logActionSuccess(String elementName, String action, long duration) {
        String message = String.format("Successfully completed: %s on element [%s] in %d ms", action, elementName, duration);
        logger.info(message);
        Allure.step(message);
    }

    public static void logActionFailure(String elementName, String action, Throwable error) {
        String message = String.format("Failed to perform: %s on element [%s]. Error: %s", action, elementName, error.getMessage());
        logger.error(message, error);
        Allure.step(message);
    }

    public static void logRetryAttempt(String elementName, String action, int attempt, int maxAttempts) {
        String message = String.format("Retry attempt %d/%d for action: %s on element [%s]", attempt, maxAttempts, action, elementName);
        logger.warn(message);
        Allure.step(message);
    }

    /**
     * Log wait messages only to logs (no Allure steps) to reduce noise in reports
     */
    public static void logWait(String elementName, String waitCondition, int timeout) {
        String message = String.format("Waiting for %s on element [%s] with timeout %d seconds", waitCondition, elementName, timeout);
        logger.info(message);
        // Intentionally not adding Allure.step here to avoid cluttering Allure reports with low-level wait details
    }

    public static void logTestStart(String testName) {
        String message = String.format("Starting test: %s", testName);
        if (logger.isInfoEnabled()) {
            logger.info("=".repeat(80));
            logger.info(message);
            logger.info("=".repeat(80));
        }
        Allure.step(message);
    }

    public static void logTestEnd(String testName, String status, long duration) {
        String message = String.format("Test completed: %s - Status: %s - Duration: %d ms", testName, status, duration);
        logger.info(message);
        if (logger.isInfoEnabled()) {
            logger.info("=".repeat(80));
        }
        Allure.step(message);
    }

    public static void logPageNavigation(String pageName, String url) {
        String message = String.format("Navigating to page: %s at URL: %s", pageName, url);
        logger.info(message);
        Allure.step(message);
    }

    public static void logPageValidation(String pageName, boolean isValid) {
        String message = String.format("Page validation for %s: %s", pageName, isValid ? "PASSED" : "FAILED");
        if (isValid) logger.info(message); else logger.error(message);
        Allure.step(message);
    }

    public static void info(String message) {
        logger.info(message);
        Allure.step(message);
    }

    public static void warn(String message) {
        logger.warn(message);
        Allure.step(message);
    }

    public static void error(String message, Throwable throwable) {
        logger.error(message, throwable);
        Allure.step(message);
    }

    public static void debug(String message) {
        logger.debug(message);
    }
}
