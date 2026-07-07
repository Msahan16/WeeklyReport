package com.example.report.dto;

public record AuthResponse(String token, String email, String role, String fullName) {
}