package com.automation.healing;

import com.automation.healing.analyzer.Analyzer;
import com.automation.healing.analyzer.SmartAnalyzer;
import com.automation.healing.connector.CdpConnector;
import com.automation.healing.connector.ChromeCdpConnector;
import com.automation.healing.models.*;
import com.automation.healing.repository.JsonLocatorRepository;
import com.automation.healing.repository.LocatorRepository;
import com.automation.healing.reporter.HealingReporter;
import com.automation.healing.reporter.AllureHealingReporter;
import com.automation.utils.LoggerUtil;
import org.openqa.selenium.By;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.atomic.AtomicLong;
import java.util.function.Supplier;

/**
 * SmartHealingManager - Main implementation of the healing orchestrator
 * Coordinates all healing components and manages the complete workflow
 */
public class SmartHealingManager implements HealingManager {
    
    private static final String AUTO_MODE = "auto";
    private static final String SUGGEST_ONLY_MODE = "suggest-only";
    private static final String EVENT_ID_PREFIX = "heal-";
    private static final DateTimeFormatter EVENT_ID_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss-SSS");
    
    private WebDriver driver;
    private CdpConnector cdpConnector;
    private LocatorRepository repository;
    private Analyzer analyzer;
    private HealingReporter reporter;
    
    // Configuration
    private boolean healingEnabled = true;
    private String healingMode = AUTO_MODE;
    private double confidenceThreshold = 0.75;
    private int maxCandidates = 5;
    private long healingTimeout = 10000; // 10 seconds
    
    // Statistics
    private final AtomicLong totalHealingAttempts = new AtomicLong(0);
    private final AtomicLong successfulHealings = new AtomicLong(0);
    private final AtomicLong failedHealings = new AtomicLong(0);
    private final AtomicLong suggestionsGenerated = new AtomicLong(0);
    
    // Singleton instance
    private static volatile SmartHealingManager instance;
    private static final Object LOCK = new Object();
    
    // Constructor
    private SmartHealingManager() {
        // Private constructor for singleton
    }
    
    /**
     * Gets the singleton instance of HealingManager
     */
    public static SmartHealingManager getInstance() {
        if (instance == null) {
            synchronized (LOCK) {
                if (instance == null) {
                    instance = new SmartHealingManager();
                }
            }
        }
        return instance;
    }
    
    @Override
    public void initialize(WebDriver driver) {
        if (driver == null) {
            throw new IllegalArgumentException("WebDriver cannot be null");
        }
        
        this.driver = driver;
        
        try {
            // Initialize components
            this.cdpConnector = new ChromeCdpConnector(driver);
            this.cdpConnector.initialize();
            
            this.repository = new JsonLocatorRepository();
            this.analyzer = new SmartAnalyzer();
            this.analyzer.setConfidenceThreshold(confidenceThreshold);
            
            this.reporter = new AllureHealingReporter();
            
            LoggerUtil.info("HealingManager initialized successfully");
        } catch (Exception e) {
            LoggerUtil.error("Failed to initialize HealingManager: " + e.getMessage(), e);
            throw new RuntimeException("HealingManager initialization failed", e);
        }
    }
    
    @Override
    public Optional<WebElement> healAndRetry(By originalLocator, String action) {
        return healAndRetry(originalLocator, () -> {
            try {
                return driver.findElement(originalLocator);
            } catch (NoSuchElementException e) {
                return null;
            }
        });
    }
    
