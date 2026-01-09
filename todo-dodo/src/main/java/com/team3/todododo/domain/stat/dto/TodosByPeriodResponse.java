package com.team3.todododo.domain.stat.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class TodosByPeriodResponse {
    private List<TodoInfo> todos;
    private int totalCount;

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TodoInfo {
        private Long id;
        private String title;
        private String description;
        private LocalDate startDate;
        private LocalTime startTime;
        private LocalDate endDate;
        private LocalTime endTime;
        private boolean completed;
        private String priority;
        private boolean allDay;
    }
}