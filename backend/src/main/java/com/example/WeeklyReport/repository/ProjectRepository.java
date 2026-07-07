package com.example.WeeklyReport.repository;

import com.example.WeeklyReport.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findAllByOrderByNameAsc();
}