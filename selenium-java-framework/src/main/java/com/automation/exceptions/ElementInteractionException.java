package com.automation.exceptions;

/**
 * Custom exception for element interaction failures
 */
public class ElementInteractionException extends RuntimeException {
    
    public ElementInteractionException(String message) {
        super(message);
    }
    
    public ElementInteractionException(String message, Throwable cause) {
        super(message, cause);
    }
}