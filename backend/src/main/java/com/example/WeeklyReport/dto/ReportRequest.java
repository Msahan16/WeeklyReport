package com.example.report.dto;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class ReportRequest {
    private String weekStartDate; // yyyy-MM-dd
    private String weekEndDate;
    private Long projectId;
    private String tasksCompleted;
    private String tasksPlanned;
    private String blockers;
    private BigDecimal hoursWorked;
    private String notes;
    private String status; // DRAFT or SUBMITTED
}