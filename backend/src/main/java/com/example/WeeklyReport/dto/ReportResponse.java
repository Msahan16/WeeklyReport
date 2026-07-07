package com.example.WeeklyReport.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class ReportResponse {
    private Long id;
    private Long userId;
    private String userEmail;
    private String userFullName;
    private LocalDate weekStartDate;
    private LocalDate weekEndDate;
    private Long projectId;
    private String projectName;
    private String tasksCompleted;
    private String tasksPlanned;
    private String blockers;
    private BigDecimal hoursWorked;
    private String notes;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime submittedAt;
}
