package com.example.WeeklyReport.service;

import com.example.WeeklyReport.dto.DashboardStats;
import com.example.WeeklyReport.dto.ReportResponse;
import com.example.WeeklyReport.entity.Report;
import com.example.WeeklyReport.entity.User;
import com.example.WeeklyReport.repository.ReportRepository;
import com.example.WeeklyReport.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {
    private final ReportRepository reportRepository;
    private final UserRepository userRepository;

    public DashboardStats getStats(LocalDate start, LocalDate end) {
        List<Report> reports = reportRepository.findByWeekStartDateBetween(start, end);
        long totalReports = reports.size();
        long submittedReports = reports.stream().filter(r -> r.getStatus() == Report.Status.SUBMITTED).count();
        long draftReports = totalReports - submittedReports;

        // Count reports that have non-empty blockers text
        long openBlockers = reports.stream()
                .filter(r -> r.getBlockers() != null && !r.getBlockers().isBlank())
                .count();

        BigDecimal totalHoursWorked = reports.stream()
                .map(r -> r.getHoursWorked() == null ? BigDecimal.ZERO : r.getHoursWorked())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal averageHoursWorked = totalReports == 0
                ? BigDecimal.ZERO
                : totalHoursWorked.divide(BigDecimal.valueOf(totalReports), 2, java.math.RoundingMode.HALF_UP);

        DashboardStats stats = new DashboardStats();
        stats.setTotalReports(totalReports);
        stats.setSubmittedReports(submittedReports);
        stats.setDraftReports(draftReports);
        stats.setOpenBlockers(openBlockers);
        stats.setTotalHoursWorked(totalHoursWorked);
        stats.setAverageHoursWorked(averageHoursWorked);
        return stats;
    }

    public Map<String, List<Long>> getTasksTrend(LocalDate start, LocalDate end) {
        List<Report> reports = reportRepository.findByWeekStartDateBetween(start, end);
        List<Report> submittedReports = reportRepository.findSubmittedReportsForWeek(start, end);

        List<Long> reportCounts = new ArrayList<>();
        List<Long> submittedCounts = new ArrayList<>();
        List<Long> tasksCompletedCounts = new ArrayList<>();

        for (LocalDate current = start; !current.isAfter(end); current = current.plusWeeks(1)) {
            LocalDate day = current;
            long reportCountForDay = reports.stream()
                .filter(r -> day.equals(r.getWeekStartDate()))
                    .count();
            long submittedCountForDay = submittedReports.stream()
                .filter(r -> day.equals(r.getWeekStartDate()))
                    .count();
            long tasksCount = submittedReports.stream()
                .filter(r -> day.equals(r.getWeekStartDate()))
                .mapToLong(r -> {
                    if (r.getTasksCompleted() == null || r.getTasksCompleted().isBlank()) return 0;
                    return r.getTasksCompleted().lines().filter(line -> !line.trim().isEmpty()).count();
                }).sum();

            reportCounts.add(reportCountForDay);
            submittedCounts.add(submittedCountForDay);
            tasksCompletedCounts.add(tasksCount);
        }

        Map<String, List<Long>> trend = new LinkedHashMap<>();
        trend.put("reports", reportCounts);
        trend.put("submittedReports", submittedCounts);
        trend.put("tasksCompleted", tasksCompletedCounts);
        return trend;
    }

    public List<Map<String, Object>> getWorkloadByProject(LocalDate start, LocalDate end) {
        List<Report> reports = reportRepository.findByWeekStartDateBetween(start, end);

        // Group by project name, count tasks/hours per project
        Map<String, Map<String, Object>> projectMap = new LinkedHashMap<>();
        for (Report r : reports) {
            String projectName = r.getProject() != null ? r.getProject().getName() : "No Project";
            projectMap.computeIfAbsent(projectName, k -> {
                Map<String, Object> m = new HashMap<>();
                m.put("project", k);
                m.put("reports", 0L);
                m.put("hours", BigDecimal.ZERO);
                return m;
            });
            Map<String, Object> entry = projectMap.get(projectName);
            entry.put("reports", (Long) entry.get("reports") + 1);
            BigDecimal hrs = r.getHoursWorked() != null ? r.getHoursWorked() : BigDecimal.ZERO;
            entry.put("hours", ((BigDecimal) entry.get("hours")).add(hrs));
        }
        return new ArrayList<>(projectMap.values());
    }

    public List<Map<String, Object>> getSubmissionStatusByMember(LocalDate start, LocalDate end) {
        List<Report> reports = reportRepository.findByWeekStartDateBetween(start, end);
        List<User> members = userRepository.findByRole(User.Role.TEAM_MEMBER);

        Map<Long, Map<String, Object>> memberMap = new LinkedHashMap<>();
        for (User u : members) {
            Map<String, Object> m = new HashMap<>();
            m.put("name", u.getFullName());
            m.put("submitted", 0L);
            m.put("pending", 0L);
            m.put("late", 0L);
            memberMap.put(u.getId(), m);
        }

        LocalDate today = LocalDate.now();

        for (User u : members) {
            Map<String, Object> entry = memberMap.get(u.getId());
            
            List<Report> userReports = reports.stream()
                    .filter(rep -> rep.getUser().getId().equals(u.getId()))
                    .collect(Collectors.toList());

            long submitted = userReports.stream().filter(r -> r.getStatus() == Report.Status.SUBMITTED).count();
            long late = 0;
            long pending = 0;

            for (Report r : userReports) {
                if (r.getStatus() == Report.Status.DRAFT) {
                    if (today.isAfter(r.getWeekEndDate())) {
                        late++;
                    } else {
                        pending++;
                    }
                }
            }

            // Check for missing weeks
            for (LocalDate current = start; !current.isAfter(end); current = current.plusWeeks(1)) {
                LocalDate weekStart = current;
                LocalDate weekEnd = current.plusDays(6);
                boolean isLateWeek = today.isAfter(weekEnd);

                boolean hasReportForWeek = userReports.stream().anyMatch(r -> r.getWeekStartDate().equals(weekStart));
                if (!hasReportForWeek) {
                    if (isLateWeek) {
                        late++;
                    } else {
                        pending++;
                    }
                }
            }

            entry.put("submitted", submitted);
            entry.put("late", late);
            entry.put("pending", pending);
        }
        return new ArrayList<>(memberMap.values());
    }

    public List<ReportResponse> getRecentReports() {
        return reportRepository.findTop10ByOrderByCreatedAtDesc().stream()
                .map(this::mapToReportResponse)
                .collect(Collectors.toList());
    }

    private ReportResponse mapToReportResponse(Report report) {
        ReportResponse response = new ReportResponse();
        response.setId(report.getId());
        response.setUserId(report.getUser() != null ? report.getUser().getId() : null);
        response.setUserEmail(report.getUser() != null ? report.getUser().getEmail() : null);
        response.setUserFullName(report.getUser() != null ? report.getUser().getFullName() : null);
        response.setWeekStartDate(report.getWeekStartDate());
        response.setWeekEndDate(report.getWeekEndDate());
        response.setProjectId(report.getProject() != null ? report.getProject().getId() : null);
        response.setProjectName(report.getProject() != null ? report.getProject().getName() : null);
        response.setTasksCompleted(report.getTasksCompleted());
        response.setBlockers(report.getBlockers());
        response.setHoursWorked(report.getHoursWorked() != null ? report.getHoursWorked() : BigDecimal.ZERO);
        response.setStatus(report.getStatus() != null ? report.getStatus().name() : null);
        response.setCreatedAt(report.getCreatedAt());
        response.setSubmittedAt(report.getSubmittedAt());
        return response;
    }
}
