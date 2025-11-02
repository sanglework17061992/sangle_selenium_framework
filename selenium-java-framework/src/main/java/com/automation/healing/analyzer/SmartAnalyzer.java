package com.automation.healing.analyzer;

import com.automation.healing.models.CandidateLocator;
import com.automation.healing.models.LocatorEntry;
import com.automation.healing.models.LocatorInfo;
import com.automation.utils.LoggerUtil;

import java.util.*;
import java.util.stream.Collectors;

/**
 * SmartAnalyzer - Implementation of locator analysis using heuristic algorithms
 * Implements the scoring algorithm from the requirements document
 */
public class SmartAnalyzer implements Analyzer {
    
    private double confidenceThreshold = 0.75;
    private static final int DEFAULT_MAX_CANDIDATES = 5;
    
    // Scoring weights as per requirements
    private static final double ATTRIBUTE_WEIGHT = 0.5;
    private static final double TEXT_WEIGHT = 0.25;
    private static final double STRUCTURAL_WEIGHT = 0.15;
    private static final double VISUAL_WEIGHT = 0.10;
    
    // High-priority attributes for matching
    private static final String[] HIGH_PRIORITY_ATTRIBUTES = {"id", "name", "data-testid", "data-test"};
    private static final String[] MEDIUM_PRIORITY_ATTRIBUTES = {"class", "role", "aria-label", "aria-labelledby"};
    private static final String[] LOW_PRIORITY_ATTRIBUTES = {"type", "href", "src", "alt", "title"};
    
    @Override
    public List<CandidateLocator> findCandidates(LocatorEntry originalEntry, Map<String, Object> domSnapshot) {
        return findCandidates(originalEntry, domSnapshot, DEFAULT_MAX_CANDIDATES);
    }
    
    @Override
    @SuppressWarnings("unchecked")
    public List<CandidateLocator> findCandidates(LocatorEntry originalEntry, Map<String, Object> domSnapshot, int maxCandidates) {
        LoggerUtil.info("Analyzing DOM snapshot for healing candidates");
        
        List<CandidateLocator> candidates = new ArrayList<>();
        
        if (originalEntry == null || domSnapshot == null) {
            LoggerUtil.warn("Original entry or DOM snapshot is null");
            return candidates;
        }
        
        // Get elements from DOM snapshot
        List<Map<String, Object>> elements = extractElementsFromSnapshot(domSnapshot);
        
        if (elements.isEmpty()) {
            LoggerUtil.warn("No elements found in DOM snapshot");
            return candidates;
        }
        
        LoggerUtil.info("Found " + elements.size() + " elements to analyze");
        
        Map<String, Object> originalAttributes = originalEntry.getAttributesSnapshot();
        
        // Analyze each element
        for (Map<String, Object> element : elements) {
            try {
                double score = calculateSimilarityScore(originalAttributes, element);
                
                if (score > 0.3) { // Only consider elements with reasonable similarity
                    CandidateLocator candidate = createCandidate(element, score, originalEntry);
                    if (candidate != null) {
                        candidates.add(candidate);
                    }
                }
            } catch (Exception e) {
                LoggerUtil.error("Error analyzing element: " + e.getMessage(), e);
            }
        }
        
        // Sort by score (highest first) and limit results
        candidates.sort((c1, c2) -> Double.compare(c2.getScore(), c1.getScore()));
        
        List<CandidateLocator> topCandidates = candidates.stream()
                .limit(maxCandidates)
                .collect(Collectors.toList());
        
        LoggerUtil.info("Found " + topCandidates.size() + " viable candidates");
        return topCandidates;
    }
    
