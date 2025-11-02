package com.automation.healing.reporter;

import com.automation.healing.models.HealingEvent;

/**
 * HealingReporter - Interface for reporting healing events
 * Handles integration with Allure, logging, and notifications
 */
public interface HealingReporter {
    
    /**
     * Reports a successful healing event
     * @param event The healing event to report
     */
    void reportHealing(HealingEvent event);
    
    /**
     * Reports a healing suggestion
     * @param event The healing suggestion event
     */
    void reportSuggestion(HealingEvent event);
    
    /**
     * Reports a failed healing attempt
     * @param event The failed healing event
     */
    void reportFailure(HealingEvent event);
    
    /**
     * Generates a healing summary report
     * @param events List of healing events to summarize
     * @return Summary report as string
     */
    String generateSummaryReport(java.util.List<HealingEvent> events);
    
    /**
     * Configures notification settings
     * @param enabled Whether notifications are enabled
     * @param webhookUrl Slack webhook URL for notifications
     */
    void configureNotifications(boolean enabled, String webhookUrl);
}