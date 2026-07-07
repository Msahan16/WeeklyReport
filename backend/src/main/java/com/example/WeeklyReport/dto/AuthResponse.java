package com.example.WeeklyReport.dto;

public record AuthResponse(String token, String email, String role, String fullName) {
}