package org.project.backend.exception;

public class HotelCapacityExceededException extends RuntimeException {
    public HotelCapacityExceededException(String message) {
        super(message);
    }
}
