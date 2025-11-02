package com.automation.healing.reporter;

import com.automation.healing.models.HealingEvent;
import com.automation.utils.LoggerUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.qameta.allure.Allure;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

/**
 * AllureHealingReporter - Allure-integrated implementation of HealingReporter
 * Reports healing events to Allure and handles notifications
 */
public class AllureHealingReporter implements HealingReporter {
    
    private static final String HEALING_ATTACHMENT_NAME = "healing-details";
    private static final String SUGGESTION_ATTACHMENT_NAME = "healing-suggestion";
    private static final String FAILURE_ATTACHMENT_NAME = "healing-failure";
    
    private boolean notificationsEnabled = false;
    private String webhookUrl;
    private final ObjectMapper objectMapper;
    
    public AllureHealingReporter() {
        this.objectMapper = new ObjectMapper();
    }
    
    @Override
    public void reportHealing(HealingEvent event) {
        try {
            // Log the healing
            LoggerUtil.info("Healing applied: " + event.getNewLocator() + " (confidence: " + 
                           String.format("%.2f", event.getConfidence()) + ")");
            
            // Add Allure step
            String stepTitle = String.format("🔧 Self-Healing Applied (%.0f%% confidence)", 
                                           event.getConfidence() * 100);
            Allure.step(stepTitle, () -> {
                // Attach healing details to Allure
                attachHealingEventToAllure(event, HEALING_ATTACHMENT_NAME);
                
                // Add parameter information
                Allure.parameter("Original Locator", event.getOldLocator());
                Allure.parameter("Healed Locator", event.getNewLocator());
                Allure.parameter("Confidence", String.format("%.2f", event.getConfidence()));
                Allure.parameter("Execution Time", event.getExecutionTime() + "ms");
            });
            
            // Send notification if enabled
            if (notificationsEnabled) {
                sendNotification(event, "HEALING_SUCCESS");
            }
            
        } catch (Exception e) {
            LoggerUtil.error("Error reporting healing event: " + e.getMessage(), e);
        }
    }
    
    @Override
    public void reportSuggestion(HealingEvent event) {
        try {
            // Log the suggestion
            LoggerUtil.info("Healing suggestion generated: " + event.getNewLocator() + 
                           " (confidence: " + String.format("%.2f", event.getConfidence()) + ")");
            
            // Add Allure step
            String stepTitle = String.format("💡 Healing Suggestion (%.0f%% confidence)", 
                                           event.getConfidence() * 100);
            Allure.step(stepTitle, () -> {
                // Attach suggestion details to Allure
                attachHealingEventToAllure(event, SUGGESTION_ATTACHMENT_NAME);
                
                // Add parameter information
                Allure.parameter("Original Locator", event.getOldLocator());
                Allure.parameter("Suggested Locator", event.getNewLocator());
                Allure.parameter("Confidence", String.format("%.2f", event.getConfidence()));
                Allure.parameter("Review Required", "Yes");
            });
            
            // Send notification if enabled
            if (notificationsEnabled) {
                sendNotification(event, "HEALING_SUGGESTION");
            }
            
        } catch (Exception e) {
            LoggerUtil.error("Error reporting healing suggestion: " + e.getMessage(), e);
        }
    }
    
    @Override
    public void reportFailure(HealingEvent event) {
        try {
            // Log the failure
            LoggerUtil.warn("Healing failed for locator: " + event.getOldLocator() + 
                           " - " + event.getErrorMessage());
            
            // Add Allure step
            Allure.step("❌ Self-Healing Failed", () -> {
                // Attach failure details to Allure
                attachHealingEventToAllure(event, FAILURE_ATTACHMENT_NAME);
                
                // Add parameter information
                Allure.parameter("Failed Locator", event.getOldLocator());
                Allure.parameter("Error", event.getErrorMessage());
                Allure.parameter("Execution Time", event.getExecutionTime() + "ms");
                Allure.parameter("Page URL", event.getPageUrl());
            });
            
            // Send notification if enabled
            if (notificationsEnabled) {
                sendNotification(event, "HEALING_FAILURE");
            }
            
        } catch (Exception e) {
            LoggerUtil.error("Error reporting healing failure: " + e.getMessage(), e);
        }
    }
    