    @Override
    public double calculateSimilarityScore(Map<String, Object> originalAttributes, Map<String, Object> candidateElement) {
        if (originalAttributes == null || candidateElement == null) {
            return 0.0;
        }
        
        // Extract candidate attributes
        Map<String, Object> candidateAttributes = extractElementAttributes(candidateElement);
        
        // Calculate individual scores
        double attributeScore = calculateAttributeSimilarity(originalAttributes, candidateAttributes);
        double textScore = calculateTextSimilarity(
                getStringValue(originalAttributes, "textContent"),
                getStringValue(candidateElement, "textContent")
        );
        double structuralScore = calculateStructuralSimilarity(
                getStringValue(originalAttributes, "xpath"),
                getStringValue(candidateElement, "xpath")
        );
        double visualScore = calculateVisualSimilarity(originalAttributes, candidateElement);
        
        // Weighted sum
        double totalScore = (attributeScore * ATTRIBUTE_WEIGHT) + 
                           (textScore * TEXT_WEIGHT) + 
                           (structuralScore * STRUCTURAL_WEIGHT) + 
                           (visualScore * VISUAL_WEIGHT);
        
        return Math.min(1.0, totalScore);
    }
    
    @Override
    public double calculateAttributeSimilarity(Map<String, Object> originalAttributes, Map<String, Object> candidateAttributes) {
        if (originalAttributes == null || candidateAttributes == null) {
            return 0.0;
        }
        
        double score = 0.0;
        int totalChecks = 0;
        
        // Check high-priority attributes (higher weight)
        for (String attr : HIGH_PRIORITY_ATTRIBUTES) {
            if (originalAttributes.containsKey(attr)) {
                totalChecks++;
                if (attributesMatch(originalAttributes, candidateAttributes, attr)) {
                    score += 0.15; // High weight for important attributes
                }
            }
        }
        
        // Check medium-priority attributes
        for (String attr : MEDIUM_PRIORITY_ATTRIBUTES) {
            if (originalAttributes.containsKey(attr)) {
                totalChecks++;
                if (attributesMatch(originalAttributes, candidateAttributes, attr)) {
                    score += 0.08; // Medium weight
                } else if (attributesSimilar(originalAttributes, candidateAttributes, attr)) {
                    score += 0.04; // Partial match for class tokens
                }
            }
        }
        
        // Check low-priority attributes
        for (String attr : LOW_PRIORITY_ATTRIBUTES) {
            if (originalAttributes.containsKey(attr)) {
                totalChecks++;
                if (attributesMatch(originalAttributes, candidateAttributes, attr)) {
                    score += 0.03; // Lower weight
                }
            }
        }
        
        // Tag name is always important
        if (attributesMatch(originalAttributes, candidateAttributes, "tagName")) {
            score += 0.1;
        }
        totalChecks++;
        
        return Math.min(ATTRIBUTE_WEIGHT, score);
    }
    
    @Override
    public double calculateTextSimilarity(String originalText, String candidateText) {
        if (originalText == null && candidateText == null) {
            return TEXT_WEIGHT; // Both null = perfect match
        }
        if (originalText == null || candidateText == null) {
            return 0.0;
        }
        
        String original = originalText.trim().toLowerCase();
        String candidate = candidateText.trim().toLowerCase();
        
        if (original.isEmpty() && candidate.isEmpty()) {
            return TEXT_WEIGHT;
        }
        if (original.isEmpty() || candidate.isEmpty()) {
            return 0.0;
        }
        
        // Exact match
        if (original.equals(candidate)) {
            return TEXT_WEIGHT;
        }
        
        // Contains match
        if (original.contains(candidate) || candidate.contains(original)) {
            return TEXT_WEIGHT * 0.8;
        }
        
        // Token-based similarity
        Set<String> originalTokens = new HashSet<>(Arrays.asList(original.split("\\s+")));
        Set<String> candidateTokens = new HashSet<>(Arrays.asList(candidate.split("\\s+")));
        
        Set<String> intersection = new HashSet<>(originalTokens);
        intersection.retainAll(candidateTokens);
        
        Set<String> union = new HashSet<>(originalTokens);
        union.addAll(candidateTokens);
        
        if (union.size() == 0) {
            return 0.0;
        }
        
        double jaccardSimilarity = (double) intersection.size() / union.size();
        return TEXT_WEIGHT * jaccardSimilarity;
    }
    
