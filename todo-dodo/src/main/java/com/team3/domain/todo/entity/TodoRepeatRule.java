package com.team3.domain.todo.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

//요일 반복 규칙
@Entity
@Table(name="todo_repeat_rule")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TodoRepeatRule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "todo_id", nullable = false)
    private Long todoId;

    @CollectionTable(
            name = "todo_repeat_days",
            joinColumns = @JoinColumn(name = "repeat_rule_id")
    )
    @Enumerated(EnumType.STRING)
    @Column(name = "day_of_week", nullable = false)
    private Set<DayOfWeek> repeatDays = new HashSet<>();

    @Column(name = "repeat_until")
    private LocalDate repeatUntil;

    public boolean isRepeatDay(DayOfWeek dayOfWeek) {
        return repeatDays.contains(dayOfWeek);
    }

    public boolean isDateExpired(LocalDate date) {
        return repeatUntil != null && date.isAfter(repeatUntil);
    }

    public void changeRepeatDays(Set<DayOfWeek> days) {
        this.repeatDays.clear();
        this.repeatDays.addAll(days);
    }

    public void changeRepeatUntil(LocalDate repeatUntil) {
        this.repeatUntil = repeatUntil;
    }
}
