package com.automation.elements;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.util.List;
import java.util.Map;

/**
 * PageDefinition - JSON model for the new user-friendly page locator structure
 * Handles the nested JSON format with elements, alternatives, and healing persistence
 */
public class PageDefinition {
    
    @JsonProperty("page")
    private String page;
    
    @JsonProperty("description")
    private String description;
    
    @JsonProperty("lastUpdated")
    private String lastUpdated;
    
    @JsonProperty("healingEnabled")
    private Boolean healingEnabled = true;
    
    @JsonProperty("elements")
    private Map<String, ElementDefinition> elements;
    
    // Default constructor for Jackson
    public PageDefinition() {}
    
    // Getters and setters
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
    
    public String getLastUpdated() {
        return lastUpdated;
    }
    
    public void setLastUpdated(String lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
    
    public Boolean getHealingEnabled() {
        return healingEnabled;
    }
    
    public void setHealingEnabled(Boolean healingEnabled) {
        this.healingEnabled = healingEnabled;
    }
    
    public Map<String, ElementDefinition> getElements() {
        return elements;
    }
    
    public void setElements(Map<String, ElementDefinition> elements) {
        this.elements = elements;
    }
    
    /**
     * ElementDefinition - Represents an individual element in the page with healing support
     */
    public static class ElementDefinition {
        
        @JsonProperty("name")
        private String name;
        
        @JsonProperty("locator")
        private String locator;
        
        @JsonProperty("description")
        private String description;
        
        @JsonProperty("alternatives")
        private List<String> alternatives;
        
        @JsonProperty("healing")
        private HealingInfo healing;
        
        // Default constructor for Jackson
        public ElementDefinition() {
            this.healing = new HealingInfo();
        }
        
        // Getters and setters
        public String getName() {
            return name;
        }
        
        public void setName(String name) {
            this.name = name;
        }
        
        public String getLocator() {
            return locator;
        }
        
        public void setLocator(String locator) {
            this.locator = locator;
        }
        
        public String getDescription() {
            return description;
        }
        
        public void setDescription(String description) {
            this.description = description;
        }
        
        public List<String> getAlternatives() {
            return alternatives;
        }
        
        public void setAlternatives(List<String> alternatives) {
            this.alternatives = alternatives;
        }
        
        public HealingInfo getHealing() {
            return healing;
        }
        
        public void setHealing(HealingInfo healing) {
            this.healing = healing;
        }
        
        /**
         * Update locator after successful healing
         */
        public void updateAfterHealing(String newLocator, String originalLocator) {
            if (healing == null) {
                healing = new HealingInfo();
            }
            
            // Initialize healing history if null
            if (healing.getHealingHistory() == null) {
                healing.setHealingHistory(new java.util.ArrayList<>());
            }
            
            // Add current locator to alternatives if not already there
            if (alternatives != null && !alternatives.contains(this.locator)) {
                alternatives.add(0, this.locator);
            }
            
            // Update healing info
            healing.setIsHealed(true);
            healing.setOriginalLocator(originalLocator);
            healing.setHealedAt(java.time.Instant.now().toString());
            healing.setHealingCount(healing.getHealingCount() + 1);
            healing.setLastSuccessfulLocator(newLocator);
            
            // Add to healing history
            HealingHistory historyEntry = new HealingHistory();
            historyEntry.setFailedLocator(originalLocator);
            historyEntry.setSuccessfulLocator(newLocator);
            historyEntry.setHealedAt(healing.getHealedAt());
            healing.getHealingHistory().add(historyEntry);
            
            // Set new locator as primary
            this.locator = newLocator;
        }
        
        /**
         * Convert to LocatorDefinition for compatibility with existing healing system
         */
        public LocatorDefinition toLocatorDefinition(String elementId, String pageName) {
            // Parse locator format: "type=value" (e.g., "id=username", "css=.class")
            String[] parts = locator.split("=", 2);
            String locatorType = parts.length > 1 ? parts[0] : "css";
            String locatorValue = parts.length > 1 ? parts[1] : locator;
            
            LocatorDefinition locatorDef = new LocatorDefinition(elementId, name, locatorType, locatorValue, pageName);
            
            // Set healing information if available
            if (healing != null && healing.getIsHealed()) {
                locatorDef.setHealed(true);
                locatorDef.setHealedAt(System.currentTimeMillis());
                if (healing.getOriginalLocator() != null) {
                    String[] originalParts = healing.getOriginalLocator().split("=", 2);
                    locatorDef.setOriginalLocatorType(originalParts.length > 1 ? originalParts[0] : "css");
                    locatorDef.setOriginalLocatorValue(originalParts.length > 1 ? originalParts[1] : healing.getOriginalLocator());
                }
            }
            
            return locatorDef;
        }
    }
    
    /**
     * HealingInfo - Metadata for tracking healing history and status
     */
    public static class HealingInfo {
        
        @JsonProperty("isHealed")
        private Boolean isHealed = false;
        
        @JsonProperty("originalLocator")
        private String originalLocator;
        
        @JsonProperty("healedAt")
        private String healedAt;
        
        @JsonProperty("healingCount")
        private Integer healingCount = 0;
        
        @JsonProperty("lastSuccessfulLocator")
        private String lastSuccessfulLocator;
        
        @JsonProperty("healingHistory")
        private List<HealingHistory> healingHistory;
        
        // Default constructor
        public HealingInfo() {}
        
        // Getters and setters
        public Boolean getIsHealed() {
            return isHealed;
        }
        
        public void setIsHealed(Boolean isHealed) {
            this.isHealed = isHealed;
        }
        
        public String getOriginalLocator() {
            return originalLocator;
        }
        
        public void setOriginalLocator(String originalLocator) {
            this.originalLocator = originalLocator;
        }
        
        public String getHealedAt() {
            return healedAt;
        }
        
        public void setHealedAt(String healedAt) {
            this.healedAt = healedAt;
        }
        
        public Integer getHealingCount() {
            return healingCount;
        }
        
        public void setHealingCount(Integer healingCount) {
            this.healingCount = healingCount;
        }
        
        public String getLastSuccessfulLocator() {
            return lastSuccessfulLocator;
        }
        
        public void setLastSuccessfulLocator(String lastSuccessfulLocator) {
            this.lastSuccessfulLocator = lastSuccessfulLocator;
        }
        
        public List<HealingHistory> getHealingHistory() {
            return healingHistory;
        }
        
        public void setHealingHistory(List<HealingHistory> healingHistory) {
            this.healingHistory = healingHistory;
        }
    }
    
    /**
     * HealingHistory - Individual healing event record
     */
    public static class HealingHistory {
        
        @JsonProperty("failedLocator")
        private String failedLocator;
        
        @JsonProperty("successfulLocator")
        private String successfulLocator;
        
        @JsonProperty("healedAt")
        private String healedAt;
        
        // Default constructor
        public HealingHistory() {}
        
        // Getters and setters
        public String getFailedLocator() {
            return failedLocator;
        }
        
        public void setFailedLocator(String failedLocator) {
            this.failedLocator = failedLocator;
        }
        
        public String getSuccessfulLocator() {
            return successfulLocator;
        }
        
        public void setSuccessfulLocator(String successfulLocator) {
            this.successfulLocator = successfulLocator;
        }
        
        public String getHealedAt() {
            return healedAt;
        }
        
        public void setHealedAt(String healedAt) {
            this.healedAt = healedAt;
        }
    }
}