package com.team3.domain.todo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

//날짜별 완료 체크
@Entity
@Table(
        name="todo_completion",
        uniqueConstraints = {
                @UniqueConstraint(
                        name="uk_todo_date",
                        columnNames = {"todo_id", "target_date"}
                )
        },
        indexes = {
                @Index(name="idx_completion_todo",columnList = "todo_id"),
                @Index(name="idx_completion_date",columnList="target_date")
        }
)
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TodoCompletionEntity {

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @Column(name = "todo_id", nullable = false)
    private Long todoId;

    @Column(name = "target_date", nullable = false)
    private LocalDate targetDate;

    @Column(nullable = false)
    private boolean completed;

    public static TodoCompletionEntity complete(Long todoId, LocalDate date) {
        return TodoCompletionEntity.builder()
                .todoId(todoId)
                .targetDate(date)
                .completed(true)
                .build();
    }

    public void uncomplete() {
        this.completed = false;
    }
}
