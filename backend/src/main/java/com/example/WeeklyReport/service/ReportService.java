package com.example.report.service;

import com.example.report.dto.ReportRequest;
import com.example.report.dto.ReportResponse;
import com.example.report.entity.Project;
import com.example.report.entity.Report;
import com.example.report.entity.User;
import com.example.report.exception.NotFoundException;
import com.example.report.repository.ProjectRepository;
import com.example.report.repository.ReportRepository;
import com.example.report.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {
    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;

    @Transactional
    public Report createReport(Long userId, ReportRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));
        Report report = new Report();
        report.setUser(user);
        setReportFields(report, request);
        return reportRepository.save(report);
    }

    @Transactional
    public Report updateReport(Long reportId, Long userId, ReportRequest request) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new NotFoundException("Report not found"));
        if (!report.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You can only edit your own reports");
        }
        setReportFields(report, request);
        return reportRepository.save(report);
    }

    private void setReportFields(Report report, ReportRequest request) {
        report.setWeekStartDate(LocalDate.parse(request.getWeekStartDate()));
        report.setWeekEndDate(LocalDate.parse(request.getWeekEndDate()));
        if (request.getProjectId() != null) {
            Project project = projectRepository.findById(request.getProjectId())
                    .orElseThrow(() -> new NotFoundException("Project not found"));
            report.setProject(project);
        }
        report.setTasksCompleted(request.getTasksCompleted());
        report.setTasksPlanned(request.getTasksPlanned());
        report.setBlockers(request.getBlockers());
        report.setHoursWorked(request.getHoursWorked());
        report.setNotes(request.getNotes());
        if ("SUBMITTED".equalsIgnoreCase(request.getStatus())) {
            report.setStatus(Report.Status.SUBMITTED);
            report.setSubmittedAt(java.time.LocalDateTime.now());
        } else {
            report.setStatus(Report.Status.DRAFT);
        }
    }

    public ReportResponse getReport(Long reportId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new NotFoundException("Report not found"));
        return mapToResponse(report);
    }

    public List<ReportResponse> getReportsByUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));
        return reportRepository.findByUserOrderByWeekStartDateDesc(user)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    // Manager methods
    public List<ReportResponse> getReportsForWeek(LocalDate start, LocalDate end) {
        return reportRepository.findByWeekStartDateBetween(start, end)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    // ... more methods for filtering, compliance, etc.
}