package com.team3.domain.todo.controller;

import com.team3.common.response.ApiResult;
import com.team3.domain.todo.dto.request.TodoRequest;
import com.team3.domain.todo.dto.response.TodoResponse;
import com.team3.domain.todo.service.TodoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

// 생성 / 수정 / 삭제 / 완료
@RestController
@RequiredArgsConstructor
public class TodoController {

    private final TodoService todoService;
     /* =========================
       유저별 조회
     ========================= */
    @GetMapping("/api/v1/todo/me")
    public ApiResult<TodoResponse> me(
            Principal principal
    ) {
        Long userId = Long.parseLong(principal.getName());
        return ApiResult.success((TodoResponse) todoService.getTodo(userId));
    }

    /* =========================
       todo 생성
     ========================= */
    @PostMapping("/api/v1/todo")
    public ResponseEntity<ApiResult<Long>> addTodo(
            @RequestBody TodoRequest todoRequest,
            Principal principal
    ) {
        Long userId = Long.parseLong(principal.getName());

        Long todoId = todoService.todoCreate(todoRequest, userId);

        return ResponseEntity.ok(ApiResult.success(todoId));
    }

    /* =========================
       todo 수정
     ========================= */
    @PutMapping("/api/v1/todo/{todoId}")
    public ResponseEntity<ApiResult<Void>> updateTodo(
            @PathVariable Long todoId,
            @RequestBody TodoRequest todoRequest,
            Principal principal
    ) {
        Long userId = Long.parseLong(principal.getName());

        todoService.todoUpdate(todoId, todoRequest, userId);

        return ResponseEntity.ok(ApiResult.success());
    }

    /* =========================
       todo 삭제
     ========================= */
    @DeleteMapping("/api/v1/todo/{todoId}")
    public ResponseEntity<ApiResult<Void>> deleteTodo(
            @PathVariable Long todoId,
            Principal principal
    ) {
        Long userId = Long.parseLong(principal.getName());

        todoService.todoDelete(todoId, userId);

        return ResponseEntity.ok(ApiResult.success());
    }

    /* =========================
       todo 완료 / 미완료 변경
     ========================= */
    @PatchMapping("/api/v1/todo/{todoId}/complete")
    public ResponseEntity<ApiResult<Void>> changeCompleted(
            @PathVariable Long todoId,
            @RequestParam boolean completed,
            Principal principal
    ) {
        Long userId = Long.parseLong(principal.getName());

        todoService.changeCompleted(todoId, completed, userId);

        return ResponseEntity.ok(ApiResult.success());
    }
}
