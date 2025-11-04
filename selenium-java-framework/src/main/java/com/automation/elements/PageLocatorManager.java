package com.automation.elements;

import com.automation.core.HealingEnvironmentConfig;
import com.automation.utils.LoggerUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.type.TypeFactory;
import org.openqa.selenium.By;

import java.io.File;
import java.io.IOException;
import java.io.RandomAccessFile;
import java.nio.channels.FileChannel;
import java.nio.channels.FileLock;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * PageLocatorManager - Manages page locators from JSON files
 * Provides loading, saving, and updating of locator definitions
 * Supports healing locator persistence for performance optimization
 */
public class PageLocatorManager {
    
    private static PageLocatorManager instance;
    private final ObjectMapper objectMapper;
    private final Map<String, Map<String, LocatorDefinition>> pageLocators;
    private final Map<String, Map<String, LocatorDefinition>> inMemoryHealedLocators; // For CI/CD parallel
    private final String locatorsDirectory;
    private final HealingEnvironmentConfig envConfig;
    
    private PageLocatorManager() {
        this.objectMapper = new ObjectMapper();
        this.pageLocators = new ConcurrentHashMap<>();
        this.inMemoryHealedLocators = new ConcurrentHashMap<>(); // Parallel execution storage
        this.locatorsDirectory = "src/main/resources/locators";
        this.envConfig = HealingEnvironmentConfig.getInstance();
        
        // Ensure locators directory exists
        createLocatorsDirectory();
        
        // Load all page locators on initialization
        loadAllPageLocators();
        
        LoggerUtil.info("PageLocatorManager initialized for environment: " + envConfig.getExecutionMode());
    }
    
    public static synchronized PageLocatorManager getInstance() {
        if (instance == null) {
            instance = new PageLocatorManager();
        }
        return instance;
    }
    
    /**
     * Save locators with file locking for parallel execution
     */    /**
     * Create Selenium By locator from LocatorDefinition
     */
    public By createByLocator(LocatorDefinition definition) {
        if (definition == null) {
            return null;
        }
        
        String type = definition.getLocatorType().toLowerCase();
        String value = definition.getLocatorValue();
        
        switch (type) {
            case "id":
                return By.id(value);
            case "name":
                return By.name(value);
            case "classname":
            case "class":
                return By.className(value);
            case "css":
            case "cssselector":
                return By.cssSelector(value);
            case "xpath":
                return By.xpath(value);
            case "linktext":
                return By.linkText(value);
            case "partiallinktext":
                return By.partialLinkText(value);
            case "tagname":
                return By.tagName(value);
            default:
                LoggerUtil.warn("Unknown locator type: " + type + ". Defaulting to CSS selector.");
                return By.cssSelector(value);
        }
    }
    
    /**
     * Update locator definition after successful healing
     * Handles different storage modes based on environment
     */
    public void updateHealedLocator(String pageName, String elementId, By newLocator) {
        LocatorDefinition definition = getLocatorDefinition(pageName, elementId);
        if (definition != null) {
            String[] locatorInfo = extractLocatorInfo(newLocator);
            String originalLocator = definition.getLocatorType() + "=" + definition.getLocatorValue();
            String newLocatorString = locatorInfo[0] + "=" + locatorInfo[1];
            
            definition.markAsHealed(locatorInfo[0], locatorInfo[1]);
            
            // Handle different storage modes based on environment
            String storageMode = envConfig.getHealingStorageMode();
            
            switch (storageMode) {
                case "memory":
                    // CI/CD parallel - store only in memory
                    storeInMemory(pageName, elementId, definition);
                    LoggerUtil.info(String.format("Stored healed locator in memory for %s.%s: %s", 
                            pageName, elementId, newLocator));
                    break;
                    
                case "file_locked":
                    // Local parallel - use file locking and update JSON
                    updateJsonFileWithHealing(pageName, elementId, newLocatorString, originalLocator);
                    savePageLocatorsWithLock(pageName);
                    LoggerUtil.info(String.format("Saved healed locator with lock for %s.%s: %s", 
                            pageName, elementId, newLocator));
                    break;
                    
                case "file":
                default:
                    // Sequential execution - direct file save and JSON update
                    if (envConfig.isHealingPersistenceEnabled()) {
                        updateJsonFileWithHealing(pageName, elementId, newLocatorString, originalLocator);
                        savePageLocators(pageName);
                        LoggerUtil.info(String.format("Saved healed locator to file for %s.%s: %s", 
                                pageName, elementId, newLocator));
                    }
                    break;
            }
        }
    }
    
