package com.automation.healing.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.openqa.selenium.By;

import java.util.HashMap;
import java.util.Map;

/**
 * CandidateLocator - Data model for potential replacement locators
 * Contains scoring information and metadata for locator candidates during healing
 */
public class CandidateLocator {
    
    @JsonProperty("locatorInfo")
    private LocatorInfo locatorInfo;
    
    @JsonProperty("score")
    private double score;
    
    @JsonProperty("attributeMatches")
    private Map<String, Object> attributeMatches;
    
    @JsonProperty("textSimilarity")
    private double textSimilarity;
    
    @JsonProperty("structuralSimilarity")
    private double structuralSimilarity;
    
    @JsonProperty("visualSimilarity")
    private double visualSimilarity;
    
    @JsonProperty("xpath")
    private String xpath;
    
    @JsonProperty("cssSelector")
    private String cssSelector;
    
    @JsonProperty("tagName")
    private String tagName;
    
    @JsonProperty("isVisible")
    private boolean isVisible;
    
    @JsonProperty("isEnabled")
    private boolean isEnabled;
    
    @JsonProperty("boundingBox")
    private Map<String, Integer> boundingBox;
    
    @JsonProperty("confidence")
    private double confidence;
    
    @JsonProperty("reason")
    private String reason;
    
    // Constructors
    public CandidateLocator() {
        this.attributeMatches = new HashMap<>();
        this.boundingBox = new HashMap<>();
    }
    
    public CandidateLocator(LocatorInfo locatorInfo, double score) {
        this();
        this.locatorInfo = locatorInfo;
        this.score = score;
    }
    
    // Getters and Setters
    public LocatorInfo getLocatorInfo() {
        return locatorInfo;
    }
    
    public void setLocatorInfo(LocatorInfo locatorInfo) {
        this.locatorInfo = locatorInfo;
    }
    
    public double getScore() {
        return score;
    }
    
    public void setScore(double score) {
        this.score = score;
    }
    
    public Map<String, Object> getAttributeMatches() {
        return attributeMatches;
    }
    
    public void setAttributeMatches(Map<String, Object> attributeMatches) {
        this.attributeMatches = attributeMatches;
    }
    
    public double getTextSimilarity() {
        return textSimilarity;
    }
    
    public void setTextSimilarity(double textSimilarity) {
        this.textSimilarity = textSimilarity;
    }
    
    public double getStructuralSimilarity() {
        return structuralSimilarity;
    }
    
    public void setStructuralSimilarity(double structuralSimilarity) {
        this.structuralSimilarity = structuralSimilarity;
    }
    
    public double getVisualSimilarity() {
        return visualSimilarity;
    }
    
    public void setVisualSimilarity(double visualSimilarity) {
        this.visualSimilarity = visualSimilarity;
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
    
    public boolean isVisible() {
        return isVisible;
    }
    
    public void setVisible(boolean visible) {
        isVisible = visible;
    }
    
    public boolean isEnabled() {
        return isEnabled;
    }
    
    public void setEnabled(boolean enabled) {
        isEnabled = enabled;
    }
    
    public Map<String, Integer> getBoundingBox() {
        return boundingBox;
    }
    
    public void setBoundingBox(Map<String, Integer> boundingBox) {
        this.boundingBox = boundingBox;
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
    
    // Utility methods
    public void addAttributeMatch(String attributeName, Object value) {
        if (this.attributeMatches == null) {
            this.attributeMatches = new HashMap<>();
        }
        this.attributeMatches.put(attributeName, value);
    }
    
    public Object getAttributeMatch(String attributeName) {
        return this.attributeMatches != null ? this.attributeMatches.get(attributeName) : null;
    }
    
    public void setBoundingBox(int x, int y, int width, int height) {
        if (this.boundingBox == null) {
            this.boundingBox = new HashMap<>();
        }
        this.boundingBox.put("x", x);
        this.boundingBox.put("y", y);
        this.boundingBox.put("width", width);
        this.boundingBox.put("height", height);
    }
    
    public By toSeleniumBy() {
        if (locatorInfo == null) {
            return null;
        }
        
        switch (locatorInfo.getType().toLowerCase()) {
            case "id":
                return By.id(locatorInfo.getValue());
            case "xpath":
                return By.xpath(locatorInfo.getValue());
            case "css":
            case "cssselector":
                return By.cssSelector(locatorInfo.getValue());
            case "classname":
            case "class":
                return By.className(locatorInfo.getValue());
            case "name":
                return By.name(locatorInfo.getValue());
            case "tagname":
            case "tag":
                return By.tagName(locatorInfo.getValue());
            case "linktext":
                return By.linkText(locatorInfo.getValue());
            case "partiallinktext":
                return By.partialLinkText(locatorInfo.getValue());
            default:
                return By.xpath(locatorInfo.getValue()); // Default to XPath
        }
    }
    
    public boolean hasHighConfidence() {
        return score >= 0.8;
    }
    
    public boolean hasMediumConfidence() {
        return score >= 0.6 && score < 0.8;
    }
    
    public boolean hasLowConfidence() {
        return score < 0.6;
    }
    
    public boolean isInteractable() {
        return isVisible && isEnabled;
    }
    
    @Override
    public String toString() {
        return String.format("CandidateLocator{locator='%s', score=%.2f, visible=%s, enabled=%s}", 
                locatorInfo != null ? locatorInfo.getValue() : "null", score, isVisible, isEnabled);
    }
    
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        
        CandidateLocator that = (CandidateLocator) obj;
        
        if (Double.compare(that.score, score) != 0) return false;
        return locatorInfo != null ? locatorInfo.equals(that.locatorInfo) : that.locatorInfo == null;
    }
    
    @Override
    public int hashCode() {
        int result;
        long temp;
        result = locatorInfo != null ? locatorInfo.hashCode() : 0;
        temp = Double.doubleToLongBits(score);
        result = 31 * result + (int) (temp ^ (temp >>> 32));
        return result;
    }
}