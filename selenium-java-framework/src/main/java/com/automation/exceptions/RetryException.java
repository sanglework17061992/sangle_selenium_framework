package com.automation.exceptions;

/**
 * Custom exception for retry operation failures
 */
public class RetryException extends RuntimeException {
    
    public RetryException(String message) {
        super(message);
    }
    
    public RetryException(String message, Throwable cause) {
        super(message, cause);
    }
}