package com.example.report.repository;

import com.example.report.entity.Report;
import com.example.report.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findByUserAndWeekStartDateBetween(User user, LocalDate start, LocalDate end);
    List<Report> findByUserOrderByWeekStartDateDesc(User user);
    List<Report> findByWeekStartDateBetween(LocalDate start, LocalDate end);
    List<Report> findByUserAndWeekStartDate(User user, LocalDate weekStartDate);

    // Custom queries for dashboard
    @Query("SELECT r FROM Report r WHERE r.status = 'SUBMITTED' AND r.weekStartDate BETWEEN :start AND :end")
    List<Report> findSubmittedReportsForWeek(LocalDate start, LocalDate end);
    // ... more as needed
}