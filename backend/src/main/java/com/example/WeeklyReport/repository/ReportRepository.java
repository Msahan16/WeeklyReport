public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findByUserAndWeekStartDateBetween(User user, LocalDate start, LocalDate end);
    List<Report> findByUserOrderByWeekStartDateDesc(User user);
    List<Report> findByWeekStartDateBetween(LocalDate start, LocalDate end);
    List<Report> findByUserAndWeekStartDate(LocalDate start, LocalDate end);
    // Custom queries for dashboard
    @Query("SELECT r FROM Report r WHERE r.status = 'SUBMITTED' AND r.weekStartDate BETWEEN :start AND :end")
    List<Report> findSubmittedReportsForWeek(LocalDate start, LocalDate end);
    // ... more as needed
}