package com.example.WeeklyReport.service;

import com.example.WeeklyReport.entity.Report;
import com.example.WeeklyReport.entity.User;
import com.example.WeeklyReport.repository.ReportRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    private final ReportRepository reportRepository;
    private final RestTemplate restTemplate;

    public AiService(ReportRepository reportRepository, RestTemplate restTemplate) {
        this.reportRepository = reportRepository;
        this.restTemplate = restTemplate;
    }

    public String generateResponse(String prompt, User user) {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;

        try {
            // Build the system prompt with context
            String context = buildContext(user);
            String roleStr = user.getRole() == User.Role.MANAGER ? "team manager" : "team member";
            String fullPrompt = "You are an AI Chat Assistant for a " + roleStr + " analyzing weekly reports. " +
                    "Use the following report data to answer their question.\n\n" +
                    "=== RECENT REPORTS ===\n" + context + "\n=====================\n\n" +
                    "Question: " + prompt;

            // Build request payload
            Map<String, Object> textPart = new HashMap<>();
            textPart.put("text", fullPrompt);

            Map<String, Object> contentPart = new HashMap<>();
            contentPart.put("parts", List.of(textPart));

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", List.of(contentPart));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

            // Make API call
            Map<String, Object> response = restTemplate.postForObject(url, requestEntity, Map.class);

            if (response != null && response.containsKey("candidates")) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                    if (content != null && content.containsKey("parts")) {
                        List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                        if (parts != null && !parts.isEmpty()) {
                            return (String) parts.get(0).get("text");
                        }
                    }
                }
            }
            return "Sorry, I could not process the AI response.";
        } catch (Exception e) {
            e.printStackTrace();
            return "Error communicating with AI service: " + e.getMessage();
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
