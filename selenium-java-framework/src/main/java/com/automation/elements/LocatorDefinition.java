package com.automation.elements;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * LocatorDefinition - JSON serializable locator definition
 * Represents a locator that can be saved/loaded from JSON files
 */
public class LocatorDefinition {
    
    @JsonProperty("id")
    private String id;
    
    @JsonProperty("name")
    private String name;
    
    @JsonProperty("locatorType")
    private String locatorType; // "id", "name", "css", "xpath", etc.
    
    @JsonProperty("locatorValue")
    private String locatorValue;
    
    @JsonProperty("page")
    private String page;
    
    @JsonProperty("description")
    private String description;
    
    @JsonProperty("isHealed")
    private boolean isHealed = false;
    
    @JsonProperty("originalLocatorType")
    private String originalLocatorType;
    
    @JsonProperty("originalLocatorValue")
    private String originalLocatorValue;
    
    @JsonProperty("healedAt")
    private long healedAt;
    
    // Default constructor for Jackson
    public LocatorDefinition() {}
    
    /**
     * Constructor for creating new locator definition
     */
    public LocatorDefinition(String id, String name, String locatorType, String locatorValue, String page) {
        this.id = id;
        this.name = name;
        this.locatorType = locatorType;
        this.locatorValue = locatorValue;
        this.page = page;
    }
    
    /**
     * Constructor with description
     */
    public LocatorDefinition(String id, String name, String locatorType, String locatorValue, String page, String description) {
        this(id, name, locatorType, locatorValue, page);
        this.description = description;
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getLocatorType() {
        return locatorType;
    }
    
    public void setLocatorType(String locatorType) {
        this.locatorType = locatorType;
    }
    
    public String getLocatorValue() {
        return locatorValue;
    }
    
    public void setLocatorValue(String locatorValue) {
        this.locatorValue = locatorValue;
    }
    
    public String getPage() {
        return page;
    }
    
    public void setPage(String page) {
        this.page = page;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public boolean isHealed() {
        return isHealed;
    }
    
    public void setHealed(boolean healed) {
        isHealed = healed;
    }
    
    public String getOriginalLocatorType() {
        return originalLocatorType;
    }
    
    public void setOriginalLocatorType(String originalLocatorType) {
        this.originalLocatorType = originalLocatorType;
    }
    
    public String getOriginalLocatorValue() {
        return originalLocatorValue;
    }
    
    public void setOriginalLocatorValue(String originalLocatorValue) {
        this.originalLocatorValue = originalLocatorValue;
    }
    
    public long getHealedAt() {
        return healedAt;
    }
    
    public void setHealedAt(long healedAt) {
        this.healedAt = healedAt;
    }
    
    /**
     * Mark this locator as healed with new locator information
     */
    public void markAsHealed(String newLocatorType, String newLocatorValue) {
        if (!isHealed) {
            this.originalLocatorType = this.locatorType;
            this.originalLocatorValue = this.locatorValue;
        }
        this.locatorType = newLocatorType;
        this.locatorValue = newLocatorValue;
        this.isHealed = true;
        this.healedAt = System.currentTimeMillis();
    }
    
    @Override
    public String toString() {
        return String.format("LocatorDefinition{id='%s', name='%s', locator='%s:%s', page='%s', healed=%s}", 
                id, name, locatorType, locatorValue, page, isHealed);
    }
}