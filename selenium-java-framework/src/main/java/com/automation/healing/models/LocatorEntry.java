package com.automation.healing.models;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * LocatorEntry - Data model for storing locator metadata and history
 * Used by LocatorRepository to manage baseline locators and track changes
 */
public class LocatorEntry {
    
    @JsonProperty("id")
    private String id;
    
    @JsonProperty("page")
    private String page;
    
    @JsonProperty("originalLocator")
    private LocatorInfo originalLocator;
    
    @JsonProperty("attributesSnapshot")
    private Map<String, Object> attributesSnapshot;
    
    @JsonProperty("lastSeen")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime lastSeen;
    
    @JsonProperty("history")
    private List<LocatorHistoryEntry> history;
    
    @JsonProperty("isActive")
    private boolean isActive;
    
    @JsonProperty("confidence")
    private double confidence;
    
    // Constructors
    public LocatorEntry() {
        this.history = new ArrayList<>();
        this.attributesSnapshot = new HashMap<>();
        this.isActive = true;
        this.confidence = 1.0;
    }
    
    public LocatorEntry(String id, String page, LocatorInfo originalLocator) {
        this();
        this.id = id;
        this.page = page;
        this.originalLocator = originalLocator;
        this.lastSeen = LocalDateTime.now();
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getPage() {
        return page;
    }
    
    public void setPage(String page) {
        this.page = page;
    }
    
    public LocatorInfo getOriginalLocator() {
        return originalLocator;
    }
    
    public void setOriginalLocator(LocatorInfo originalLocator) {
        this.originalLocator = originalLocator;
    }
    
    public Map<String, Object> getAttributesSnapshot() {
        return attributesSnapshot;
    }
    
    public void setAttributesSnapshot(Map<String, Object> attributesSnapshot) {
        this.attributesSnapshot = attributesSnapshot;
    }
    
    public LocalDateTime getLastSeen() {
        return lastSeen;
    }
    
    public void setLastSeen(LocalDateTime lastSeen) {
        this.lastSeen = lastSeen;
    }
    
    public List<LocatorHistoryEntry> getHistory() {
        return history;
    }
    
    public void setHistory(List<LocatorHistoryEntry> history) {
        this.history = history;
    }
    
    public boolean isActive() {
        return isActive;
    }
    
    public void setActive(boolean active) {
        isActive = active;
    }
    
    public double getConfidence() {
        return confidence;
    }
    
    public void setConfidence(double confidence) {
        this.confidence = confidence;
    }
    
    // Utility methods
    public void addToHistory(LocatorHistoryEntry entry) {
        if (this.history == null) {
            this.history = new ArrayList<>();
        }
        this.history.add(entry);
    }
    
    public void updateLastSeen() {
        this.lastSeen = LocalDateTime.now();
    }
    
    public void updateAttributes(Map<String, Object> newAttributes) {
        this.attributesSnapshot.clear();
        this.attributesSnapshot.putAll(newAttributes);
        this.updateLastSeen();
    }
    
    @Override
    public String toString() {
        return String.format("LocatorEntry{id='%s', page='%s', locator='%s', active=%s, confidence=%.2f}", 
                id, page, originalLocator != null ? originalLocator.getValue() : "null", isActive, confidence);
    }
    
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        
        LocatorEntry that = (LocatorEntry) obj;
        return id != null ? id.equals(that.id) : that.id == null;
    }
    
    @Override
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }
}