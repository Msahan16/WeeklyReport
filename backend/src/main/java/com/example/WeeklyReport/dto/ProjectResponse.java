package com.example.WeeklyReport.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
public class ProjectResponse {
    private Long id;
    private String name;
    private String description;
    private boolean active;
    private LocalDateTime createdAt;
    // List of assigned members, where each member is a map of id and name.
    // We could create a nested DTO, but a simple list of maps or just a simple DTO is fine.
    // Let's use a nested class.
    private List<MemberInfo> assignedMembers;

    @Data
    public static class MemberInfo {
        private Long id;
        private String name;
        
        public MemberInfo(Long id, String name) {
            this.id = id;
            this.name = name;
        }
    }
}