    /**
     * Update the JSON file with healed locator information
     */
    private void updateJsonFileWithHealing(String pageName, String elementId, String newLocator, String originalLocator) {
        try {
            File jsonFile = new File(locatorsDirectory, pageName + ".json");
            if (!jsonFile.exists()) {
                LoggerUtil.warn("JSON file not found for healing update: " + pageName);
                return;
            }
            
            // Try to load as new format (PageDefinition)
            PageDefinition pageDefinition = null;
            try {
                pageDefinition = objectMapper.readValue(jsonFile, PageDefinition.class);
                
                if (pageDefinition.getElements() != null && pageDefinition.getElements().containsKey(elementId)) {
                    PageDefinition.ElementDefinition element = pageDefinition.getElements().get(elementId);
                    
                    // Update the element with healing information
                    element.updateAfterHealing(newLocator, originalLocator);
                    
                    // Update page metadata
                    pageDefinition.setLastUpdated(java.time.Instant.now().toString());
                    
                    // Save back to JSON file
                    objectMapper.writerWithDefaultPrettyPrinter().writeValue(jsonFile, pageDefinition);
                    
                    LoggerUtil.info(String.format("Updated JSON file with healed locator: %s.%s -> %s", 
                            pageName, elementId, newLocator));
                    return;
                }
            } catch (Exception e) {
                LoggerUtil.warn("Failed to read/update new format JSON for " + pageName + ": " + e.getMessage());
                LoggerUtil.debug("New format error details: " + e.toString());
            }
            
            // For legacy format, we just update the in-memory structure
            // The healing information is saved through the normal savePageLocators method
            LoggerUtil.debug("Using legacy format for healing persistence: " + pageName);
            
        } catch (Exception e) {
            LoggerUtil.error("Failed to update JSON file with healing info for " + pageName + "." + elementId, e);
        }
    }
    
    /**
     * Store healed locator in memory for parallel execution
     */
    private void storeInMemory(String pageName, String elementId, LocatorDefinition definition) {
        inMemoryHealedLocators.computeIfAbsent(pageName, k -> new ConcurrentHashMap<>())
                              .put(elementId, definition);
    }
    
    /**
     * Get locator definition with memory fallback for parallel execution
     */
    public LocatorDefinition getLocatorDefinition(String pageName, String elementId) {
        // First check in-memory healed locators (for parallel CI/CD)
        Map<String, LocatorDefinition> memoryPageMap = inMemoryHealedLocators.get(pageName);
        if (memoryPageMap != null) {
            LocatorDefinition memoryDefinition = memoryPageMap.get(elementId);
            if (memoryDefinition != null && memoryDefinition.isHealed()) {
                return memoryDefinition;
            }
        }
        
        // Then check regular loaded locators
        Map<String, LocatorDefinition> pageMap = pageLocators.get(pageName);
        if (pageMap != null) {
            return pageMap.get(elementId);
        }
        return null;
    }
    
