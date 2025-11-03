package com.automation.healing.repository;

import com.automation.healing.models.HealingEvent;
import com.automation.healing.models.LocatorEntry;
import com.automation.healing.models.LocatorHistoryEntry;
import com.automation.utils.LoggerUtil;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * JsonLocatorRepository - JSON file-based implementation of LocatorRepository
 * Stores locator data in JSON files for persistence
 */
public class JsonLocatorRepository implements LocatorRepository {
    
    private static final String DEFAULT_LOCATORS_FILE = "healing/locator_repository.json";
    private static final String DEFAULT_SUGGESTIONS_FILE = "healing/healing_suggestions.json";
    private static final String BACKUP_DIR = "healing/backups";
    
    private final String locatorsFilePath;
    private final String suggestionsFilePath;
    private final ObjectMapper objectMapper;
    private final Map<String, LocatorEntry> locatorCache;
    private final Map<String, HealingEvent> suggestionsCache;
    
    // Constructors
    public JsonLocatorRepository() {
        this(DEFAULT_LOCATORS_FILE, DEFAULT_SUGGESTIONS_FILE);
    }
    
    public JsonLocatorRepository(String locatorsFilePath, String suggestionsFilePath) {
        this.locatorsFilePath = locatorsFilePath;
        this.suggestionsFilePath = suggestionsFilePath;
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
        this.locatorCache = new ConcurrentHashMap<>();
        this.suggestionsCache = new ConcurrentHashMap<>();
        initialize();
    }
    
    @Override
    public void initialize() {
        try {
            // Create directories if they don't exist
            createDirectoryIfNotExists(locatorsFilePath);
            createDirectoryIfNotExists(suggestionsFilePath);
            createDirectoryIfNotExists(BACKUP_DIR + "/dummy.txt");
            
            // Load existing data
            loadLocators();
            loadSuggestions();
            
            LoggerUtil.info("JsonLocatorRepository initialized successfully");
        } catch (Exception e) {
            LoggerUtil.error("Failed to initialize JsonLocatorRepository: " + e.getMessage(), e);
        }
    }
    
    @Override
    public Optional<LocatorEntry> get(String id) {
        return Optional.ofNullable(locatorCache.get(id));
    }
    
    @Override
    public Optional<LocatorEntry> getByLocator(String locatorValue) {
        return locatorCache.values().stream()
                .filter(entry -> entry.getOriginalLocator() != null && 
                        locatorValue.equals(entry.getOriginalLocator().getValue()))
                .findFirst();
    }
    
    @Override
    public void save(LocatorEntry entry) {
        if (entry == null || entry.getId() == null) {
            LoggerUtil.warn("Cannot save null entry or entry with null ID");
            return;
        }
        
        entry.updateLastSeen();
        locatorCache.put(entry.getId(), entry);
        persistLocators();
        LoggerUtil.info("Saved locator entry: " + entry.getId());
    }
    
    @Override
    public void saveHealingSuggestion(HealingEvent healingEvent) {
        if (healingEvent == null || healingEvent.getEventId() == null) {
            LoggerUtil.warn("Cannot save null healing event or event with null ID");
            return;
        }
        
        suggestionsCache.put(healingEvent.getEventId(), healingEvent);
        persistSuggestions();
        LoggerUtil.info("Saved healing suggestion: " + healingEvent.getEventId());
    }
    
    @Override
    public List<LocatorEntry> getByPage(String pageName) {
        return locatorCache.values().stream()
                .filter(entry -> pageName.equals(entry.getPage()))
                .collect(Collectors.toList());
    }
    
    @Override
    public List<HealingEvent> getPendingSuggestions() {
        return suggestionsCache.values().stream()
                .filter(event -> "suggested".equalsIgnoreCase(event.getStatus()))
                .collect(Collectors.toList());
    }
    
    @Override
    public void reviewSuggestion(String eventId, boolean accepted, String reviewer) {
        HealingEvent event = suggestionsCache.get(eventId);
        if (event != null) {
            event.setStatus(accepted ? "accepted" : "rejected");
            event.addArtifact("reviewer", reviewer);
            event.addArtifact("reviewDate", LocalDateTime.now().toString());
            persistSuggestions();
            LoggerUtil.info("Reviewed suggestion " + eventId + ": " + (accepted ? "accepted" : "rejected"));
        }
    }
    
    @Override
    public void updateAttributesSnapshot(String locatorId, Map<String, Object> newAttributes) {
        LocatorEntry entry = locatorCache.get(locatorId);
        if (entry != null) {
            entry.updateAttributes(newAttributes);
            
            // Add to history
            LocatorHistoryEntry historyEntry = new LocatorHistoryEntry();
            historyEntry.setEventType("UPDATED");
            historyEntry.setReason("Attributes updated after successful interaction");
            historyEntry.setSuccess(true);
            entry.addToHistory(historyEntry);
            
            persistLocators();
            LoggerUtil.debug("Updated attributes for locator: " + locatorId);
        }
    }
    
    @Override
    public List<LocatorEntry> getAll() {
        return new ArrayList<>(locatorCache.values());
    }
    
    @Override
    public boolean delete(String id) {
        LocatorEntry removed = locatorCache.remove(id);
        if (removed != null) {
            persistLocators();
            LoggerUtil.info("Deleted locator entry: " + id);
            return true;
        }
        return false;
    }
    