    @Override
    public <T> Optional<T> healAndRetry(By originalLocator, Supplier<T> actionSupplier) {
        if (!isHealingEnabled() || driver == null) {
            return Optional.empty();
        }
        
        totalHealingAttempts.incrementAndGet();
        
        long startTime = System.currentTimeMillis();
        String eventId = generateEventId();
        
        try {
            LoggerUtil.info("Starting healing process for locator: " + originalLocator);
            
            // Get or create locator entry
            LocatorEntry locatorEntry = getOrCreateLocatorEntry(originalLocator);
            
            // Capture DOM snapshot
            Map<String, Object> domSnapshot = captureDomSnapshot();
            if (domSnapshot == null) {
                LoggerUtil.warn("Failed to capture DOM snapshot, aborting healing");
                return Optional.empty();
            }
            
            // Find candidate locators
            List<CandidateLocator> candidates = analyzer.findCandidates(locatorEntry, domSnapshot, maxCandidates);
            
            if (candidates.isEmpty()) {
                LoggerUtil.warn("No healing candidates found for locator: " + originalLocator);
                recordFailedHealing(eventId, originalLocator, "No candidates found", startTime);
                return Optional.empty();
            }
            
            LoggerUtil.info("Found " + candidates.size() + " healing candidates");
            
            // Try candidates in order of confidence
            for (CandidateLocator candidate : candidates) {
                if (candidate.getScore() >= confidenceThreshold || SUGGEST_ONLY_MODE.equals(healingMode)) {
                    
                    if (AUTO_MODE.equals(healingMode) && candidate.getScore() >= confidenceThreshold) {
                        // Auto-heal: try the candidate
                        Optional<T> result = tryCandidate(candidate, actionSupplier);
                        if (result.isPresent()) {
                            recordSuccessfulHealing(eventId, originalLocator, candidate, startTime);
                            return result;
                        }
                    } else {
                        // Suggest-only mode: just record the suggestion
                        recordHealingSuggestion(eventId, originalLocator, candidate, startTime);
                    }
                }
            }
            
            // No successful healing
            recordFailedHealing(eventId, originalLocator, "All candidates failed", startTime);
            return Optional.empty();
            
        } catch (Exception e) {
            LoggerUtil.error("Error during healing process: " + e.getMessage(), e);
            recordFailedHealing(eventId, originalLocator, "Exception: " + e.getMessage(), startTime);
            return Optional.empty();
        }
    }
    
    @Override
    public List<CandidateLocator> healLocator(By originalLocator, String context) {
        if (!isHealingEnabled() || driver == null) {
            return new ArrayList<>();
        }
        
        try {
            LocatorEntry locatorEntry = getOrCreateLocatorEntry(originalLocator);
            Map<String, Object> domSnapshot = captureDomSnapshot();
            
            if (domSnapshot == null) {
                return new ArrayList<>();
            }
            
            List<CandidateLocator> candidates = analyzer.findCandidates(locatorEntry, domSnapshot, maxCandidates);
            suggestionsGenerated.addAndGet(candidates.size());
            
            LoggerUtil.info("Generated " + candidates.size() + " healing suggestions for: " + originalLocator);
            return candidates;
            
        } catch (Exception e) {
            LoggerUtil.error("Error generating healing suggestions: " + e.getMessage(), e);
            return new ArrayList<>();
        }
    }
    
    @Override
    public void recordSuccessfulInteraction(By locator, String elementName, String pageName) {
        if (!isHealingEnabled() || repository == null) {
            return;
        }
        
        try {
            // Get or create locator entry
            Optional<LocatorEntry> existingEntry = repository.getByLocator(locator.toString());
            LocatorEntry entry;
            
            if (existingEntry.isPresent()) {
                entry = existingEntry.get();
            } else {
                entry = new LocatorEntry(elementName, pageName, 
                    new LocatorInfo(getLocatorType(locator), locator.toString()));
            }
            
            // Capture current element attributes if possible
            try {
                WebElement element = driver.findElement(locator);
                Map<String, Object> attributes = captureElementAttributes(element);
                entry.updateAttributes(attributes);
            } catch (Exception e) {
                LoggerUtil.debug("Could not capture element attributes: " + e.getMessage());
            }
            
            // Update entry
            entry.updateLastSeen();
            entry.setActive(true);
            entry.setConfidence(1.0);
            
            // Add history entry
            LocatorHistoryEntry historyEntry = new LocatorHistoryEntry();
            historyEntry.setEventType("SUCCESSFUL_INTERACTION");
            historyEntry.setReason("Element found and interacted with successfully");
            historyEntry.setSuccess(true);
            entry.addToHistory(historyEntry);
            
            repository.save(entry);
            LoggerUtil.debug("Recorded successful interaction for: " + elementName);
            
        } catch (Exception e) {
            LoggerUtil.error("Error recording successful interaction: " + e.getMessage(), e);
        }
    }
    
