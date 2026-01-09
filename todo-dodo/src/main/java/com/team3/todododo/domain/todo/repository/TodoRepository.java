package com.team3.todododo.domain.todo.repository;

import com.team3.todododo.domain.todo.dto.response.TodoResponse;
import com.team3.todododo.domain.todo.entity.Todo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface TodoRepository extends JpaRepository<Todo,Long> {
    List<Todo> getTodosByUserId(Long userId);

    Long countByUserId(Long userId);
    Long countByUserIdAndCompleted(Long userId, boolean completed);

    List<Todo> findByUserId(Long userId);
    List<Todo> findByUserIdAndCompleted(Long userId, boolean completed);
    List<Todo> findByUserIdAndCompletedTrueAndEndDateBetween(Long userId, LocalDate startDate, LocalDate endDate);
    List<Todo> findByUserIdAndStartDateBetween(Long userId, LocalDate startDate, LocalDate endDate);

    // 기간 내 todos 조회
    @Query("SELECT t FROM Todo t WHERE t.userId = :userId " +
           "AND t.startDate <= :endDate AND t.endDate >= :startDate " +
           "ORDER BY t.startDate ASC")
    List<Todo> findTodosByUserIdAndDateRange(@Param("userId") Long userId,
                                              @Param("startDate") LocalDate startDate,
                                              @Param("endDate") LocalDate endDate);
}
