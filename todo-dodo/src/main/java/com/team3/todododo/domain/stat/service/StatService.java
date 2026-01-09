package com.team3.todododo.domain.stat.service;

import com.team3.todododo.domain.stat.dto.DailyStatResponse;
import com.team3.todododo.domain.stat.dto.IncompletePriorityResponse;
import com.team3.todododo.domain.stat.dto.StatOverviewResponse;
import com.team3.todododo.domain.stat.dto.StatusDistributionResponse;
import com.team3.todododo.domain.stat.dto.TodosByPeriodResponse;
import com.team3.todododo.domain.todo.entity.Todo;
import com.team3.todododo.domain.todo.repository.TodoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatService {

    private final TodoRepository todoRepository;

    /**
     * 사용자별 전체 통계 조회
     */
    public StatOverviewResponse getOverviewStats(Long userId) {
        Long totalTodos = todoRepository.countByUserId(userId);
        Long completedTodos = todoRepository.countByUserIdAndCompleted(userId, true);
        Long incompleteTodos = todoRepository.countByUserIdAndCompleted(userId, false);
        Double completionRate = totalTodos > 0 ? (completedTodos * 100.0 / totalTodos) : 0.0;

        return StatOverviewResponse.builder()
                .totalTodos(totalTodos)
                .completedTodos(completedTodos)
                .incompleteTodos(incompleteTodos)
                .completionRate(completionRate)
                .build();
    }

    /**
     * 사용자별 특정 기간 일일 통계 조회
     */
    public DailyStatResponse getDailyStats(Long userId, LocalDate startDate, LocalDate endDate) {
        List<Todo> completedTodos = todoRepository.findByUserIdAndCompletedTrueAndEndDateBetween(userId, startDate, endDate);
        List<Todo> createdTodos = todoRepository.findByUserIdAndStartDateBetween(userId, startDate, endDate);

        Map<LocalDate, Long> completedByDate = completedTodos.stream()
            .collect(Collectors.groupingBy(Todo::getEndDate, Collectors.counting()));

        Map<LocalDate, Long> createdByDate = createdTodos.stream()
            .collect(Collectors.groupingBy(Todo::getStartDate, Collectors.counting()));

        List<DailyStatResponse.DailyStat> dailyStats = startDate.datesUntil(endDate.plusDays(1))
            .map(date -> DailyStatResponse.DailyStat.builder()
                .date(date)
                .completedCount(completedByDate.getOrDefault(date, 0L))
                .createdCount(createdByDate.getOrDefault(date, 0L))
                .build())
            .collect(Collectors.toList());

        return DailyStatResponse.builder()
                .dailyStats(dailyStats)
                .build();
    }

    /**
     * 사용자별 상태 분포 통계 조회 (완료/미완료)
     */
    public StatusDistributionResponse getStatusDistribution(Long userId) {
        List<Todo> allTodos = todoRepository.findByUserId(userId);

        Long completedCount = allTodos.stream().filter(Todo::isCompleted).count();
        Long incompleteCount = allTodos.stream().filter(todo -> !todo.isCompleted()).count();

        Map<String, Long> statusCounts = new HashMap<>();
        statusCounts.put("COMPLETED", completedCount);
        statusCounts.put("INCOMPLETE", incompleteCount);

        return StatusDistributionResponse.builder()
                .statusCounts(statusCounts)
                .total((long) allTodos.size())
                .build();
    }

    /**
     * 사용자별 우선순위별 미완료 통계 조회
     */
    public IncompletePriorityResponse getIncompletePriorityStats(Long userId) {
        List<Todo> incompleteTodos = todoRepository.findByUserIdAndCompleted(userId, false);

        Map<String, Long> priorityCounts = incompleteTodos.stream()
            .collect(Collectors.groupingBy(
                todo -> todo.getPriority().name(),
                Collectors.counting()
            ));

        priorityCounts.putIfAbsent("HIGH", 0L);
        priorityCounts.putIfAbsent("MEDIUM", 0L);
        priorityCounts.putIfAbsent("LOW", 0L);

        return IncompletePriorityResponse.builder()
                .incompleteTodosByPriority(priorityCounts)
                .totalIncomplete((long) incompleteTodos.size())
                .build();
    }

    /**
     * 사용자별 기간 내 todos 조회
     */
    public TodosByPeriodResponse getTodosByPeriod(Long userId, LocalDate startDate, LocalDate endDate) {
        List<Todo> todos = todoRepository.findTodosByUserIdAndDateRange(userId, startDate, endDate);

        List<TodosByPeriodResponse.TodoInfo> todoInfos = todos.stream()
                .map(todo -> new TodosByPeriodResponse.TodoInfo(
                        todo.getId(),
                        todo.getTitle(),
                        todo.getDescription(),
                        todo.getStartDate(),
                        todo.getStartTime(),
                        todo.getEndDate(),
                        todo.getEndTime(),
                        todo.isCompleted(),
                        todo.getPriority().name(),
                        todo.isAllDay()
                ))
                .collect(Collectors.toList());

        return new TodosByPeriodResponse(todoInfos, todoInfos.size());
    }
}
