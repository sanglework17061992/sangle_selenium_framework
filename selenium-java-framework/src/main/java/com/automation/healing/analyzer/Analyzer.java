package com.automation.healing.analyzer;

import com.automation.healing.models.CandidateLocator;
import com.automation.healing.models.LocatorEntry;

import java.util.List;
import java.util.Map;

/**
 * Analyzer - Interface for locator analysis and candidate finding
 * Compares DOM snapshots with stored locator metadata to find replacement candidates
 */
public interface Analyzer {
    
    /**
     * Finds candidate replacement locators based on DOM snapshot and original locator metadata
     * @param originalEntry The original locator entry that failed
     * @param domSnapshot The current DOM snapshot captured via CDP
     * @return List of candidate locators with scores
     */
    List<CandidateLocator> findCandidates(LocatorEntry originalEntry, Map<String, Object> domSnapshot);
    
    /**
     * Analyzes DOM elements to find the best matching candidates
     * @param originalEntry The original locator entry
     * @param domSnapshot The DOM snapshot
     * @param maxCandidates Maximum number of candidates to return
     * @return List of top candidate locators
     */
    List<CandidateLocator> findCandidates(LocatorEntry originalEntry, Map<String, Object> domSnapshot, int maxCandidates);
    
    /**
     * Calculates similarity score between original locator attributes and a DOM element
     * @param originalAttributes The original element attributes
     * @param candidateElement The candidate DOM element
     * @return Similarity score (0.0 to 1.0)
     */
    double calculateSimilarityScore(Map<String, Object> originalAttributes, Map<String, Object> candidateElement);
    
    /**
     * Calculates attribute similarity between original and candidate elements
     * @param originalAttributes Original element attributes
     * @param candidateAttributes Candidate element attributes
     * @return Attribute similarity score (0.0 to 0.5)
     */
    double calculateAttributeSimilarity(Map<String, Object> originalAttributes, Map<String, Object> candidateAttributes);
    
    /**
     * Calculates text similarity between original and candidate elements
     * @param originalText Original element text content
     * @param candidateText Candidate element text content
     * @return Text similarity score (0.0 to 0.25)
     */
    double calculateTextSimilarity(String originalText, String candidateText);
    
    /**
     * Calculates structural similarity based on element hierarchy and position
     * @param originalXpath Original element XPath
     * @param candidateXpath Candidate element XPath
     * @return Structural similarity score (0.0 to 0.15)
     */
    double calculateStructuralSimilarity(String originalXpath, String candidateXpath);
    
    /**
     * Calculates visual similarity based on tag name, visibility, and interaction state
     * @param originalElement Original element properties
     * @param candidateElement Candidate element properties
     * @return Visual similarity score (0.0 to 0.10)
     */
    double calculateVisualSimilarity(Map<String, Object> originalElement, Map<String, Object> candidateElement);
    
    /**
     * Generates alternative locators for a given element
     * @param elementData Element data from DOM snapshot
     * @return List of alternative locator strategies
     */
    List<String> generateAlternativeLocators(Map<String, Object> elementData);
    
    /**
     * Validates that a candidate locator would be unique on the page
     * @param locatorValue The locator value to validate
     * @param locatorType The locator type (xpath, css, id, etc.)
     * @param domSnapshot The DOM snapshot
     * @return true if the locator is unique, false otherwise
     */
    boolean isLocatorUnique(String locatorValue, String locatorType, Map<String, Object> domSnapshot);
    
    /**
     * Gets the confidence threshold for accepting healing suggestions
     * @return The current confidence threshold (0.0 to 1.0)
     */
    double getConfidenceThreshold();
    
    /**
     * Sets the confidence threshold for accepting healing suggestions
     * @param threshold The confidence threshold (0.0 to 1.0)
     */
    void setConfidenceThreshold(double threshold);
}