package com.team3.todododo.domain.stat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.Map;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IncompletePriorityResponse {
    private Map<String, Long> incompleteTodosByPriority;
    private Long totalIncomplete;
}