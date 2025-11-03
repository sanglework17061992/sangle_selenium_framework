package com.automation.healing;

/**
 * Exception thrown when HealingManager initialization fails
 */
public class HealingInitializationException extends RuntimeException {
    
    public HealingInitializationException(String message) {
        super(message);
    }
    
    public HealingInitializationException(String message, Throwable cause) {
        super(message, cause);
    }
}