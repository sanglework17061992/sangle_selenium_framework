package com.automation.healing.repository;

import com.automation.healing.models.HealingEvent;
import com.automation.healing.models.LocatorEntry;

import java.util.List;
import java.util.Optional;

/**
 * LocatorRepository - Interface for managing locator storage and retrieval
 * Handles baseline locators, healing suggestions, and locator history
 */
public interface LocatorRepository {
    
    /**
     * Gets a locator entry by ID
     * @param id The locator ID (usually elementName or pageClass.elementName)
     * @return Optional containing the locator entry if found
     */
    Optional<LocatorEntry> get(String id);
    
    /**
     * Gets a locator entry by XPath or other locator value
     * @param locatorValue The locator value (xpath, css, id, etc.)
     * @return Optional containing the locator entry if found
     */
    Optional<LocatorEntry> getByLocator(String locatorValue);
    
    /**
     * Saves or updates a locator entry
     * @param entry The locator entry to save
     */
    void save(LocatorEntry entry);
    
    /**
     * Saves a healing suggestion for later review
     * @param healingEvent The healing event containing the suggestion
     */
    void saveHealingSuggestion(HealingEvent healingEvent);
    
    /**
     * Gets all locator entries for a specific page
     * @param pageName The page class name
     * @return List of locator entries for the page
     */
    List<LocatorEntry> getByPage(String pageName);
    
    /**
     * Gets all healing suggestions that haven't been reviewed
     * @return List of pending healing events
     */
    List<HealingEvent> getPendingSuggestions();
    
    /**
     * Marks a healing suggestion as reviewed (accepted or rejected)
     * @param eventId The healing event ID
     * @param accepted Whether the suggestion was accepted
     * @param reviewer Who reviewed the suggestion
     */
    void reviewSuggestion(String eventId, boolean accepted, String reviewer);
    
    /**
     * Updates locator attributes snapshot after successful element interaction
     * @param locatorId The locator ID
     * @param newAttributes The current element attributes
     */
    void updateAttributesSnapshot(String locatorId, java.util.Map<String, Object> newAttributes);
    
    /**
     * Gets all locator entries
     * @return List of all locator entries
     */
    List<LocatorEntry> getAll();
    
    /**
     * Deletes a locator entry
     * @param id The locator ID to delete
     * @return true if deleted, false if not found
     */
    boolean delete(String id);
    
    /**
     * Searches for locator entries by partial match
     * @param searchTerm The search term to match against ID, page, or locator value
     * @return List of matching locator entries
     */
    List<LocatorEntry> search(String searchTerm);
    
    /**
     * Gets statistics about the repository
     * @return Map containing repository statistics
     */
    java.util.Map<String, Object> getStatistics();
    
    /**
     * Initializes the repository (creates files/tables if needed)
     */
    void initialize();
    
    /**
     * Backs up the repository data
     * @param backupPath Path where to create the backup
     * @return true if backup successful
     */
    boolean backup(String backupPath);
    
    /**
     * Restores repository data from backup
     * @param backupPath Path to the backup file
     * @return true if restore successful
     */
    boolean restore(String backupPath);
}