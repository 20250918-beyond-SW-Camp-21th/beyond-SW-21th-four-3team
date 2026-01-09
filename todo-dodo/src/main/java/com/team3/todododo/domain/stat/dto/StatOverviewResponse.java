package com.team3.todododo.domain.stat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatOverviewResponse {
    private Long totalTodos;
    private Long completedTodos;
    private Long incompleteTodos;
    private Double completionRate;
}