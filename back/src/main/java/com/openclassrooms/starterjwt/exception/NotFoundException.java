package com.openclassrooms.starterjwt.exception;

public class NotFoundException extends RuntimeException {
    public NotFoundException() {
        super("Resource not found");
    }
}
