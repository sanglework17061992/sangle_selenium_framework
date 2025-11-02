package com.automation.utils;

import org.apache.commons.io.FileUtils;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;
import io.qameta.allure.Allure;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.text.SimpleDateFormat;
import java.util.Date;

/**
 * ScreenshotUtil - Utility class for taking and managing screenshots
 * Provides methods for capturing screenshots and attaching them to reports
 */
public class ScreenshotUtil {
    
    private static final String SCREENSHOT_DIR = "target/screenshots";
    private static final String DATE_FORMAT = "yyyy-MM-dd_HH-mm-ss";
    
    private ScreenshotUtil() {
        // Private constructor to hide implicit public one
    }
    
    /**
     * Take screenshot and save to file
     * @param driver WebDriver instance
     * @param fileName File name for screenshot
     * @return Path to saved screenshot file
     */
    public static String takeScreenshot(WebDriver driver, String fileName) {
        try {
            // Create screenshot directory if it doesn't exist
            File screenshotDir = new File(SCREENSHOT_DIR);
            if (!screenshotDir.exists()) {
                screenshotDir.mkdirs();
            }
            
            // Take screenshot
            TakesScreenshot takesScreenshot = (TakesScreenshot) driver;
            File sourceFile = takesScreenshot.getScreenshotAs(OutputType.FILE);
            
            // Generate file path with timestamp
            String timestamp = new SimpleDateFormat(DATE_FORMAT).format(new Date());
            String filePath = SCREENSHOT_DIR + File.separator + fileName + "_" + timestamp + ".png";
            File destFile = new File(filePath);
            
            // Copy file
            FileUtils.copyFile(sourceFile, destFile);
            
            LoggerUtil.info("Screenshot saved: " + filePath);
            return filePath;
            
        } catch (IOException e) {
            LoggerUtil.error("Failed to take screenshot: " + e.getMessage(), e);
            return null;
        }
    }
    
    /**
     * Take screenshot with auto-generated filename
     * @param driver WebDriver instance
     * @return Path to saved screenshot file
     */
    public static String takeScreenshot(WebDriver driver) {
        String timestamp = new SimpleDateFormat(DATE_FORMAT).format(new Date());
        return takeScreenshot(driver, "screenshot_" + timestamp);
    }
    
    /**
     * Take screenshot and return as byte array
     * @param driver WebDriver instance
     * @return Screenshot as byte array
     */
    public static byte[] takeScreenshotAsBytes(WebDriver driver) {
        try {
            TakesScreenshot takesScreenshot = (TakesScreenshot) driver;
            return takesScreenshot.getScreenshotAs(OutputType.BYTES);
        } catch (Exception e) {
            LoggerUtil.error("Failed to take screenshot as bytes: " + e.getMessage(), e);
            return new byte[0];
        }
    }
    
    /**
     * Take screenshot and attach to Allure report
     * @param driver WebDriver instance
     * @param screenshotName Name for the screenshot in report
     */
    public static void takeScreenshotForAllure(WebDriver driver, String screenshotName) {
        try {
            byte[] screenshot = takeScreenshotAsBytes(driver);
            if (screenshot.length > 0) {
                Allure.addAttachment(screenshotName, "image/png", 
                                   new ByteArrayInputStream(screenshot), "png");
                LoggerUtil.info("Screenshot attached to Allure report: " + screenshotName);
            }
        } catch (Exception e) {
            LoggerUtil.error("Failed to attach screenshot to Allure: " + e.getMessage(), e);
        }
    }
    
    /**
     * Take screenshot on test failure and attach to Allure
     * @param driver WebDriver instance
     * @param testName Name of the failed test
     */
    public static void takeScreenshotOnFailure(WebDriver driver, String testName) {
        String screenshotName = testName + "_failure_screenshot";
        takeScreenshotForAllure(driver, screenshotName);
        
        // Also save to file
        takeScreenshot(driver, testName + "_failure");
    }
    
    /**
     * Take screenshot and save with custom directory
     * @param driver WebDriver instance
     * @param fileName File name for screenshot
     * @param directory Custom directory path
     * @return Path to saved screenshot file
     */
    public static String takeScreenshot(WebDriver driver, String fileName, String directory) {
        try {
            // Create custom directory if it doesn't exist
            File customDir = new File(directory);
            if (!customDir.exists()) {
                customDir.mkdirs();
            }
            
            // Take screenshot
            TakesScreenshot takesScreenshot = (TakesScreenshot) driver;
            File sourceFile = takesScreenshot.getScreenshotAs(OutputType.FILE);
            
            // Generate file path with timestamp
            String timestamp = new SimpleDateFormat(DATE_FORMAT).format(new Date());
            String filePath = directory + File.separator + fileName + "_" + timestamp + ".png";
            File destFile = new File(filePath);
            
            // Copy file
            FileUtils.copyFile(sourceFile, destFile);
            
            LoggerUtil.info("Screenshot saved to custom directory: " + filePath);
            return filePath;
            
        } catch (IOException e) {
            LoggerUtil.error("Failed to take screenshot to custom directory: " + e.getMessage(), e);
            return null;
        }
    }
    
    /**
     * Clean up old screenshots (keep only recent ones)
     * @param daysToKeep Number of days of screenshots to keep
     */
    public static void cleanupOldScreenshots(int daysToKeep) {
        try {
            File screenshotDir = new File(SCREENSHOT_DIR);
            if (!screenshotDir.exists()) {
                return;
            }
            
            long cutoffTime = System.currentTimeMillis() - (daysToKeep * 24L * 60L * 60L * 1000L);
            File[] files = screenshotDir.listFiles();
            
            if (files != null) {
                int deletedCount = 0;
                for (File file : files) {
                    if (file.isFile() && file.getName().endsWith(".png") && 
                        file.lastModified() < cutoffTime && deleteScreenshotFile(file)) {
                        deletedCount++;
                    }
                }
                LoggerUtil.info("Cleaned up " + deletedCount + " old screenshots");
            }
        } catch (Exception e) {
            LoggerUtil.error("Failed to cleanup old screenshots: " + e.getMessage(), e);
        }
    }
    
    /**
     * Delete a single screenshot file safely
     * @param file File to delete
     * @return true if deletion was successful
     */
    private static boolean deleteScreenshotFile(File file) {
        try {
            Files.delete(file.toPath());
            return true;
        } catch (IOException e) {
            LoggerUtil.debug("Failed to delete old screenshot: " + file.getName());
            return false;
        }
    }
    
    /**
     * Get screenshot directory path
     * @return Screenshot directory path
     */
    public static String getScreenshotDirectory() {
        return SCREENSHOT_DIR;
    }
}