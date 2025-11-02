package com.automation.exceptions;

/**
 * Custom exception for driver creation and management failures
 */
public class DriverCreationException extends RuntimeException {
    
    public DriverCreationException(String message) {
        super(message);
    }
    
    public DriverCreationException(String message, Throwable cause) {
        super(message, cause);
    }
}