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
public class StatusDistributionResponse {
    private Map<String, Long> statusCounts;
    private Long total;
}