    /**
     * Save locators with file locking for parallel execution
     */
    private void savePageLocatorsWithLock(String pageName) {
        Map<String, LocatorDefinition> pageMap = pageLocators.get(pageName);
        if (pageMap != null) {
            File file = new File(locatorsDirectory, pageName + ".json");
            File lockFile = new File(locatorsDirectory, pageName + ".lock");
            
            try (RandomAccessFile raf = new RandomAccessFile(lockFile, "rw");
                 FileChannel channel = raf.getChannel()) {
                
                // Try to acquire lock with timeout
                FileLock lock = null;
                long startTime = System.currentTimeMillis();
                long timeout = envConfig.getHealingLockTimeout();
                
                while (lock == null && (System.currentTimeMillis() - startTime) < timeout) {
                    try {
                        lock = channel.tryLock();
                        if (lock == null) {
                            Thread.sleep(100); // Wait 100ms before retry
                        }
                    } catch (Exception e) {
                        // Lock acquisition failed, retry
                        Thread.sleep(100);
                    }
                }
                
                if (lock != null) {
                    try {
                        // Write to file while holding lock
                        objectMapper.writerWithDefaultPrettyPrinter()
                                   .writeValue(file, pageMap.values());
                        
                        LoggerUtil.debug("Saved " + pageMap.size() + " locators for page: " + pageName + " (with lock)");
                    } finally {
                        lock.release();
                    }
                } else {
                    LoggerUtil.warn("Could not acquire lock for saving locators: " + pageName);
                }
                
            } catch (Exception e) {
                LoggerUtil.error("Failed to save locators with lock for page: " + pageName, e);
                // Fallback to regular save
                savePageLocators(pageName);
            } finally {
                // Clean up lock file
                if (lockFile.exists()) {
                    lockFile.delete();
                }
            }
        }
    }
    
    /**
     * Add or update locator definition
     */
    public void addOrUpdateLocator(LocatorDefinition definition) {
        pageLocators.computeIfAbsent(definition.getPage(), k -> new ConcurrentHashMap<>())
                   .put(definition.getId(), definition);
        
        // Save to file
        savePageLocators(definition.getPage());
    }
    
    /**
     * Load all page locators from JSON files
     */
    private void loadAllPageLocators() {
        File locatorsDir = new File(locatorsDirectory);
        if (!locatorsDir.exists()) {
            LoggerUtil.info("Locators directory not found. Creating: " + locatorsDirectory);
            return;
        }
        
        File[] jsonFiles = locatorsDir.listFiles((dir, name) -> name.endsWith(".json"));
        if (jsonFiles != null) {
            for (File jsonFile : jsonFiles) {
                String pageName = jsonFile.getName().replace(".json", "");
                loadPageLocators(pageName);
            }
        }
        
        LoggerUtil.info("Loaded locators for " + pageLocators.size() + " pages");
    }
    
    /**
     * Load locators for a specific page
     */
    private void loadPageLocators(String pageName) {
        try {
            File file = new File(locatorsDirectory, pageName + ".json");
            if (file.exists()) {
                // Try to load new format first (PageDefinition)
                if (loadNewFormatLocators(file, pageName)) {
                    LoggerUtil.debug("Loaded new format locators for page: " + pageName);
                    return;
                }
                
                // Fallback to old format (List<LocatorDefinition>)
                loadLegacyFormatLocators(file, pageName);
            }
        } catch (IOException e) {
            LoggerUtil.error("Failed to load locators for page: " + pageName, e);
        }
    }
    
    /**
     * Load new JSON format (PageDefinition with elements structure)
     */
    private boolean loadNewFormatLocators(File file, String pageName) throws IOException {
        try {
            PageDefinition pageDefinition = objectMapper.readValue(file, PageDefinition.class);
            
            if (pageDefinition.getElements() != null) {
                Map<String, LocatorDefinition> pageMap = new ConcurrentHashMap<>();
                
                for (Map.Entry<String, PageDefinition.ElementDefinition> entry : pageDefinition.getElements().entrySet()) {
                    String elementId = entry.getKey();
                    PageDefinition.ElementDefinition elementDef = entry.getValue();
                    
                    // Convert to LocatorDefinition for compatibility
                    LocatorDefinition locatorDef = elementDef.toLocatorDefinition(elementId, pageName);
                    pageMap.put(elementId, locatorDef);
                }
                
                pageLocators.put(pageName, pageMap);
                LoggerUtil.debug("Loaded " + pageMap.size() + " locators for page: " + pageName + " (new format)");
                return true;
            }
        } catch (Exception e) {
            LoggerUtil.debug("Not new format, trying legacy format for page: " + pageName);
        }
        return false;
    }
    
