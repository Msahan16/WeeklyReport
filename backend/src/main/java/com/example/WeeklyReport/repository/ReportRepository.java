package com.example.WeeklyReport.repository;

import com.example.WeeklyReport.entity.Report;
import com.example.WeeklyReport.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findByUserAndWeekStartDateBetween(User user, LocalDate start, LocalDate end);
    List<Report> findByUserOrderByWeekStartDateDesc(User user);
    List<Report> findByWeekStartDateBetween(LocalDate start, LocalDate end);
    List<Report> findByUserAndWeekStartDate(User user, LocalDate weekStartDate);
    List<Report> findTop10ByOrderByCreatedAtDesc();

    @Query("SELECT r FROM Report r WHERE r.status = 'SUBMITTED' AND r.weekStartDate BETWEEN :start AND :end")
    List<Report> findSubmittedReportsForWeek(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT r FROM Report r WHERE r.weekStartDate BETWEEN :start AND :end AND r.user.id = :userId")
    List<Report> findByWeekRangeAndUser(@Param("start") LocalDate start, @Param("end") LocalDate end, @Param("userId") Long userId);

    @Query("SELECT r FROM Report r WHERE r.weekStartDate BETWEEN :start AND :end AND r.project.id = :projectId")
    List<Report> findByWeekRangeAndProject(@Param("start") LocalDate start, @Param("end") LocalDate end, @Param("projectId") Long projectId);

    @Query("SELECT r FROM Report r WHERE r.weekStartDate BETWEEN :start AND :end AND r.user.id = :userId AND r.project.id = :projectId")
    List<Report> findByWeekRangeAndUserAndProject(@Param("start") LocalDate start, @Param("end") LocalDate end, @Param("userId") Long userId, @Param("projectId") Long projectId);

    @Modifying
    @Query("UPDATE Report r SET r.project = null WHERE r.project.id = :projectId")
    void clearProjectReferences(@Param("projectId") Long projectId);
}