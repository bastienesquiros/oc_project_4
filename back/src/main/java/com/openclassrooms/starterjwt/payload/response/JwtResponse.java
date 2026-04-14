package com.openclassrooms.starterjwt.payload.response;

public record JwtResponse(String token, String type, Long id, String username,
                           String firstName, String lastName, Boolean admin) {
    public JwtResponse(String token, Long id, String username,
                       String firstName, String lastName, Boolean admin) {
        this(token, "Bearer", id, username, firstName, lastName, admin);
    }
}
