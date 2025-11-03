package com.automation.healing.analyzer;

import com.automation.healing.models.CandidateLocator;
import com.automation.healing.models.LocatorEntry;
import com.automation.healing.models.LocatorInfo;
import com.automation.utils.LoggerUtil;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.regex.Matcher;
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
        LoggerUtil.info("🔍 Original attributes for comparison: " + originalAttributes);
        
        // Analyze each element
        for (Map<String, Object> element : elements) {
            try {
                double score = calculateSimilarityScore(originalAttributes, element);
                
                // Special case: If we have no baseline data, use fuzzy matching
                if (originalAttributes == null || originalAttributes.isEmpty()) {
                    score = calculateFuzzyHeuristicScore(originalEntry, element);
                    LoggerUtil.info("🔍 Using fuzzy heuristic for element: " + element + ", Score: " + score);
                } else {
                    LoggerUtil.info("🔍 Element: " + element + ", Score: " + score);
                }
                
                if (score > 0.1) { // Lower threshold for debugging
                    CandidateLocator candidate = createCandidate(element, score, originalEntry);
                    if (candidate != null) {
                        candidates.add(candidate);
                        LoggerUtil.info("✅ Added candidate with score " + score + ": " + candidate.toString());
                    } else {
                        LoggerUtil.debug("Created candidate was null for score " + score);
                    }
                } else {
                    LoggerUtil.info("❌ Score too low (" + score + ") for element: " + element);
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
    
    /**
     * Calculates fuzzy heuristic score when no baseline data is available
     * Uses pattern matching and common element relationships
     */
    private double calculateFuzzyHeuristicScore(LocatorEntry originalEntry, Map<String, Object> candidateElement) {
        try {
            // Extract original locator info
            String originalLocatorStr = originalEntry.getOriginalLocator().getValue();
            Map<String, Object> candidateAttributes = extractElementAttributes(candidateElement);
            
            double score = 0.0;
            
            // Pattern 1: ID similarity (e.g., "username" -> "username-modified")
            if (originalLocatorStr.contains("id")) {
                String originalId = extractIdFromLocator(originalLocatorStr);
                String candidateId = getStringValue(candidateAttributes, "id");
                
                if (originalId != null && candidateId != null) {
                    double idSimilarity = calculateIdSimilarity(originalId, candidateId);
                    if (idSimilarity > 0.5) {
                        score += 0.6; // High score for ID patterns
                        LoggerUtil.info("🎯 ID pattern match: " + originalId + " -> " + candidateId + " (similarity: " + idSimilarity + ")");
                    }
                }
            }
            
            // Pattern 2: Common element types (input for username, etc.)
            String tagName = getStringValue(candidateElement, "tagName");
            if ("input".equals(tagName)) {
                String type = getStringValue(candidateAttributes, "type");
                String name = getStringValue(candidateAttributes, "name");
                
                // Look for username/email patterns
                if (originalLocatorStr.toLowerCase().contains("username") || originalLocatorStr.toLowerCase().contains("user")) {
                    if ("username".equals(name) || (name != null && name.toLowerCase().contains("user"))) {
                        score += 0.4;
                        LoggerUtil.info("🎯 Username pattern match via name attribute");
                    }
                    if ("text".equals(type) || "email".equals(type)) {
                        score += 0.2;
                        LoggerUtil.info("🎯 Text input type match");
                    }
                }
            }
            
            // Pattern 3: Context-based scoring (form elements, etc.)
            // Add more patterns as needed
            
            return Math.min(1.0, score);
            
        } catch (Exception e) {
            LoggerUtil.error("Error in fuzzy heuristic scoring: " + e.getMessage(), e);
            return 0.0;
        }
    }
    
    private String extractIdFromLocator(String locatorStr) {
        // Extract ID from "By.id: someId" format
        if (locatorStr.contains("id:")) {
            String[] parts = locatorStr.split("id:");
            if (parts.length > 1) {
                return parts[1].trim();
            }
        }
        return null;
    }
    
    private double calculateIdSimilarity(String original, String candidate) {
        if (original == null || candidate == null) return 0.0;
        
        // Check for common patterns like "username" -> "username-modified"
        if (candidate.startsWith(original)) {
            return 0.8; // High similarity if candidate starts with original
        }
        if (candidate.contains(original)) {
            return 0.6; // Medium similarity if original is contained
        }
        if (original.contains(candidate)) {
            return 0.6; // Medium similarity if candidate is contained in original
        }
        
        // Levenshtein distance-based similarity
        int distance = calculateLevenshteinDistance(original.toLowerCase(), candidate.toLowerCase());
        int maxLen = Math.max(original.length(), candidate.length());
        return 1.0 - (double) distance / maxLen;
    }
    
    private int calculateLevenshteinDistance(String s1, String s2) {
        int[][] dp = new int[s1.length() + 1][s2.length() + 1];
        
        for (int i = 0; i <= s1.length(); i++) {
            for (int j = 0; j <= s2.length(); j++) {
                if (i == 0) {
                    dp[i][j] = j;
                } else if (j == 0) {
                    dp[i][j] = i;
                } else {
                    dp[i][j] = Math.min(
                        dp[i - 1][j - 1] + (s1.charAt(i - 1) == s2.charAt(j - 1) ? 0 : 1),
                        Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1)
                    );
                }
            }
        }
        
        return dp[s1.length()][s2.length()];
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
        
        // Get attributes from nested structure if present
        Map<String, Object> attributes = extractElementAttributes(elementData);
        
        // ID-based locator
        String id = getStringValue(attributes, "id");
        if (id != null && !id.isEmpty()) {
            alternatives.add("id=" + id);
            alternatives.add("xpath=//*[@id='" + id + "']");
        }
        
        // Name-based locator
        String name = getStringValue(attributes, "name");
        if (name != null && !name.isEmpty()) {
            alternatives.add("name=" + name);
            alternatives.add("xpath=//*[@name='" + name + "']");
        }
        
        // Class-based locator
        String className = getStringValue(attributes, "class");
        if (className != null && !className.isEmpty()) {
            alternatives.add("className=" + className.split("\\s+")[0]); // Use first class
            alternatives.add("css=." + className.replace(" ", "."));
        }
        
        // Type-based locator (for input elements)
        String type = getStringValue(attributes, "type");
        String tagName = getStringValue(elementData, "tagName");
        if (type != null && !type.isEmpty() && "input".equals(tagName)) {
            alternatives.add("css=input[type='" + type + "']");
            alternatives.add("xpath=//input[@type='" + type + "']");
        }
        
        // Text-based locator
        String textContent = getStringValue(elementData, "textContent");
        if (textContent != null && !textContent.isEmpty() && textContent.length() < 50) {
            if (tagName != null) {
                alternatives.add("xpath=//" + tagName.toLowerCase() + "[contains(text(),'" + textContent + "')]");
                alternatives.add("xpath=//" + tagName.toLowerCase() + "[text()='" + textContent + "']");
            }
        }
        
        // Placeholder-based locator (for input elements)
        String placeholder = getStringValue(attributes, "placeholder");
        if (placeholder != null && !placeholder.isEmpty() && "input".equals(tagName)) {
            alternatives.add("xpath=//input[@placeholder='" + placeholder + "']");
            alternatives.add("css=input[placeholder='" + placeholder + "']");
        }
        
        LoggerUtil.debug("Generated " + alternatives.size() + " alternative locators for element");
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
                    LoggerUtil.info("Parsing elements from page source (elements list not available)");
                    elements = parseElementsFromPageSource(pageSource);
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
        
        String originalStr = originalValue.toString();
        String candidateStr = candidateValue.toString();
        
        // Exact match
        if (originalStr.equals(candidateStr)) {
            return true;
        }
        
        // For ID attributes, allow fuzzy matching for similar values
        if ("id".equals(attributeName)) {
            // Check if one contains the other (e.g., "username" in "username-modified")
            if (originalStr.length() >= 3 && candidateStr.length() >= 3) {
                if (originalStr.contains(candidateStr) || candidateStr.contains(originalStr)) {
                    return true;
                }
                
                // Check for common prefixes/suffixes (at least 3 characters)
                if (originalStr.length() >= 3 && candidateStr.length() >= 3) {
                    String originalLower = originalStr.toLowerCase();
                    String candidateLower = candidateStr.toLowerCase();
                    
                    // Check prefix match (e.g., "username" and "username-modified")
                    if (originalLower.startsWith(candidateLower) || candidateLower.startsWith(originalLower)) {
                        return true;
                    }
                }
            }
        }
        
        return false;
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
    
    private List<Map<String, Object>> parseElementsFromPageSource(String pageSource) {
        List<Map<String, Object>> elements = new ArrayList<>();
        
        try {
            // Use simple regex patterns to extract HTML elements
            // Pattern to match HTML tags with attributes
            Pattern elementPattern = Pattern.compile("<([a-zA-Z][a-zA-Z0-9]*)[^>]*>");
            Matcher matcher = elementPattern.matcher(pageSource);
            
            while (matcher.find()) {
                String fullTag = matcher.group(0);
                String tagName = matcher.group(1).toLowerCase();
                
                // Only process form-related elements that could be locator targets
                if (isRelevantElementForHealing(tagName)) {
                    Map<String, Object> element = new HashMap<>();
                    element.put("tagName", tagName);
                    element.put("attributes", extractAttributesFromTag(fullTag));
                    elements.add(element);
                }
            }
            
            LoggerUtil.debug("Extracted " + elements.size() + " relevant elements from page source");
            return elements;
        } catch (Exception e) {
            LoggerUtil.error("Error parsing page source to elements", e);
            return new ArrayList<>();
        }
    }
    
    private boolean isRelevantElementForHealing(String tagName) {
        // Focus on interactive elements that are commonly used in automation
        return tagName.equals("input") || tagName.equals("button") || 
               tagName.equals("select") || tagName.equals("textarea") ||
               tagName.equals("a") || tagName.equals("div") || 
               tagName.equals("span") || tagName.equals("form");
    }
    
    private Map<String, String> extractAttributesFromTag(String htmlTag) {
        Map<String, String> attributes = new HashMap<>();
        
        try {
            // Pattern to match attribute="value" or attribute='value'
            Pattern attributePattern = Pattern.compile("([a-zA-Z-]+)\\s*=\\s*[\"']([^\"']*)[\"']");
            Matcher matcher = attributePattern.matcher(htmlTag);
            
            while (matcher.find()) {
                String attrName = matcher.group(1).toLowerCase();
                String attrValue = matcher.group(2);
                attributes.put(attrName, attrValue);
            }
            
            // Also handle attributes without quotes (less common but possible)
            Pattern unquotedPattern = Pattern.compile("([a-zA-Z-]+)\\s*=\\s*([^\\s>]+)");
            Matcher unquotedMatcher = unquotedPattern.matcher(htmlTag);
            
            while (unquotedMatcher.find()) {
                String attrName = unquotedMatcher.group(1).toLowerCase();
                String attrValue = unquotedMatcher.group(2);
                
                // Only add if not already present (quoted attributes take precedence)
                if (!attributes.containsKey(attrName) && !attrValue.startsWith("\"") && !attrValue.startsWith("'")) {
                    attributes.put(attrName, attrValue);
                }
            }
            
        } catch (Exception e) {
            LoggerUtil.error("Error extracting attributes from tag: " + htmlTag, e);
        }
        
        return attributes;
    }
}