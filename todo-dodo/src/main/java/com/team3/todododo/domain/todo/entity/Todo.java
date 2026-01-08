package com.team3.todododo.domain.todo.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.Set;

// 기본 일정
@Entity
@Table(
        name = "todos",
        indexes = {
                @Index(name = "idx_todo_user", columnList = "user_id"),
                @Index(name = "idx_todo_start_date", columnList = "start_date")
        }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
public class Todo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 소유 사용자 ID */
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(length = 2000)
    private String description;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "all_day", nullable = false)
    private boolean allDay;

    @Enumerated(EnumType.STRING)
    @Column(name = "repeat_type", nullable = false)
    private RepeatType repeatType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TodoPriority priority;

    @Column(nullable = false)
    private boolean completed;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "todo_days",
            joinColumns = @JoinColumn(name = "todo_id")
    )
    @Enumerated(EnumType.STRING)
    @Column(name = "day_of_week")
    private Set<DayOfWeek> dayOfWeeks = new HashSet<>();

    @Column(name = "repeat_until")
    private LocalDate repeatUntil;


    public void changeRepeatType(RepeatType repeatType) {
        this.repeatType = repeatType;
    }

    public void changeCompleted(boolean completed) {
        this.completed = completed;
    }

    public void update(
            String title,
            String description,
            LocalDate startDate,
            LocalTime startTime,
            LocalDate endDate,
            LocalTime endTime,
            boolean allDay,
            RepeatType repeatType,
            TodoPriority priority,
            Set<DayOfWeek> dayOfWeeks,
            LocalDate repeatUntil
    ) {
        this.title = title;
        this.description = description;
        this.startDate = startDate;
        this.startTime = startTime;
        this.endDate = endDate;
        this.endTime = endTime;
        this.allDay = allDay;
        this.repeatType = repeatType;
        this.priority = priority;
        this.dayOfWeeks = dayOfWeeks;
        this.repeatUntil = repeatUntil;
    }
}
