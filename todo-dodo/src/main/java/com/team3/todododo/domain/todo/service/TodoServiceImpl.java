package com.team3.todododo.domain.todo.service;

import com.team3.todododo.domain.todo.dto.request.TodoRequest;
import com.team3.todododo.domain.todo.dto.response.TodoResponse;

import java.util.List;

public interface TodoServiceImpl {
    Long todoCreate(TodoRequest request, String loginId);
    void todoUpdate(Long todoId, TodoRequest request, String loginId);
    void todoDelete(Long todoId, String loginId);
    void changeCompleted(Long todoId, boolean completed, String loginId);
    List<TodoResponse> getTodo(String loginId);
}