    @Override
    public List<LocatorEntry> search(String searchTerm) {
        String lowerSearchTerm = searchTerm.toLowerCase();
        return locatorCache.values().stream()
                .filter(entry -> 
                    (entry.getId() != null && entry.getId().toLowerCase().contains(lowerSearchTerm)) ||
                    (entry.getPage() != null && entry.getPage().toLowerCase().contains(lowerSearchTerm)) ||
                    (entry.getOriginalLocator() != null && entry.getOriginalLocator().getValue() != null && 
                     entry.getOriginalLocator().getValue().toLowerCase().contains(lowerSearchTerm)))
                .collect(Collectors.toList());
    }
    
    @Override
    public Map<String, Object> getStatistics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalLocators", locatorCache.size());
        stats.put("totalSuggestions", suggestionsCache.size());
        stats.put("pendingSuggestions", getPendingSuggestions().size());
        
        // Count by page
        Map<String, Long> pageStats = locatorCache.values().stream()
                .collect(Collectors.groupingBy(
                    entry -> entry.getPage() != null ? entry.getPage() : "unknown",
                    Collectors.counting()));
        stats.put("locatorsByPage", pageStats);
        
        // Active vs inactive
        long activeCount = locatorCache.values().stream()
                .mapToLong(entry -> entry.isActive() ? 1 : 0)
                .sum();
        stats.put("activeLocators", activeCount);
        stats.put("inactiveLocators", locatorCache.size() - activeCount);
        
        return stats;
    }
    
    @Override
    public boolean backup(String backupPath) {
        try {
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String backupDir = backupPath != null ? backupPath : BACKUP_DIR;
            
            Path backupDirPath = Paths.get(backupDir);
            Files.createDirectories(backupDirPath);
            
            // Backup locators
            Path locatorsBackup = backupDirPath.resolve("locators_" + timestamp + ".json");
            Files.copy(Paths.get(locatorsFilePath), locatorsBackup, StandardCopyOption.REPLACE_EXISTING);
            
            // Backup suggestions
            Path suggestionsBackup = backupDirPath.resolve("suggestions_" + timestamp + ".json");
            Files.copy(Paths.get(suggestionsFilePath), suggestionsBackup, StandardCopyOption.REPLACE_EXISTING);
            
            LoggerUtil.info("Repository backed up to: " + backupDir);
            return true;
        } catch (Exception e) {
            LoggerUtil.error("Failed to backup repository: " + e.getMessage(), e);
            return false;
        }
    }
    
    @Override
    public boolean restore(String backupPath) {
        try {
            // Restore locators
            Path locatorsBackup = Paths.get(backupPath, "locators.json");
            if (Files.exists(locatorsBackup)) {
                Files.copy(locatorsBackup, Paths.get(locatorsFilePath), StandardCopyOption.REPLACE_EXISTING);
            }
            
            // Restore suggestions
            Path suggestionsBackup = Paths.get(backupPath, "suggestions.json");
            if (Files.exists(suggestionsBackup)) {
                Files.copy(suggestionsBackup, Paths.get(suggestionsFilePath), StandardCopyOption.REPLACE_EXISTING);
            }
            
            // Reload data
            loadLocators();
            loadSuggestions();
            
            LoggerUtil.info("Repository restored from: " + backupPath);
            return true;
        } catch (Exception e) {
            LoggerUtil.error("Failed to restore repository: " + e.getMessage(), e);
            return false;
        }
    }
    
    // Private helper methods
    private void createDirectoryIfNotExists(String filePath) throws IOException {
        Path path = Paths.get(filePath).getParent();
        if (path != null && !Files.exists(path)) {
            Files.createDirectories(path);
        }
    }
    
    private void loadLocators() {
        try {
            File file = new File(locatorsFilePath);
            if (file.exists()) {
                List<LocatorEntry> entries = objectMapper.readValue(file, 
                    new TypeReference<List<LocatorEntry>>() {});
                locatorCache.clear();
                for (LocatorEntry entry : entries) {
                    locatorCache.put(entry.getId(), entry);
                }
                LoggerUtil.info("Loaded " + entries.size() + " locator entries");
            } else {
                LoggerUtil.info("No existing locator file found, starting with empty repository");
            }
        } catch (Exception e) {
            LoggerUtil.error("Failed to load locators: " + e.getMessage(), e);
        }
    }
    
    private void loadSuggestions() {
        try {
            File file = new File(suggestionsFilePath);
            if (file.exists()) {
                List<HealingEvent> events = objectMapper.readValue(file, 
                    new TypeReference<List<HealingEvent>>() {});
                suggestionsCache.clear();
                for (HealingEvent event : events) {
                    suggestionsCache.put(event.getEventId(), event);
                }
                LoggerUtil.info("Loaded " + events.size() + " healing suggestions");
            } else {
                LoggerUtil.info("No existing suggestions file found, starting with empty suggestions");
            }
        } catch (Exception e) {
            LoggerUtil.error("Failed to load suggestions: " + e.getMessage(), e);
        }
    }
    
    private void persistLocators() {
        try {
            List<LocatorEntry> entries = new ArrayList<>(locatorCache.values());
            objectMapper.writerWithDefaultPrettyPrinter().writeValue(new File(locatorsFilePath), entries);
        } catch (Exception e) {
            LoggerUtil.error("Failed to persist locators: " + e.getMessage(), e);
        }
    }
    
    private void persistSuggestions() {
        try {
            List<HealingEvent> events = new ArrayList<>(suggestionsCache.values());
            objectMapper.writerWithDefaultPrettyPrinter().writeValue(new File(suggestionsFilePath), events);
        } catch (Exception e) {
            LoggerUtil.error("Failed to persist suggestions: " + e.getMessage(), e);
        }
    }
}