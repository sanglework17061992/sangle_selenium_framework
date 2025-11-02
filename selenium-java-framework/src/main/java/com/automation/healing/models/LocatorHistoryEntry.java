package com.automation.healing.models;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;

/**
 * LocatorHistoryEntry - Data model for tracking locator change history
 * Records when locators were updated, healed, or modified
 */
public class LocatorHistoryEntry {
    
    @JsonProperty("timestamp")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime timestamp;
    
    @JsonProperty("eventType")
    private String eventType; // CREATED, HEALED, UPDATED, FAILED
    
    @JsonProperty("oldLocator")
    private LocatorInfo oldLocator;
    
    @JsonProperty("newLocator")
    private LocatorInfo newLocator;
    
    @JsonProperty("confidence")
    private double confidence;
    
    @JsonProperty("reason")
    private String reason;
    
    @JsonProperty("testName")
    private String testName;
    
    @JsonProperty("success")
    private boolean success;
    
    // Constructors
    public LocatorHistoryEntry() {
        this.timestamp = LocalDateTime.now();
    }
    
    public LocatorHistoryEntry(String eventType, LocatorInfo oldLocator, LocatorInfo newLocator, 
                              double confidence, String reason) {
        this();
        this.eventType = eventType;
        this.oldLocator = oldLocator;
        this.newLocator = newLocator;
        this.confidence = confidence;
        this.reason = reason;
    }
    
    // Getters and Setters
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
    
    public String getEventType() {
        return eventType;
    }
    
    public void setEventType(String eventType) {
        this.eventType = eventType;
    }
    
    public LocatorInfo getOldLocator() {
        return oldLocator;
    }
    
    public void setOldLocator(LocatorInfo oldLocator) {
        this.oldLocator = oldLocator;
    }
    
    public LocatorInfo getNewLocator() {
        return newLocator;
    }
    
    public void setNewLocator(LocatorInfo newLocator) {
        this.newLocator = newLocator;
    }
    
    public double getConfidence() {
        return confidence;
    }
    
    public void setConfidence(double confidence) {
        this.confidence = confidence;
    }
    
    public String getReason() {
        return reason;
    }
    
    public void setReason(String reason) {
        this.reason = reason;
    }
    
    public String getTestName() {
        return testName;
    }
    
    public void setTestName(String testName) {
        this.testName = testName;
    }
    
    public boolean isSuccess() {
        return success;
    }
    
    public void setSuccess(boolean success) {
        this.success = success;
    }
    
    // Utility methods
    public boolean isHealingEvent() {
        return "HEALED".equalsIgnoreCase(eventType);
    }
    
    public boolean isFailureEvent() {
        return "FAILED".equalsIgnoreCase(eventType);
    }
    
    public boolean isCreationEvent() {
        return "CREATED".equalsIgnoreCase(eventType);
    }
    
    public boolean isUpdateEvent() {
        return "UPDATED".equalsIgnoreCase(eventType);
    }
    
    @Override
    public String toString() {
        return String.format("HistoryEntry{type='%s', timestamp=%s, confidence=%.2f, success=%s}", 
                eventType, timestamp, confidence, success);
    }
    
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        
        LocatorHistoryEntry that = (LocatorHistoryEntry) obj;
        
        if (Double.compare(that.confidence, confidence) != 0) return false;
        if (success != that.success) return false;
        if (timestamp != null ? !timestamp.equals(that.timestamp) : that.timestamp != null) return false;
        if (eventType != null ? !eventType.equals(that.eventType) : that.eventType != null) return false;
        if (oldLocator != null ? !oldLocator.equals(that.oldLocator) : that.oldLocator != null) return false;
        if (newLocator != null ? !newLocator.equals(that.newLocator) : that.newLocator != null) return false;
        if (reason != null ? !reason.equals(that.reason) : that.reason != null) return false;
        return testName != null ? testName.equals(that.testName) : that.testName == null;
    }
    
    @Override
    public int hashCode() {
        int result;
        long temp;
        result = timestamp != null ? timestamp.hashCode() : 0;
        result = 31 * result + (eventType != null ? eventType.hashCode() : 0);
        result = 31 * result + (oldLocator != null ? oldLocator.hashCode() : 0);
        result = 31 * result + (newLocator != null ? newLocator.hashCode() : 0);
        temp = Double.doubleToLongBits(confidence);
        result = 31 * result + (int) (temp ^ (temp >>> 32));
        result = 31 * result + (reason != null ? reason.hashCode() : 0);
        result = 31 * result + (testName != null ? testName.hashCode() : 0);
        result = 31 * result + (success ? 1 : 0);
        return result;
    }
}