    @Override
    public Map<String, Object> getHealingStatistics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalAttempts", totalHealingAttempts.get());
        stats.put("successfulHealings", successfulHealings.get());
        stats.put("failedHealings", failedHealings.get());
        stats.put("suggestionsGenerated", suggestionsGenerated.get());
        stats.put("successRate", calculateSuccessRate());
        stats.put("healingEnabled", healingEnabled);
        stats.put("healingMode", healingMode);
        stats.put("confidenceThreshold", confidenceThreshold);
        
        if (repository != null) {
            stats.putAll(repository.getStatistics());
        }
        
        return stats;
    }
    
    @Override
    public void setHealingEnabled(boolean enabled) {
        this.healingEnabled = enabled;
        LoggerUtil.info("Healing " + (enabled ? "enabled" : "disabled"));
    }
    
    @Override
    public boolean isHealingEnabled() {
        return healingEnabled;
    }
    
    @Override
    public void setHealingMode(String mode) {
        if (AUTO_MODE.equals(mode) || SUGGEST_ONLY_MODE.equals(mode)) {
            this.healingMode = mode;
            LoggerUtil.info("Healing mode set to: " + mode);
        } else {
            LoggerUtil.warn("Invalid healing mode: " + mode + ". Using default: " + AUTO_MODE);
            this.healingMode = AUTO_MODE;
        }
    }
    
    @Override
    public String getHealingMode() {
        return healingMode;
    }
    
    @Override
    public void setConfidenceThreshold(double threshold) {
        this.confidenceThreshold = Math.max(0.0, Math.min(1.0, threshold));
        if (analyzer != null) {
            analyzer.setConfidenceThreshold(this.confidenceThreshold);
        }
        LoggerUtil.info("Confidence threshold set to: " + this.confidenceThreshold);
    }
    
    @Override
    public double getConfidenceThreshold() {
        return confidenceThreshold;
    }
    
    @Override
    public void shutdown() {
        try {
            if (cdpConnector != null) {
                cdpConnector.close();
            }
            LoggerUtil.info("HealingManager shutdown completed");
        } catch (Exception e) {
            LoggerUtil.error("Error during HealingManager shutdown: " + e.getMessage(), e);
        }
    }
    
    // Private helper methods
    private String generateEventId() {
        return EVENT_ID_PREFIX + LocalDateTime.now().format(EVENT_ID_FORMAT);
    }
    
    private LocatorEntry getOrCreateLocatorEntry(By locator) {
        String locatorString = locator.toString();
        Optional<LocatorEntry> existing = repository.getByLocator(locatorString);
        
        if (existing.isPresent()) {
            return existing.get();
        } else {
            // Create new entry
            String elementId = "unknown_" + System.currentTimeMillis();
            LocatorInfo locatorInfo = new LocatorInfo(getLocatorType(locator), locatorString);
            return new LocatorEntry(elementId, "unknown", locatorInfo);
        }
    }
    
    private Map<String, Object> captureDomSnapshot() {
        if (cdpConnector == null) {
            LoggerUtil.warn("CDP connector not available");
            return null;
        }
        
        try {
            return cdpConnector.captureDomSnapshot();
        } catch (Exception e) {
            LoggerUtil.error("Failed to capture DOM snapshot: " + e.getMessage(), e);
            return null;
        }
    }
    
    private <T> Optional<T> tryCandidate(CandidateLocator candidate, Supplier<T> actionSupplier) {
        try {
            By candidateBy = candidate.toSeleniumBy();
            if (candidateBy == null) {
                return Optional.empty();
            }
            
            // Verify element exists and is usable
            WebElement element = driver.findElement(candidateBy);
            if (element != null && element.isDisplayed()) {
                // Try the action
                T result = actionSupplier.get();
                if (result != null) {
                    LoggerUtil.info("Successfully healed using candidate: " + candidate.getLocatorInfo().getValue());
                    return Optional.of(result);
                }
            }
        } catch (Exception e) {
            LoggerUtil.debug("Candidate failed: " + e.getMessage());
        }
        
        return Optional.empty();
    }
    
    private void recordSuccessfulHealing(String eventId, By originalLocator, CandidateLocator candidate, long startTime) {
        successfulHealings.incrementAndGet();
        
        HealingEvent event = createHealingEvent(eventId, originalLocator, candidate, startTime);
        event.setStatus("applied");
        
        repository.saveHealingSuggestion(event);
        
        if (reporter != null) {
            reporter.reportHealing(event);
        }
        
        LoggerUtil.info("Successful healing recorded: " + eventId);
    }
    
    private void recordHealingSuggestion(String eventId, By originalLocator, CandidateLocator candidate, long startTime) {
        suggestionsGenerated.incrementAndGet();
        
        HealingEvent event = createHealingEvent(eventId, originalLocator, candidate, startTime);
        event.setStatus("suggested");
        
        repository.saveHealingSuggestion(event);
        
        if (reporter != null) {
            reporter.reportSuggestion(event);
        }
        
        LoggerUtil.info("Healing suggestion recorded: " + eventId);
    }
    
    private void recordFailedHealing(String eventId, By originalLocator, String reason, long startTime) {
        failedHealings.incrementAndGet();
        
        HealingEvent event = new HealingEvent();
        event.setEventId(eventId);
        event.setOldLocator(originalLocator.toString());
        event.setErrorMessage(reason);
        event.setStatus("failed");
        event.setExecutionTime(System.currentTimeMillis() - startTime);
        event.setConfidence(0.0);
        event.setHealingMode(healingMode);
        
        if (cdpConnector != null) {
            event.setPageUrl(cdpConnector.getCurrentUrl());
            event.setBrowserInfo(cdpConnector.getBrowserInfo().toString());
        }
        
        repository.saveHealingSuggestion(event);
        
        if (reporter != null) {
            reporter.reportFailure(event);
        }
        
        LoggerUtil.warn("Failed healing recorded: " + eventId + " - " + reason);
    }
    
    private HealingEvent createHealingEvent(String eventId, By originalLocator, CandidateLocator candidate, long startTime) {
        HealingEvent event = new HealingEvent();
        event.setEventId(eventId);
        event.setOldLocator(originalLocator.toString());
        event.setNewLocator(candidate.getLocatorInfo().getValue());
        event.setConfidence(candidate.getScore());
        event.setExecutionTime(System.currentTimeMillis() - startTime);
        event.setHealingMode(healingMode);
        event.setCandidatesCount(1);
        
        if (cdpConnector != null) {
            event.setPageUrl(cdpConnector.getCurrentUrl());
            event.setBrowserInfo(cdpConnector.getBrowserInfo().toString());
        }
        
        return event;
    }
    
    private Map<String, Object> captureElementAttributes(WebElement element) {
        Map<String, Object> attributes = new HashMap<>();
        
        try {
            attributes.put("tagName", element.getTagName());
            attributes.put("text", element.getText());
            attributes.put("displayed", element.isDisplayed());
            attributes.put("enabled", element.isEnabled());
            
            // Common attributes
            String[] commonAttrs = {"id", "name", "class", "type", "value", "href", "src", "alt", "title", 
                                   "role", "aria-label", "data-testid", "data-test"};
            
            for (String attr : commonAttrs) {
                String value = element.getAttribute(attr);
                if (value != null && !value.isEmpty()) {
                    attributes.put(attr, value);
                }
            }
        } catch (Exception e) {
            LoggerUtil.debug("Error capturing element attributes: " + e.getMessage());
        }
        
        return attributes;
    }
    
    private String getLocatorType(By locator) {
        String locatorString = locator.toString();
        if (locatorString.startsWith("By.id:")) return "id";
        if (locatorString.startsWith("By.xpath:")) return "xpath";
        if (locatorString.startsWith("By.cssSelector:")) return "css";
        if (locatorString.startsWith("By.className:")) return "className";
        if (locatorString.startsWith("By.name:")) return "name";
        if (locatorString.startsWith("By.tagName:")) return "tagName";
        if (locatorString.startsWith("By.linkText:")) return "linkText";
        if (locatorString.startsWith("By.partialLinkText:")) return "partialLinkText";
        return "xpath"; // Default
    }
    
    private double calculateSuccessRate() {
        long total = totalHealingAttempts.get();
        if (total == 0) return 0.0;
        return (double) successfulHealings.get() / total * 100.0;
    }
    
    // Configuration setters
    public void setMaxCandidates(int maxCandidates) {
        this.maxCandidates = Math.max(1, maxCandidates);
    }
    
    public void setHealingTimeout(long timeout) {
        this.healingTimeout = Math.max(1000, timeout);
    }
}