package com.collegelostandfound.backend.exception;

/**
 * Thrown when a requested resource does not exist. Maps to 404 NOT FOUND.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}