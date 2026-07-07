package com.example.report.service;

import com.example.report.dto.DashboardStats;
import com.example.report.entity.Report;
import com.example.report.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {
    private final ReportRepository reportRepository;

    public DashboardStats getStats(LocalDate start, LocalDate end) {
        List<Report> reports = reportRepository.findByWeekStartDateBetween(start, end);
        long totalReports = reports.size();
        long submittedReports = reports.stream().filter(report -> report.getStatus() == Report.Status.SUBMITTED).count();
        long draftReports = totalReports - submittedReports;
        BigDecimal totalHoursWorked = reports.stream()
                .map(report -> report.getHoursWorked() == null ? BigDecimal.ZERO : report.getHoursWorked())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal averageHoursWorked = totalReports == 0
                ? BigDecimal.ZERO
                : totalHoursWorked.divide(BigDecimal.valueOf(totalReports), 2, java.math.RoundingMode.HALF_UP);

        DashboardStats stats = new DashboardStats();
        stats.setTotalReports(totalReports);
        stats.setSubmittedReports(submittedReports);
        stats.setDraftReports(draftReports);
        stats.setTotalHoursWorked(totalHoursWorked);
        stats.setAverageHoursWorked(averageHoursWorked);
        return stats;
    }

    public Map<String, List<Long>> getTasksTrend(LocalDate start, LocalDate end) {
        List<Report> reports = reportRepository.findByWeekStartDateBetween(start, end);
        List<Report> submittedReports = reportRepository.findSubmittedReportsForWeek(start, end);

        List<Long> reportCounts = new ArrayList<>();
        List<Long> submittedCounts = new ArrayList<>();

        for (LocalDate current = start; !current.isAfter(end); current = current.plusDays(1)) {
            LocalDate day = current;
            long reportCountForDay = reports.stream()
                .filter(report -> day.equals(report.getWeekStartDate()))
                    .count();
            long submittedCountForDay = submittedReports.stream()
                .filter(report -> day.equals(report.getWeekStartDate()))
                    .count();
            reportCounts.add(reportCountForDay);
            submittedCounts.add(submittedCountForDay);
        }

        Map<String, List<Long>> trend = new LinkedHashMap<>();
        trend.put("reports", reportCounts);
        trend.put("submittedReports", submittedCounts);
        return trend;
    }
}