    @Override
    public String generateSummaryReport(List<HealingEvent> events) {
        if (events == null || events.isEmpty()) {
            return "No healing events to report.";
        }
        
        StringBuilder report = new StringBuilder();
        report.append("# Self-Healing Locator Summary Report\n\n");
        
        // Statistics
        long successful = events.stream()
                .filter(e -> "applied".equals(e.getStatus()))
                .count();
        long suggestions = events.stream()
                .filter(e -> "suggested".equals(e.getStatus()))
                .count();
        long failed = events.stream()
                .filter(e -> "failed".equals(e.getStatus()))
                .count();
        
        report.append("## Statistics\n");
        report.append("- Total Events: ").append(events.size()).append("\n");
        report.append("- Successful Healings: ").append(successful).append("\n");
        report.append("- Suggestions Generated: ").append(suggestions).append("\n");
        report.append("- Failed Attempts: ").append(failed).append("\n");
        
        if (events.size() > 0) {
            double successRate = (double) successful / events.size() * 100;
            report.append("- Success Rate: ").append(String.format("%.1f%%", successRate)).append("\n");
        }
        
        // High confidence suggestions
        List<HealingEvent> highConfidenceSuggestions = events.stream()
                .filter(e -> "suggested".equals(e.getStatus()) && e.getConfidence() >= 0.8)
                .collect(Collectors.toList());
        
        if (!highConfidenceSuggestions.isEmpty()) {
            report.append("\n## High Confidence Suggestions for Review\n");
            for (HealingEvent event : highConfidenceSuggestions) {
                report.append("- **").append(event.getEventId()).append("**: ")
                      .append(event.getOldLocator()).append(" → ")
                      .append(event.getNewLocator())
                      .append(" (").append(String.format("%.0f%%", event.getConfidence() * 100)).append(")\n");
            }
        }
        
        return report.toString();
    }
    
    @Override
    public void configureNotifications(boolean enabled, String webhookUrl) {
        this.notificationsEnabled = enabled;
        this.webhookUrl = webhookUrl;
        LoggerUtil.info("Healing notifications " + (enabled ? "enabled" : "disabled"));
    }
    
    // Private helper methods
    private void attachHealingEventToAllure(HealingEvent event, String attachmentName) {
        try {
            String eventJson = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(event);
            Allure.addAttachment(attachmentName, "application/json", eventJson, ".json");
        } catch (IOException e) {
            LoggerUtil.error("Failed to attach healing event to Allure: " + e.getMessage(), e);
        }
    }
    
    private void sendNotification(HealingEvent event, String eventType) {
        if (!notificationsEnabled || webhookUrl == null || webhookUrl.isEmpty()) {
            return;
        }
        
        try {
            // Create notification message
            String message = createNotificationMessage(event, eventType);
            
            // Send to webhook (simplified implementation)
            LoggerUtil.info("Healing notification: " + message);
            // In a real implementation, you would send HTTP POST to webhookUrl
            
        } catch (Exception e) {
            LoggerUtil.error("Failed to send healing notification: " + e.getMessage(), e);
        }
    }
    
    private String createNotificationMessage(HealingEvent event, String eventType) {
        StringBuilder message = new StringBuilder();
        
        switch (eventType) {
            case "HEALING_SUCCESS":
                message.append("✅ **Self-Healing Success**\n");
                message.append("Locator `").append(event.getOldLocator()).append("` was automatically healed\n");
                message.append("New locator: `").append(event.getNewLocator()).append("`\n");
                message.append("Confidence: ").append(String.format("%.0f%%", event.getConfidence() * 100));
                break;
                
            case "HEALING_SUGGESTION":
                message.append("💡 **Healing Suggestion Available**\n");
                message.append("Locator `").append(event.getOldLocator()).append("` needs review\n");
                message.append("Suggested: `").append(event.getNewLocator()).append("`\n");
                message.append("Confidence: ").append(String.format("%.0f%%", event.getConfidence() * 100));
                break;
                
            case "HEALING_FAILURE":
                message.append("❌ **Healing Failed**\n");
                message.append("Could not heal locator: `").append(event.getOldLocator()).append("`\n");
                message.append("Error: ").append(event.getErrorMessage());
                break;
                
            default:
                message.append("Healing event: ").append(eventType);
        }
        
        if (event.getPageUrl() != null) {
            message.append("\nPage: ").append(event.getPageUrl());
        }
        
        return message.toString();
    }
}