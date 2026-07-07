package com.example.WeeklyReport.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ReportRequest {
    @NotBlank(message = "Week start date is required")
    private String weekStartDate; // yyyy-MM-dd
    @NotBlank(message = "Week end date is required")
    private String weekEndDate;
    private Long projectId;
    @NotBlank(message = "Tasks completed is required")
    private String tasksCompleted;
    @NotBlank(message = "Tasks planned is required")
    private String tasksPlanned;
    private String blockers;
    private BigDecimal hoursWorked;
    private String notes;
    private String status; // DRAFT or SUBMITTED
}