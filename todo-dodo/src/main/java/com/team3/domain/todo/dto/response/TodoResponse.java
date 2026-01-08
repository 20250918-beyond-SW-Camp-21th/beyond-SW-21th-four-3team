package com.team3.domain.todo.dto.response;

import com.team3.domain.todo.entity.RepeatType;
import com.team3.domain.todo.entity.Todo;
import com.team3.domain.todo.entity.TodoPriority;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Set;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class TodoResponse {

    private Long id;

    private String title;
    private String description;

    private LocalDate startDate;
    private LocalTime startTime;

    private LocalDate endDate;
    private LocalTime endTime;

    private boolean allDay;

    private RepeatType repeatType;
    private Set<DayOfWeek> daysOfWeek;
    private LocalDate repeatUntilDate;

    private TodoPriority priority;
    private boolean completed;

    public static TodoResponse from(Todo todo) {
        return new TodoResponse(
                todo.getId(),
                todo.getTitle(),
                todo.getDescription(),
                todo.getStartDate(),
                todo.getStartTime(),
                todo.getEndDate(),
                todo.getEndTime(),
                todo.isAllDay(),
                todo.getRepeatType(),
                todo.getDayOfWeeks(),
                todo.getRepeatUntil(),
                todo.getPriority(),
                todo.isCompleted()
        );
    }
}
