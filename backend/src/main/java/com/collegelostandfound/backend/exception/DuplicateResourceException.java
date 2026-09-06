package com.collegelostandfound.backend.exception;

/**
 * Thrown when a registration conflicts with an existing account
 * (duplicate email or duplicate roll number). Maps to 409 CONFLICT.
 */
public class DuplicateResourceException extends RuntimeException {

    public DuplicateResourceException(String message) {
        super(message);
    }
}