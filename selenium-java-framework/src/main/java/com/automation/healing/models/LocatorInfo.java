package com.automation.healing.models;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * LocatorInfo - Data model for locator information
 * Stores locator type and value for both original and healed locators
 */
public class LocatorInfo {
    
    @JsonProperty("id")
    private String id;
    
    @JsonProperty("type")
    private String type;
    
    @JsonProperty("value")
    private String value;
    
    @JsonProperty("className")
    private String className;
    
    @JsonProperty("linkText")
    private String linkText;
    
    @JsonProperty("name")
    private String name;
    
    @JsonProperty("xpath")
    private String xpath;
    
    @JsonProperty("cssSelector")
    private String cssSelector;
    
    @JsonProperty("tagName")
    private String tagName;
    
    @JsonProperty("partialLinkText")
    private String partialLinkText;
    
    // Constructors
    public LocatorInfo() {}
    
    public LocatorInfo(String type, String value) {
        this.type = type;
        this.value = value;
    }
    
    public LocatorInfo(String id, String type, String value) {
        this.id = id;
        this.type = type;
        this.value = value;
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
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
    
    public String getClassName() {
        return className;
    }
    
    public void setClassName(String className) {
        this.className = className;
    }
    
    public String getLinkText() {
        return linkText;
    }
    
    public void setLinkText(String linkText) {
        this.linkText = linkText;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getXpath() {
        return xpath;
    }
    
    public void setXpath(String xpath) {
        this.xpath = xpath;
    }
    
    public String getCssSelector() {
        return cssSelector;
    }
    
    public void setCssSelector(String cssSelector) {
        this.cssSelector = cssSelector;
    }
    
    public String getTagName() {
        return tagName;
    }
    
    public void setTagName(String tagName) {
        this.tagName = tagName;
    }
    
    public String getPartialLinkText() {
        return partialLinkText;
    }
    
    public void setPartialLinkText(String partialLinkText) {
        this.partialLinkText = partialLinkText;
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