    @Override
    public double calculateStructuralSimilarity(String originalXpath, String candidateXpath) {
        if (originalXpath == null || candidateXpath == null) {
            return 0.0;
        }
        
        // Simple structural comparison
        String[] originalParts = originalXpath.split("/");
        String[] candidateParts = candidateXpath.split("/");
        
        // Compare path depth
        double depthSimilarity = 1.0 - Math.abs(originalParts.length - candidateParts.length) * 0.1;
        depthSimilarity = Math.max(0.0, depthSimilarity);
        
        // Compare common path segments
        int commonSegments = 0;
        int maxSegments = Math.min(originalParts.length, candidateParts.length);
        
        for (int i = 0; i < maxSegments; i++) {
            if (originalParts[i].equals(candidateParts[i])) {
                commonSegments++;
            }
        }
        
        double pathSimilarity = maxSegments > 0 ? (double) commonSegments / maxSegments : 0.0;
        
        return STRUCTURAL_WEIGHT * ((depthSimilarity + pathSimilarity) / 2.0);
    }
    
    @Override
    public double calculateVisualSimilarity(Map<String, Object> originalElement, Map<String, Object> candidateElement) {
        double score = 0.0;
        
        // Tag name match (most important for visual similarity)
        if (attributesMatch(originalElement, candidateElement, "tagName")) {
            score += 0.05;
        }
        
        // Visibility and interaction state
        boolean originalVisible = getBooleanValue(originalElement, "visible", true);
        boolean candidateVisible = getBooleanValue(candidateElement, "visible", true);
        if (originalVisible == candidateVisible) {
            score += 0.025;
        }
        
        boolean originalEnabled = getBooleanValue(originalElement, "enabled", true);
        boolean candidateEnabled = getBooleanValue(candidateElement, "enabled", true);
        if (originalEnabled == candidateEnabled) {
            score += 0.025;
        }
        
        return Math.min(VISUAL_WEIGHT, score);
    }
    
    @Override
    public List<String> generateAlternativeLocators(Map<String, Object> elementData) {
        List<String> alternatives = new ArrayList<>();
        
        if (elementData == null) {
            return alternatives;
        }
        
        // ID-based locator
        String id = getStringValue(elementData, "id");
        if (id != null && !id.isEmpty()) {
            alternatives.add("id=" + id);
            alternatives.add("xpath=//*[@id='" + id + "']");
        }
        
        // Name-based locator
        String name = getStringValue(elementData, "name");
        if (name != null && !name.isEmpty()) {
            alternatives.add("name=" + name);
            alternatives.add("xpath=//*[@name='" + name + "']");
        }
        
        // Class-based locator
        String className = getStringValue(elementData, "className");
        if (className != null && !className.isEmpty()) {
            alternatives.add("className=" + className.split("\\s+")[0]); // Use first class
            alternatives.add("css=." + className.replace(" ", "."));
        }
        
        // Text-based locator
        String textContent = getStringValue(elementData, "textContent");
        if (textContent != null && !textContent.isEmpty() && textContent.length() < 50) {
            String tagName = getStringValue(elementData, "tagName");
            if (tagName != null) {
                alternatives.add("xpath=//" + tagName.toLowerCase() + "[contains(text(),'" + textContent + "')]");
                alternatives.add("xpath=//" + tagName.toLowerCase() + "[text()='" + textContent + "']");
            }
        }
        
        return alternatives;
    }
    
    @Override
    public boolean isLocatorUnique(String locatorValue, String locatorType, Map<String, Object> domSnapshot) {
        // Simplified uniqueness check
        // In a real implementation, you would execute the locator against the DOM
        return locatorValue != null && !locatorValue.isEmpty();
    }
    
    @Override
    public double getConfidenceThreshold() {
        return confidenceThreshold;
    }
    
    @Override
    public void setConfidenceThreshold(double threshold) {
        this.confidenceThreshold = Math.max(0.0, Math.min(1.0, threshold));
    }
    
    // Helper methods
    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> extractElementsFromSnapshot(Map<String, Object> domSnapshot) {
        List<Map<String, Object>> elements = new ArrayList<>();
        
        try {
            // Try to get elements from different snapshot formats
            Object elementsObj = domSnapshot.get("elements");
            if (elementsObj instanceof List) {
                elements = (List<Map<String, Object>>) elementsObj;
            } else {
                // Fallback: try to parse from page source
                String pageSource = getStringValue(domSnapshot, "pageSource");
                if (pageSource != null) {
                    // For now, return empty list for page source
                    // In a real implementation, you would parse the HTML
                    LoggerUtil.warn("Page source parsing not implemented, using empty element list");
                }
            }
        } catch (Exception e) {
            LoggerUtil.error("Error extracting elements from snapshot: " + e.getMessage(), e);
        }
        
        return elements;
    }
    
