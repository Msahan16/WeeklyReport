package com.example.WeeklyReport.service;

import com.example.WeeklyReport.entity.Report;
import com.example.WeeklyReport.entity.User;
import com.example.WeeklyReport.repository.ReportRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AiService {

    private final ReportRepository reportRepository;

    public AiService(ReportRepository reportRepository) {
        this.reportRepository = reportRepository;
    }

    public String generateResponse(String prompt, User user) {
        try {
            String context = buildContext(user);
            String roleStr = user.getRole() == User.Role.MANAGER ? "team manager" : "team member";

            // AI service is not configured — return report context as a summary
            return "AI service is not configured. Here is the report context:\n\n" + context;
        } catch (Exception e) {
            e.printStackTrace();
            return "Error processing request: " + e.getMessage();
        }
    }

    private String buildContext(User user) {
        List<Report> reports;
        if (user.getRole() == User.Role.MANAGER) {
            reports = reportRepository.findTop10ByOrderByCreatedAtDesc();
        } else {
            reports = reportRepository.findByUserOrderByWeekStartDateDesc(user);
            if (reports.size() > 10) reports = reports.subList(0, 10);
        }
        
        if (reports.isEmpty()) {
            return "No recent reports found.";
        }

        return reports.stream().map(r -> {
            String userName = r.getUser() != null ? r.getUser().getFullName() : "Unknown";
            String project = r.getProject() != null ? r.getProject().getName() : "None";
            return String.format(
                    "User: %s | Project: %s | Week: %s to %s | Status: %s\nTasks: %s\nBlockers: %s\nHours: %s",
                    userName, project, r.getWeekStartDate(), r.getWeekEndDate(), r.getStatus(),
                    r.getTasksCompleted() != null ? r.getTasksCompleted().replace("\n", " ") : "N/A",
                    r.getBlockers() != null ? r.getBlockers().replace("\n", " ") : "N/A",
                    r.getHoursWorked() != null ? r.getHoursWorked() : "N/A"
            );
        }).collect(Collectors.joining("\n\n"));
    }
}
