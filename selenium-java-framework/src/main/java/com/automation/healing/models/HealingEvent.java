package com.automation.healing.models;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * HealingEvent - Data model for healing event logging
 * Stores detailed information about each healing attempt for reporting
 */
public class HealingEvent {
    
    @JsonProperty("eventId")
    private String eventId;
    
    @JsonProperty("testName")
    private String testName;
    
    @JsonProperty("oldLocator")
    private String oldLocator;
    
    @JsonProperty("newLocator")
    private String newLocator;
    
    @JsonProperty("confidence")
    private double confidence;
    
    @JsonProperty("action")
    private String action;
    
    @JsonProperty("timestamp")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime timestamp;
    
    @JsonProperty("status")
    private String status; // applied, suggested, failed
    
    @JsonProperty("artifacts")
    private Map<String, String> artifacts;
    
    @JsonProperty("pageUrl")
    private String pageUrl;
    
    @JsonProperty("browserInfo")
    private String browserInfo;
    
    @JsonProperty("errorMessage")
    private String errorMessage;
    
    @JsonProperty("executionTime")
    private long executionTime; // in milliseconds
    
    @JsonProperty("candidatesCount")
    private int candidatesCount;
    
    @JsonProperty("healingMode")
    private String healingMode; // auto, suggest-only
    
    // Constructors
    public HealingEvent() {
        this.timestamp = LocalDateTime.now();
        this.artifacts = new HashMap<>();
    }
    
    public HealingEvent(String eventId, String testName, String oldLocator, String newLocator, 
                       double confidence, String action) {
        this();
        this.eventId = eventId;
        this.testName = testName;
        this.oldLocator = oldLocator;
        this.newLocator = newLocator;
        this.confidence = confidence;
        this.action = action;
    }
    
    // Getters and Setters
    public String getEventId() {
        return eventId;
    }
    
    public void setEventId(String eventId) {
        this.eventId = eventId;
    }
    
    public String getTestName() {
        return testName;
    }
    
    public void setTestName(String testName) {
        this.testName = testName;
    }
    
    public String getOldLocator() {
        return oldLocator;
    }
    
    public void setOldLocator(String oldLocator) {
        this.oldLocator = oldLocator;
    }
    
    public String getNewLocator() {
        return newLocator;
    }
    
    public void setNewLocator(String newLocator) {
        this.newLocator = newLocator;
    }
    
    public double getConfidence() {
        return confidence;
    }
    
    public void setConfidence(double confidence) {
        this.confidence = confidence;
    }
    
    public String getAction() {
        return action;
    }
    
    public void setAction(String action) {
        this.action = action;
    }
    
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public Map<String, String> getArtifacts() {
        return artifacts;
    }
    
    public void setArtifacts(Map<String, String> artifacts) {
        this.artifacts = artifacts;
    }
    
    public String getPageUrl() {
        return pageUrl;
    }
    
    public void setPageUrl(String pageUrl) {
        this.pageUrl = pageUrl;
    }
    
    public String getBrowserInfo() {
        return browserInfo;
    }
    
    public void setBrowserInfo(String browserInfo) {
        this.browserInfo = browserInfo;
    }
    
    public String getErrorMessage() {
        return errorMessage;
    }
    
    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }
    
    public long getExecutionTime() {
        return executionTime;
    }
    
    public void setExecutionTime(long executionTime) {
        this.executionTime = executionTime;
    }
    
    public int getCandidatesCount() {
        return candidatesCount;
    }
    
    public void setCandidatesCount(int candidatesCount) {
        this.candidatesCount = candidatesCount;
    }
    
    public String getHealingMode() {
        return healingMode;
    }
    
    public void setHealingMode(String healingMode) {
        this.healingMode = healingMode;
    }
    
    // Utility methods
    public void addArtifact(String key, String value) {
        if (this.artifacts == null) {
            this.artifacts = new HashMap<>();
        }
        this.artifacts.put(key, value);
    }
    
    public String getArtifact(String key) {
        return this.artifacts != null ? this.artifacts.get(key) : null;
    }
    
    public boolean isSuccessful() {
        return "applied".equalsIgnoreCase(status);
    }
    
    public boolean isFailed() {
        return "failed".equalsIgnoreCase(status);
    }
    
    public boolean isSuggested() {
        return "suggested".equalsIgnoreCase(status);
    }
    
    public boolean hasHighConfidence() {
        return confidence >= 0.8;
    }
    
    public boolean hasMediumConfidence() {
        return confidence >= 0.6 && confidence < 0.8;
    }
    
    public boolean hasLowConfidence() {
        return confidence < 0.6;
    }
    
    @Override
    public String toString() {
        return String.format("HealingEvent{id='%s', test='%s', confidence=%.2f, status='%s', action='%s'}", 
                eventId, testName, confidence, status, action);
    }
    
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        
        HealingEvent that = (HealingEvent) obj;
        return eventId != null ? eventId.equals(that.eventId) : that.eventId == null;
    }
    
    @Override
    public int hashCode() {
        return eventId != null ? eventId.hashCode() : 0;
    }
}