    @SuppressWarnings("unchecked")
    private Map<String, Object> extractElementAttributes(Map<String, Object> element) {
        Map<String, Object> attributes = new HashMap<>();
        
        // Copy main element properties
        attributes.putAll(element);
        
        // Extract nested attributes if present
        Object attributesObj = element.get("attributes");
        if (attributesObj instanceof Map) {
            attributes.putAll((Map<String, Object>) attributesObj);
        }
        
        return attributes;
    }
    
    private CandidateLocator createCandidate(Map<String, Object> element, double score, LocatorEntry originalEntry) {
        try {
            CandidateLocator candidate = new CandidateLocator();
            candidate.setScore(score);
            
            // Create locator info - prefer xpath for now
            String xpath = getStringValue(element, "xpath");
            if (xpath != null) {
                LocatorInfo locatorInfo = new LocatorInfo("xpath", xpath);
                candidate.setLocatorInfo(locatorInfo);
            } else {
                // Generate xpath or use other locator strategies
                List<String> alternatives = generateAlternativeLocators(element);
                if (!alternatives.isEmpty()) {
                    String firstAlternative = alternatives.get(0);
                    String[] parts = firstAlternative.split("=", 2);
                    if (parts.length == 2) {
                        LocatorInfo locatorInfo = new LocatorInfo(parts[0], parts[1]);
                        candidate.setLocatorInfo(locatorInfo);
                    }
                }
            }
            
            // Set additional properties
            candidate.setXpath(xpath);
            candidate.setTagName(getStringValue(element, "tagName"));
            candidate.setVisible(getBooleanValue(element, "visible", true));
            candidate.setEnabled(getBooleanValue(element, "enabled", true));
            candidate.setConfidence(score);
            
            // Set reasoning
            if (score >= 0.8) {
                candidate.setReason("High confidence match based on attribute and text similarity");
            } else if (score >= 0.6) {
                candidate.setReason("Medium confidence match with partial attribute alignment");
            } else {
                candidate.setReason("Low confidence match requiring manual review");
            }
            
            return candidate;
            
        } catch (Exception e) {
            LoggerUtil.error("Error creating candidate: " + e.getMessage(), e);
            return null;
        }
    }
    
    private boolean attributesMatch(Map<String, Object> original, Map<String, Object> candidate, String attributeName) {
        Object originalValue = original.get(attributeName);
        Object candidateValue = candidate.get(attributeName);
        
        if (originalValue == null && candidateValue == null) {
            return true;
        }
        if (originalValue == null || candidateValue == null) {
            return false;
        }
        
        return originalValue.toString().equals(candidateValue.toString());
    }
    
    private boolean attributesSimilar(Map<String, Object> original, Map<String, Object> candidate, String attributeName) {
        if (!"class".equals(attributeName) && !"className".equals(attributeName)) {
            return false;
        }
        
        String originalClass = getStringValue(original, attributeName);
        String candidateClass = getStringValue(candidate, attributeName);
        
        if (originalClass == null || candidateClass == null) {
            return false;
        }
        
        Set<String> originalClasses = new HashSet<>(Arrays.asList(originalClass.split("\\s+")));
        Set<String> candidateClasses = new HashSet<>(Arrays.asList(candidateClass.split("\\s+")));
        
        // Check if at least one class matches
        originalClasses.retainAll(candidateClasses);
        return !originalClasses.isEmpty();
    }
    
    private String getStringValue(Map<String, Object> map, String key) {
        Object value = map.get(key);
        return value != null ? value.toString() : null;
    }
    
    private boolean getBooleanValue(Map<String, Object> map, String key, boolean defaultValue) {
        Object value = map.get(key);
        if (value instanceof Boolean) {
            return (Boolean) value;
        }
        if (value instanceof String) {
            return Boolean.parseBoolean((String) value);
        }
        return defaultValue;
    }
}