package com.example.report.controller;

import com.example.report.dto.DashboardStats;
import com.example.report.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('MANAGER')")
public class DashboardController {
    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public DashboardStats getStats(@RequestParam String weekStart, @RequestParam String weekEnd) {
        LocalDate start = LocalDate.parse(weekStart);
        LocalDate end = LocalDate.parse(weekEnd);
        return dashboardService.getStats(start, end);
    }

    @GetMapping("/trends")
    public Map<String, List<Long>> getTasksTrend(@RequestParam String start, @RequestParam String end) {
        LocalDate startDate = LocalDate.parse(start);
        LocalDate endDate = LocalDate.parse(end);
        return dashboardService.getTasksTrend(startDate, endDate);
    }

    // ... other endpoints for charts
}