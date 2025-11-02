package com.automation.utils;

import com.automation.core.ConfigManager;
import io.qameta.allure.Allure;
import io.qameta.allure.model.Status;

import java.io.FileWriter;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * ReportUtil - Utility class for report generation and management
 * Provides methods for creating custom reports and managing Allure reports
 */
public class ReportUtil {
    
    private static final String REPORTS_DIR = "target/reports";
    private static final String DATE_FORMAT = "yyyy-MM-dd_HH-mm-ss";
    
    private ReportUtil() {
        // Private constructor to hide implicit public one
    }
    
    /**
     * Add environment information to Allure report
     */
    public static void addEnvironmentInfo() {
        try {
            Map<String, String> envInfo = new HashMap<>();
            ConfigManager config = ConfigManager.getInstance();
            
            envInfo.put("Browser", config.getBrowser());
            envInfo.put("Headless Mode", String.valueOf(config.isHeadless()));
            envInfo.put("Base URL", config.getBaseUrl());
            envInfo.put("Environment", config.getEnvironment());
            envInfo.put("Explicit Wait", config.getExplicitWait() + " seconds");
            envInfo.put("Retry Count", String.valueOf(config.getRetryCount()));
            envInfo.put("Parallel Execution", String.valueOf(config.isParallelExecution()));
            envInfo.put("Thread Count", String.valueOf(config.getThreadCount()));
            envInfo.put("Framework", "Selenium Java TestNG");
            envInfo.put("Java Version", System.getProperty("java.version"));
            envInfo.put("OS", System.getProperty("os.name"));
            envInfo.put("Test Execution Time", new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()));
            
            // Write environment.properties file for Allure
            writeEnvironmentProperties(envInfo);
            
            LoggerUtil.info("Environment information added to Allure report");
            
        } catch (Exception e) {
            LoggerUtil.error("Failed to add environment info to Allure: " + e.getMessage(), e);
        }
    }
    
    /**
     * Write environment properties file for Allure
     * @param envInfo Environment information map
     */
    private static void writeEnvironmentProperties(Map<String, String> envInfo) {
        try {
            String allureResultsDir = "target/allure-results";
            java.io.File dir = new java.io.File(allureResultsDir);
            if (!dir.exists()) {
                dir.mkdirs();
            }
            
            String envFilePath = allureResultsDir + "/environment.properties";
            try (FileWriter writer = new FileWriter(envFilePath)) {
                for (Map.Entry<String, String> entry : envInfo.entrySet()) {
                    writer.write(entry.getKey() + "=" + entry.getValue() + "\n");
                }
            }
            
            LoggerUtil.info("Environment properties written to: " + envFilePath);
            
        } catch (IOException e) {
            LoggerUtil.error("Failed to write environment properties: " + e.getMessage(), e);
        }
    }
    
    /**
     * Add custom log entry to Allure report
     * @param message Log message
     * @param status Log status
     */
    public static void addLogToAllure(String message, Status status) {
        try {
            String formattedMessage = "[" + new SimpleDateFormat("HH:mm:ss").format(new Date()) + "] " + message;
            
            switch (status) {
                case PASSED:
                    Allure.step(formattedMessage);
                    break;
                case FAILED:
                    Allure.step(formattedMessage);
                    break;
                case SKIPPED:
                    Allure.step(formattedMessage);
                    break;
                default:
                    Allure.step(formattedMessage);
            }
            
        } catch (Exception e) {
            LoggerUtil.error("Failed to add log to Allure: " + e.getMessage(), e);
        }
    }
    
    /**
     * Attach text content to Allure report
     * @param name Attachment name
     * @param content Text content
     */
    public static void attachTextToAllure(String name, String content) {
        try {
            Allure.addAttachment(name, "text/plain", content, "txt");
            LoggerUtil.info("Text attachment added to Allure: " + name);
        } catch (Exception e) {
            LoggerUtil.error("Failed to attach text to Allure: " + e.getMessage(), e);
        }
    }
    
    /**
     * Attach JSON content to Allure report
     * @param name Attachment name
     * @param jsonContent JSON content
     */
    public static void attachJsonToAllure(String name, String jsonContent) {
        try {
            Allure.addAttachment(name, "application/json", jsonContent, "json");
            LoggerUtil.info("JSON attachment added to Allure: " + name);
        } catch (Exception e) {
            LoggerUtil.error("Failed to attach JSON to Allure: " + e.getMessage(), e);
        }
    }
    
    /**
     * Create a simple HTML report with test results
     * @param testResults Map of test names and their results
     * @param reportName Name of the report file
     */
    public static void createSimpleHtmlReport(Map<String, String> testResults, String reportName) {
        try {
            java.io.File reportsDir = new java.io.File(REPORTS_DIR);
            if (!reportsDir.exists()) {
                reportsDir.mkdirs();
            }
            
            String timestamp = new SimpleDateFormat(DATE_FORMAT).format(new Date());
            String reportPath = REPORTS_DIR + java.io.File.separator + reportName + "_" + timestamp + ".html";
            
            StringBuilder html = new StringBuilder();
            html.append("<!DOCTYPE html>\n");
            html.append("<html>\n<head>\n");
            html.append("<title>").append(reportName).append(" - Test Results</title>\n");
            html.append("<style>\n");
            html.append("body { font-family: Arial, sans-serif; margin: 40px; }\n");
            html.append("table { border-collapse: collapse; width: 100%; }\n");
            html.append("th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }\n");
            html.append("th { background-color: #f2f2f2; }\n");
            html.append(".pass { color: green; font-weight: bold; }\n");
            html.append(".fail { color: red; font-weight: bold; }\n");
            html.append(".skip { color: orange; font-weight: bold; }\n");
            html.append("</style>\n");
            html.append("</head>\n<body>\n");
            html.append("<h1>").append(reportName).append(" - Test Results</h1>\n");
            html.append("<p>Generated on: ").append(new Date().toString()).append("</p>\n");
            html.append("<table>\n");
            html.append("<tr><th>Test Name</th><th>Result</th></tr>\n");
            
            for (Map.Entry<String, String> entry : testResults.entrySet()) {
                String cssClass = determineTestResultCssClass(entry.getValue());
                html.append("<tr><td>").append(entry.getKey()).append("</td>");
                html.append("<td class=\"").append(cssClass).append("\">").append(entry.getValue()).append("</td></tr>\n");
            }
            
            html.append("</table>\n");
            html.append("</body>\n</html>");
            
            try (FileWriter writer = new FileWriter(reportPath)) {
                writer.write(html.toString());
            }
            
            LoggerUtil.info("HTML report created: " + reportPath);
            
        } catch (IOException e) {
            LoggerUtil.error("Failed to create HTML report: " + e.getMessage(), e);
        }
    }
    
    /**
     * Generate test execution summary
     * @param totalTests Total number of tests
     * @param passedTests Number of passed tests
     * @param failedTests Number of failed tests
     * @param skippedTests Number of skipped tests
     * @return Formatted summary string
     */
    public static String generateTestSummary(int totalTests, int passedTests, int failedTests, int skippedTests) {
        StringBuilder summary = new StringBuilder();
        summary.append("=== TEST EXECUTION SUMMARY ===\n");
        summary.append("Total Tests: ").append(totalTests).append("\n");
        summary.append("Passed: ").append(passedTests).append("\n");
        summary.append("Failed: ").append(failedTests).append("\n");
        summary.append("Skipped: ").append(skippedTests).append("\n");
        summary.append("Pass Rate: ").append(String.format("%.2f", (passedTests * 100.0 / totalTests))).append("%\n");
        summary.append("==============================");
        
        return summary.toString();
    }
    
    /**
     * Clean up old report files
     * @param daysToKeep Number of days to keep reports
     */
    public static void cleanupOldReports(int daysToKeep) {
        try {
            java.io.File reportsDir = new java.io.File(REPORTS_DIR);
            if (!reportsDir.exists()) {
                return;
            }
            
            long cutoffTime = System.currentTimeMillis() - (daysToKeep * 24L * 60L * 60L * 1000L);
            java.io.File[] files = reportsDir.listFiles();
            
            if (files != null) {
                int deletedCount = 0;
                for (java.io.File file : files) {
                    if (file.isFile() && file.lastModified() < cutoffTime && deleteReportFile(file)) {
                        deletedCount++;
                    }
                }
                LoggerUtil.info("Cleaned up " + deletedCount + " old report files");
            }
        } catch (Exception e) {
            LoggerUtil.error("Failed to cleanup old reports: " + e.getMessage(), e);
        }
    }
    
    /**
     * Determine CSS class based on test result value
     * @param resultValue Test result value
     * @return CSS class name
     */
    private static String determineTestResultCssClass(String resultValue) {
        String lowerValue = resultValue.toLowerCase();
        if (lowerValue.contains("pass")) {
            return "pass";
        } else if (lowerValue.contains("fail")) {
            return "fail";
        } else {
            return "skip";
        }
    }
    
    /**
     * Delete a single report file safely
     * @param file File to delete
     * @return true if deletion was successful
     */
    private static boolean deleteReportFile(java.io.File file) {
        try {
            java.nio.file.Files.delete(file.toPath());
            return true;
        } catch (IOException e) {
            LoggerUtil.warn("Failed to delete old report file: " + file.getName());
            return false;
        }
    }
}