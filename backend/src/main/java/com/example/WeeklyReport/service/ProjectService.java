package com.example.WeeklyReport.service;

import com.example.WeeklyReport.entity.Project;
import com.example.WeeklyReport.exception.NotFoundException;
import com.example.WeeklyReport.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectService {
    private final ProjectRepository projectRepository;

    public List<Project> getAllProjects() {
        return projectRepository.findAllByOrderByNameAsc();
    }

    @Transactional
    public Project createProject(Project project) {
        return projectRepository.save(project);
    }

    @Transactional
    public Project updateProject(Long id, Project project) {
        Project existing = projectRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Project not found"));
        existing.setName(project.getName());
        existing.setDescription(project.getDescription());
        return projectRepository.save(existing);
    }

    @Transactional
    public void deleteProject(Long id) {
        if (!projectRepository.existsById(id)) {
            throw new NotFoundException("Project not found");
        }
        projectRepository.deleteById(id);
    }
}
