package com.team3.domain.todo.repository;

import com.team3.domain.todo.dto.response.TodoResponse;
import com.team3.domain.todo.entity.Todo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TodoRepository extends JpaRepository<Todo,Long> {
    List<TodoResponse> getTodosByUserId(Long userId);
}
