package com.ticketing.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private Long id;
    private String token;
    private String email;
    private String firstName;
    private String lastName;
    private String role;
}
