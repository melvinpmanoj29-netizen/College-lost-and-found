package com.collegelostandfound.backend.exception;

/**
 * Thrown when login credentials are invalid. Maps to 401 UNAUTHORIZED.
 */
public class InvalidCredentialsException extends RuntimeException {

    public InvalidCredentialsException(String message) {
        super(message);
    }
}