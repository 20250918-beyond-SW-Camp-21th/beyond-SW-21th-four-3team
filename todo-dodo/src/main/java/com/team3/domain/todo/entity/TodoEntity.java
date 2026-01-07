package com.team3.domain.todo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

//기본 일정
@Entity
@Table(
        name="todos",
        indexes={
                @Index(name="idx_todo_user",columnList="user_id"),
                @Index(name="idx_todo_start_date",columnList = "start_date")
        }
)
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TodoEntity {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @Column(name="user_id",nullable=false)
    private Long userId;

    @Column(nullable=false,length = 100)
    private String title;

    @Column(length=2000)
    private String description;

    @Column(name="start_date",nullable=false)
    private LocalDate startDate;

    @Column(name="start_time",nullable = false)
    private LocalTime startTime;

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

    @Column(name = "color_hex", length = 7)
    private String colorHex;

    public void update(
            String title,
            String description,
            LocalDate startDate,
            LocalTime startTime,
            LocalTime endTime,
            boolean allDay,
            TodoPriority priority,
            String colorHex
    ) {
        this.title = title;
        this.description = description;
        this.startDate = startDate;
        this.startTime = startTime;
        this.endTime = endTime;
        this.allDay = allDay;
        this.priority = priority;
        this.colorHex = colorHex;
    }

    public void changeRepeatType(RepeatType repeatType) {
        this.repeatType = repeatType;
    }

}
