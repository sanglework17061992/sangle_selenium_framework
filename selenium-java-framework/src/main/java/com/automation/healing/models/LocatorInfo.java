package com.automation.healing.models;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * LocatorInfo - Data model for locator information
 * Stores locator type and value for both original and healed locators
 */
public class LocatorInfo {
    
    @JsonProperty("type")
    private String type;
    
    @JsonProperty("value")
    private String value;
    
    // Constructors
    public LocatorInfo() {}
    
    public LocatorInfo(String type, String value) {
        this.type = type;
        this.value = value;
    }
    
    // Getters and Setters
    public String getType() {
        return type;
    }
    
    public void setType(String type) {
        this.type = type;
    }
    
    public String getValue() {
        return value;
    }
    
    public void setValue(String value) {
        this.value = value;
    }
    
    // Utility methods
    public boolean isXPath() {
        return "xpath".equalsIgnoreCase(type);
    }
    
    public boolean isCssSelector() {
        return "css".equalsIgnoreCase(type) || "cssSelector".equalsIgnoreCase(type);
    }
    
    public boolean isId() {
        return "id".equalsIgnoreCase(type);
    }
    
    public boolean isClassName() {
        return "className".equalsIgnoreCase(type) || "class".equalsIgnoreCase(type);
    }
    
    public boolean isName() {
        return "name".equalsIgnoreCase(type);
    }
    
    public boolean isTagName() {
        return "tagName".equalsIgnoreCase(type) || "tag".equalsIgnoreCase(type);
    }
    
    public boolean isLinkText() {
        return "linkText".equalsIgnoreCase(type);
    }
    
    public boolean isPartialLinkText() {
        return "partialLinkText".equalsIgnoreCase(type);
    }
    
    @Override
    public String toString() {
        return String.format("LocatorInfo{type='%s', value='%s'}", type, value);
    }
    
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        
        LocatorInfo that = (LocatorInfo) obj;
        
        if (type != null ? !type.equals(that.type) : that.type != null) return false;
        return value != null ? value.equals(that.value) : that.value == null;
    }
    
    @Override
    public int hashCode() {
        int result = type != null ? type.hashCode() : 0;
        result = 31 * result + (value != null ? value.hashCode() : 0);
        return result;
    }
}