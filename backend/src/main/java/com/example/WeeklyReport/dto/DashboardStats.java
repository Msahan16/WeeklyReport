package com.example.report.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class DashboardStats {
    private long totalReports;
    private long submittedReports;
    private long draftReports;
    private BigDecimal totalHoursWorked;
    private BigDecimal averageHoursWorked;
}
