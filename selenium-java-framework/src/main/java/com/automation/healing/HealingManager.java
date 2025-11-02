package com.automation.healing;

import com.automation.healing.models.CandidateLocator;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import java.util.List;
import java.util.Optional;
import java.util.function.Supplier;

/**
 * HealingManager - Interface for the core healing orchestrator
 * Manages the complete healing workflow from detection to retry
 */
public interface HealingManager {
    
    /**
     * Attempts to heal a failed locator and retry the operation
     * @param originalLocator The failed locator
     * @param action The action that failed (for context)
     * @return Optional containing the healed WebElement if successful
     */
    Optional<WebElement> healAndRetry(By originalLocator, String action);
    
    /**
     * Attempts to heal a failed locator and retry with a custom action
     * @param originalLocator The failed locator
     * @param actionSupplier Function that performs the action on the healed element
     * @return Optional containing the result of the action if successful
     */
    <T> Optional<T> healAndRetry(By originalLocator, Supplier<T> actionSupplier);
    
    /**
     * Heals a locator without retrying the action (suggestion only)
     * @param originalLocator The failed locator
     * @param context Additional context about the failure
     * @return List of healing suggestions
     */
    List<CandidateLocator> healLocator(By originalLocator, String context);
    
    /**
     * Records a successful element interaction for future healing reference
     * @param locator The locator that worked
     * @param elementName The logical name of the element
     * @param pageName The page where the element is located
     */
    void recordSuccessfulInteraction(By locator, String elementName, String pageName);
    
    /**
     * Gets the healing statistics for monitoring
     * @return Map containing healing statistics
     */
    java.util.Map<String, Object> getHealingStatistics();
    
    /**
     * Enables or disables the healing functionality
     * @param enabled Whether healing should be active
     */
    void setHealingEnabled(boolean enabled);
    
    /**
     * Checks if healing is currently enabled
     * @return true if healing is enabled, false otherwise
     */
    boolean isHealingEnabled();
    
    /**
     * Sets the healing mode (auto, suggest-only)
     * @param mode The healing mode
     */
    void setHealingMode(String mode);
    
    /**
     * Gets the current healing mode
     * @return The current healing mode
     */
    String getHealingMode();
    
    /**
     * Sets the confidence threshold for auto-healing
     * @param threshold The confidence threshold (0.0 to 1.0)
     */
    void setConfidenceThreshold(double threshold);
    
    /**
     * Gets the current confidence threshold
     * @return The confidence threshold
     */
    double getConfidenceThreshold();
    
    /**
     * Initializes the healing manager with the provided WebDriver
     * @param driver The WebDriver instance to use
     */
    void initialize(WebDriver driver);
    
    /**
     * Shuts down the healing manager and releases resources
     */
    void shutdown();
}