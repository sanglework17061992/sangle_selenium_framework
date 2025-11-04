package com.automation.core;

import com.automation.utils.LoggerUtil;

/**
 * HealingConfiguration - Configuration for healing behavior in different environments
 */
public class HealingEnvironmentConfig {
    
    private static HealingEnvironmentConfig instance;
    
    // Environment detection
    private final boolean isCiCdEnvironment;
    private final boolean isParallelExecution;
    private final String executionMode;
    
    // Configuration properties
    private boolean enableHealingPersistence = true;
    private boolean enableConcurrentHealing = true;
    private String healingStorageMode = "file"; // "file", "database", "redis"
    private int healingLockTimeout = 30000; // 30 seconds
    private boolean shareHealedLocators = true;
    
    private HealingEnvironmentConfig() {
        // Detect CI/CD environment
        this.isCiCdEnvironment = detectCiCdEnvironment();
        
        // Detect parallel execution
        this.isParallelExecution = detectParallelExecution();
        
        // Set execution mode
        this.executionMode = determineExecutionMode();
        
        // Configure based on environment
        configureForEnvironment();
        
        LoggerUtil.info("Healing Environment: " + executionMode + 
                       " | CI/CD: " + isCiCdEnvironment + 
                       " | Parallel: " + isParallelExecution);
    }
    
    public static synchronized HealingEnvironmentConfig getInstance() {
        if (instance == null) {
            instance = new HealingEnvironmentConfig();
        }
        return instance;
    }
    
    /**
     * Detect if running in CI/CD environment
     */
    private boolean detectCiCdEnvironment() {
        return System.getenv("CI") != null || 
               System.getenv("JENKINS_URL") != null ||
               System.getenv("GITHUB_ACTIONS") != null ||
               System.getenv("GITLAB_CI") != null ||
               System.getenv("AZURE_HTTP_USER_AGENT") != null ||
               System.getProperty("ci.environment") != null;
    }
    
    /**
     * Detect parallel execution
     */
    private boolean detectParallelExecution() {
        // Check TestNG parallel configuration
        String testngParallel = System.getProperty("testng.parallel");
        if (testngParallel != null && !testngParallel.equals("false")) {
            return true;
        }
        
        // Check Maven Surefire parallel configuration
        String surefireParallel = System.getProperty("parallel");
        if (surefireParallel != null && !surefireParallel.equals("false")) {
            return true;
        }
        
        // Check thread count
        String threadCount = System.getProperty("thread.count");
        if (threadCount != null && Integer.parseInt(threadCount) > 1) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Determine execution mode
     */
    private String determineExecutionMode() {
        if (isCiCdEnvironment && isParallelExecution) {
            return "CI_PARALLEL";
        } else if (isCiCdEnvironment) {
            return "CI_SEQUENTIAL";
        } else if (isParallelExecution) {
            return "LOCAL_PARALLEL";
        } else {
            return "LOCAL_SEQUENTIAL";
        }
    }
    
    /**
     * Configure healing behavior based on environment
     */
    private void configureForEnvironment() {
        switch (executionMode) {
            case "CI_PARALLEL":
                // Most restrictive - avoid file conflicts
                enableHealingPersistence = false; // Don't save during CI parallel runs
                enableConcurrentHealing = true;   // Allow healing but don't persist
                healingStorageMode = "memory";    // Use in-memory storage only
                shareHealedLocators = false;      // Each thread isolated
                LoggerUtil.info("CI/CD Parallel Mode: Healing enabled, persistence disabled");
                break;
                
            case "CI_SEQUENTIAL":
                // Safe to persist in sequential CI
                enableHealingPersistence = true;
                enableConcurrentHealing = true;
                healingStorageMode = "file";
                shareHealedLocators = true;
                LoggerUtil.info("CI/CD Sequential Mode: Full healing with persistence");
                break;
                
            case "LOCAL_PARALLEL":
                // Use file locking for local parallel
                enableHealingPersistence = true;
                enableConcurrentHealing = true;
                healingStorageMode = "file_locked"; // Use file locking
                shareHealedLocators = true;
                LoggerUtil.info("Local Parallel Mode: Healing with file locking");
                break;
                
            case "LOCAL_SEQUENTIAL":
                // Full functionality for local sequential
                enableHealingPersistence = true;
                enableConcurrentHealing = true;
                healingStorageMode = "file";
                shareHealedLocators = true;
                LoggerUtil.info("Local Sequential Mode: Full healing functionality");
                break;
        }
    }
    
    // Getters
    public boolean isCiCdEnvironment() { return isCiCdEnvironment; }
    public boolean isParallelExecution() { return isParallelExecution; }
    public String getExecutionMode() { return executionMode; }
    public boolean isHealingPersistenceEnabled() { return enableHealingPersistence; }
    public boolean isConcurrentHealingEnabled() { return enableConcurrentHealing; }
    public String getHealingStorageMode() { return healingStorageMode; }
    public int getHealingLockTimeout() { return healingLockTimeout; }
    public boolean isShareHealedLocators() { return shareHealedLocators; }
    
    // Configuration methods
    public void setHealingPersistence(boolean enabled) {
        this.enableHealingPersistence = enabled;
    }
    
    public void setHealingStorageMode(String mode) {
        this.healingStorageMode = mode;
    }
}