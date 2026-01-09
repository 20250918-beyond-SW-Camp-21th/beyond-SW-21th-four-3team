package com.team3.todododo.domain.stat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyStatResponse {
    private List<DailyStat> dailyStats;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyStat {
        private LocalDate date;
        private Long completedCount;
        private Long createdCount;
    }
}