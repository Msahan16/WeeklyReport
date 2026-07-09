package com.example.WeeklyReport.dto;

import lombok.Data;
import java.util.List;

@Data
public class ProjectRequest {
    private String name;
    private String description;
    private List<Long> assignedMemberIds;
}
