package com.example.WeeklyReport.service;

import com.example.WeeklyReport.dto.ProjectRequest;
import com.example.WeeklyReport.dto.ProjectResponse;
import com.example.WeeklyReport.entity.Project;
import com.example.WeeklyReport.entity.User;
import com.example.WeeklyReport.exception.NotFoundException;
import com.example.WeeklyReport.repository.ProjectRepository;
import com.example.WeeklyReport.repository.UserRepository;
import com.example.WeeklyReport.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ReportRepository reportRepository;

    public List<ProjectResponse> getAllProjects() {
        return projectRepository.findAllByOrderByNameAsc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProjectResponse createProject(ProjectRequest request) {
        Project project = new Project();
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        
        if (request.getAssignedMemberIds() != null && !request.getAssignedMemberIds().isEmpty()) {
            List<User> members = userRepository.findAllById(request.getAssignedMemberIds());
            project.setAssignedMembers(members);
        } else {
            project.setAssignedMembers(new ArrayList<>());
        }

        return mapToResponse(projectRepository.save(project));
    }

    @Transactional
    public ProjectResponse updateProject(Long id, ProjectRequest request) {
        Project existing = projectRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Project not found"));
        existing.setName(request.getName());
        existing.setDescription(request.getDescription());

        if (request.getAssignedMemberIds() != null) {
            List<User> members = userRepository.findAllById(request.getAssignedMemberIds());
            existing.setAssignedMembers(members);
        } else {
            existing.setAssignedMembers(new ArrayList<>());
        }

        return mapToResponse(projectRepository.save(existing));
    }

    @Transactional
    public void deleteProject(Long id) {
        if (!projectRepository.existsById(id)) {
            throw new NotFoundException("Project not found");
        }
        reportRepository.clearProjectReferences(id);
        projectRepository.deleteById(id);
    }

    private ProjectResponse mapToResponse(Project project) {
        ProjectResponse response = new ProjectResponse();
        response.setId(project.getId());
        response.setName(project.getName());
        response.setDescription(project.getDescription());
        response.setActive(project.isActive());
        response.setCreatedAt(project.getCreatedAt());

        if (project.getAssignedMembers() != null) {
            List<ProjectResponse.MemberInfo> members = project.getAssignedMembers().stream()
                    .map(u -> new ProjectResponse.MemberInfo(u.getId(), u.getFullName()))
                    .collect(Collectors.toList());
            response.setAssignedMembers(members);
        } else {
            response.setAssignedMembers(new ArrayList<>());
        }
        return response;
    }
}
