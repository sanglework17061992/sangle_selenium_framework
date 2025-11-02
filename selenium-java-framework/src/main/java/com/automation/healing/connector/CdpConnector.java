package com.automation.healing.connector;

import java.util.Map;

/**
 * CdpConnector - Interface for Chrome DevTools Protocol interactions
 * Provides methods to capture DOM snapshots and screenshots for healing analysis
 */
public interface CdpConnector {
    
    /**
     * Captures the current DOM structure as a parsed JSON tree
     * @return Map representing the DOM structure with nodes, attributes, and hierarchy
     */
    Map<String, Object> captureDomSnapshot();
    
    /**
     * Captures a screenshot of the current page
     * @return byte array containing the screenshot image data
     */
    byte[] captureScreenshot();
    
    /**
     * Captures DOM snapshot with additional metadata
     * @param includeComputedStyles whether to include computed CSS styles
     * @param includeEventListeners whether to include event listener information
     * @return Enhanced DOM snapshot with additional metadata
     */
    Map<String, Object> captureDomSnapshot(boolean includeComputedStyles, boolean includeEventListeners);
    
    /**
     * Gets the current page URL
     * @return Current page URL
     */
    String getCurrentUrl();
    
    /**
     * Gets browser information for context
     * @return Map containing browser name, version, and other details
     */
    Map<String, String> getBrowserInfo();
    
    /**
     * Evaluates JavaScript expression and returns result
     * @param expression JavaScript expression to evaluate
     * @return Result of the JavaScript evaluation
     */
    Object evaluateJavaScript(String expression);
    
    /**
     * Checks if CDP connection is available and working
     * @return true if CDP is available, false otherwise
     */
    boolean isAvailable();
    
    /**
     * Initializes the CDP connection
     */
    void initialize();
    
    /**
     * Closes the CDP connection and cleans up resources
     */
    void close();
}