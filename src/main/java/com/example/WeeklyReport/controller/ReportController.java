package com.example.report.controller;

import com.example.report.dto.ReportRequest;
import com.example.report.dto.ReportResponse;
import com.example.report.entity.User;
import com.example.report.service.ReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {
    private final ReportService reportService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ReportResponse> createReport(@AuthenticationPrincipal User user,
                                                       @Valid @RequestBody ReportRequest request) {
        return ResponseEntity.ok(reportService.createReport(user.getId(), request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ReportResponse> updateReport(@PathVariable Long id,
                                                        @AuthenticationPrincipal User user,
                                                        @Valid @RequestBody ReportRequest request) {
        return ResponseEntity.ok(reportService.updateReport(id, user.getId(), request));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ReportResponse> getReport(@PathVariable Long id) {
        return ResponseEntity.ok(reportService.getReport(id));
    }

    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ReportResponse>> getMyReports(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(reportService.getReportsByUser(user.getId()));
    }

    // Manager endpoints
    @GetMapping("/team")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<List<ReportResponse>> getTeamReports(@RequestParam String weekStart,
                                                               @RequestParam String weekEnd) {
        LocalDate start = LocalDate.parse(weekStart);
        LocalDate end = LocalDate.parse(weekEnd);
        return ResponseEntity.ok(reportService.getReportsForWeek(start, end));
    }
    // ... other filter endpoints
}