    /**
     * Load legacy JSON format (List<LocatorDefinition>)
     */
    private void loadLegacyFormatLocators(File file, String pageName) throws IOException {
        TypeFactory typeFactory = objectMapper.getTypeFactory();
        List<LocatorDefinition> definitions = objectMapper.readValue(file, 
                typeFactory.constructCollectionType(List.class, LocatorDefinition.class));
        
        Map<String, LocatorDefinition> pageMap = new ConcurrentHashMap<>();
        for (LocatorDefinition definition : definitions) {
            pageMap.put(definition.getId(), definition);
        }
        
        pageLocators.put(pageName, pageMap);
        LoggerUtil.debug("Loaded " + definitions.size() + " locators for page: " + pageName + " (legacy format)");
    }
    
    /**
     * Save locators for a specific page
     */
    private void savePageLocators(String pageName) {
        try {
            Map<String, LocatorDefinition> pageMap = pageLocators.get(pageName);
            if (pageMap != null) {
                File file = new File(locatorsDirectory, pageName + ".json");
                objectMapper.writerWithDefaultPrettyPrinter()
                           .writeValue(file, pageMap.values());
                
                LoggerUtil.debug("Saved " + pageMap.size() + " locators for page: " + pageName);
            }
        } catch (IOException e) {
            LoggerUtil.error("Failed to save locators for page: " + pageName, e);
        }
    }
    
    /**
     * Create locators directory if it doesn't exist
     */
    private void createLocatorsDirectory() {
        try {
            File dir = new File(locatorsDirectory);
            if (!dir.exists()) {
                dir.mkdirs();
                LoggerUtil.info("Created locators directory: " + locatorsDirectory);
            }
        } catch (Exception e) {
            LoggerUtil.error("Failed to create locators directory", e);
        }
    }
    
    /**
     * Extract locator type and value from Selenium By object
     */
    private String[] extractLocatorInfo(By locator) {
        String locatorString = locator.toString();
        
        if (locatorString.startsWith("By.id: ")) {
            return new String[]{"id", locatorString.substring(7)};
        } else if (locatorString.startsWith("By.name: ")) {
            return new String[]{"name", locatorString.substring(9)};
        } else if (locatorString.startsWith("By.className: ")) {
            return new String[]{"className", locatorString.substring(14)};
        } else if (locatorString.startsWith("By.cssSelector: ")) {
            return new String[]{"css", locatorString.substring(16)};
        } else if (locatorString.startsWith("By.xpath: ")) {
            return new String[]{"xpath", locatorString.substring(10)};
        } else if (locatorString.startsWith("By.linkText: ")) {
            return new String[]{"linkText", locatorString.substring(13)};
        } else if (locatorString.startsWith("By.partialLinkText: ")) {
            return new String[]{"partialLinkText", locatorString.substring(20)};
        } else if (locatorString.startsWith("By.tagName: ")) {
            return new String[]{"tagName", locatorString.substring(12)};
        } else {
            // Default to CSS if we can't parse
            return new String[]{"css", locatorString};
        }
    }
    
    /**
     * Get all locators for a page
     */
    public Map<String, LocatorDefinition> getPageLocators(String pageName) {
        return pageLocators.getOrDefault(pageName, new HashMap<>());
    }
    
    /**
     * Check if a locator has been healed
     */
    public boolean isLocatorHealed(String pageName, String elementId) {
        LocatorDefinition definition = getLocatorDefinition(pageName, elementId);
        return definition != null && definition.isHealed();
    }
    
    /**
     * Get healing statistics
     */
    public Map<String, Object> getHealingStats() {
        Map<String, Object> stats = new HashMap<>();
        int totalLocators = 0;
        int healedLocators = 0;
        
        for (Map<String, LocatorDefinition> pageMap : pageLocators.values()) {
            for (LocatorDefinition definition : pageMap.values()) {
                totalLocators++;
                if (definition.isHealed()) {
                    healedLocators++;
                }
            }
        }
        
        stats.put("totalLocators", totalLocators);
        stats.put("healedLocators", healedLocators);
        stats.put("healingRate", totalLocators > 0 ? (double) healedLocators / totalLocators * 100 : 0);
        stats.put("pagesWithLocators", pageLocators.size());
        
        return stats;
    }
}