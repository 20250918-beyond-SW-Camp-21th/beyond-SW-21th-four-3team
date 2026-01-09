package com.team3.domain.stat.dto;

/**
 * 통계 조회 기간 enum
 */
public enum StatPeriod {
    WEEK(7),      // 최근 7일
    MONTH(30),    // 최근 30일
    THREE_MONTHS(90); // 최근 90일

    private final int days;

    StatPeriod(int days) {
        this.days = days;
    }

    public int getDays() {
        return days;
    }
}