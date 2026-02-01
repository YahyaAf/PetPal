package org.project.backend.exception;

public class DuplicateResourceException extends RuntimeException {

    public DuplicateResourceException(String message) {
        super(message);
    }

    public DuplicateResourceException(String resource, String field, Object value) {
        super(String.format("%s existe déjà avec %s : '%s'", resource, field, value));
    }
}

