package com.example.WeeklyReport.controller;

import com.example.WeeklyReport.dto.DashboardStats;
import com.example.WeeklyReport.dto.ReportResponse;
import com.example.WeeklyReport.service.DashboardService;
import com.example.WeeklyReport.repository.UserRepository;
import com.example.WeeklyReport.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('MANAGER')")
public class DashboardController {
    private final DashboardService dashboardService;
    private final UserRepository userRepository;

    @GetMapping("/stats")
    public DashboardStats getStats(@RequestParam String weekStart, @RequestParam String weekEnd, 
                                   @RequestParam(required = false) Long userId, @RequestParam(required = false) Long projectId) {
        LocalDate start = LocalDate.parse(weekStart);
        LocalDate end = LocalDate.parse(weekEnd);
        return dashboardService.getStats(start, end, userId, projectId);
    }

    @GetMapping("/trends")
    public Map<String, List<Long>> getTasksTrend(@RequestParam String start, @RequestParam String end,
                                                 @RequestParam(required = false) Long userId, @RequestParam(required = false) Long projectId) {
        LocalDate startDate = LocalDate.parse(start);
        LocalDate endDate = LocalDate.parse(end);
        return dashboardService.getTasksTrend(startDate, endDate, userId, projectId);
    }

    @GetMapping("/workload-by-project")
    public List<Map<String, Object>> getWorkloadByProject(@RequestParam String weekStart, @RequestParam String weekEnd,
                                                          @RequestParam(required = false) Long userId, @RequestParam(required = false) Long projectId) {
        LocalDate start = LocalDate.parse(weekStart);
        LocalDate end = LocalDate.parse(weekEnd);
        return dashboardService.getWorkloadByProject(start, end, userId, projectId);
    }

    @GetMapping("/submission-status")
    public List<Map<String, Object>> getSubmissionStatusByMember(@RequestParam String weekStart, @RequestParam String weekEnd,
                                                                 @RequestParam(required = false) Long userId, @RequestParam(required = false) Long projectId) {
        LocalDate start = LocalDate.parse(weekStart);
        LocalDate end = LocalDate.parse(weekEnd);
        return dashboardService.getSubmissionStatusByMember(start, end, userId, projectId);
    }

    @GetMapping("/recent-reports")
    public List<ReportResponse> getRecentReports(@RequestParam(required = false) Long userId, @RequestParam(required = false) Long projectId) {
        return dashboardService.getRecentReports(userId, projectId);
    }

    @GetMapping("/team-members")
    public List<Map<String, Object>> getTeamMembers() {
        return userRepository.findByRole(User.Role.TEAM_MEMBER).stream()
            .map(u -> Map.of("id", (Object) u.getId(), "name", (Object) u.getFullName()))
            .toList();
    }
}