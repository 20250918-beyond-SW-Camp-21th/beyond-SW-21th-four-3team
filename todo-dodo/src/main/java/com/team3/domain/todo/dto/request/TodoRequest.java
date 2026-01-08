package com.team3.domain.todo.dto.request;

import com.team3.domain.todo.entity.RepeatType;
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
public class TodoRequest {
    String title;
    String description;
    LocalDate startDate;
    LocalTime startTime;
    LocalDate endDate;
    LocalTime endTime;
    boolean allday;
    RepeatType repeatType;
    TodoPriority priority;
    boolean completed;
    Set<DayOfWeek> daysOfWeek;
    LocalDate repeatUntilDate;
}
