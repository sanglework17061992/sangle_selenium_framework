package com.automation.healing.listeners;

import com.automation.healing.HealingManager;
import com.automation.healing.SmartHealingManager;
import com.automation.utils.LoggerUtil;
import org.testng.ITestListener;
import org.testng.ITestResult;

/**
 * HealingTestListener - TestNG listener for automatic healing integration
 * Hooks into test failures to trigger healing when NoSuchElementException occurs
 */
public class HealingTestListener implements ITestListener {
    
    private HealingManager healingManager;
    
    @Override
    public void onTestStart(ITestResult result) {
        try {
            // Initialize healing manager if not already done
            if (healingManager == null) {
                healingManager = SmartHealingManager.getInstance();
            }
            
            LoggerUtil.debug("Test started: " + result.getMethod().getMethodName());
        } catch (Exception e) {
            LoggerUtil.error("Error in onTestStart: " + e.getMessage(), e);
        }
    }
    
    @Override
    public void onTestSuccess(ITestResult result) {
        try {
            LoggerUtil.debug("Test passed: " + result.getMethod().getMethodName());
            // Test passed - no healing needed
        } catch (Exception e) {
            LoggerUtil.error("Error in onTestSuccess: " + e.getMessage(), e);
        }
    }
    
    @Override
    public void onTestFailure(ITestResult result) {
        try {
            Throwable throwable = result.getThrowable();
            String testName = result.getMethod().getMethodName();
            
            LoggerUtil.info("Test failed: " + testName);
            
            if (throwable != null) {
                // Check if it's a NoSuchElementException or related
                if (isElementNotFoundException(throwable)) {
                    LoggerUtil.info("Element not found exception detected, healing may be applicable");
                    
                    // Extract locator information from exception if possible
                    String failureMessage = throwable.getMessage();
                    if (failureMessage != null) {
                        LoggerUtil.info("Failure details: " + failureMessage);
                        
                        // Log that healing could be applicable
                        // Note: Actual healing integration would need to be done at the element level
                        // where the specific locator and action are known
                        LoggerUtil.info("Consider implementing healing at element interaction level for: " + testName);
                    }
                } else {
                    LoggerUtil.debug("Non-element related failure in test: " + testName);
                }
            }
            
        } catch (Exception e) {
            LoggerUtil.error("Error in onTestFailure: " + e.getMessage(), e);
        }
    }
    
    @Override
    public void onTestSkipped(ITestResult result) {
        try {
            LoggerUtil.debug("Test skipped: " + result.getMethod().getMethodName());
        } catch (Exception e) {
            LoggerUtil.error("Error in onTestSkipped: " + e.getMessage(), e);
        }
    }
    
    /**
     * Checks if the throwable is related to element not found
     */
    private boolean isElementNotFoundException(Throwable throwable) {
        if (throwable == null) {
            return false;
        }
        
        String className = throwable.getClass().getSimpleName();
        String message = throwable.getMessage();
        
        // Check for common element not found exceptions
        if ("NoSuchElementException".equals(className) || 
            "ElementNotInteractableException".equals(className) ||
            "TimeoutException".equals(className)) {
            return true;
        }
        
        // Check message for element-related keywords
        if (message != null) {
            String lowerMessage = message.toLowerCase();
            return lowerMessage.contains("no such element") ||
                   lowerMessage.contains("element not found") ||
                   lowerMessage.contains("unable to locate element") ||
                   lowerMessage.contains("element not interactable");
        }
        
        // Check cause
        return isElementNotFoundException(throwable.getCause());
    }
    
    /**
     * Sets the healing manager instance (for testing)
     */
    public void setHealingManager(HealingManager healingManager) {
        this.healingManager = healingManager;
    }
}