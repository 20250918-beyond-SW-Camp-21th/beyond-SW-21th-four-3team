package com.team3.todododo.domain.todo.controller;

import com.team3.todododo.common.response.ApiResult;
import com.team3.todododo.domain.todo.dto.request.TodoRequest;
import com.team3.todododo.domain.todo.dto.response.TodoResponse;
import com.team3.todododo.domain.todo.service.TodoServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

// 생성 / 수정 / 삭제 / 완료
@RestController
@RequiredArgsConstructor
public class TodoController {

    private final TodoServiceImpl todoServiceImpl;
     /* =========================
       유저별 조회
     ========================= */
    @GetMapping("/api/todo/me")
    public ApiResult<List<TodoResponse>> me(
            Principal principal
    ) {
        String loginId=principal.getName();
        return ApiResult.success(todoServiceImpl.getTodo(loginId));
    }

    /* =========================
       todo 생성
     ========================= */
    @PostMapping("/api/todo")
    public ResponseEntity<ApiResult<Long>> addTodo(
            @RequestBody TodoRequest todoRequest,
            Principal principal
    ) {
        String loginId=principal.getName();
        Long todoId = todoServiceImpl.todoCreate(todoRequest, loginId);


        return ResponseEntity.ok(ApiResult.success(todoId));
    }

    /* =========================
       todo 수정
     ========================= */
    @PutMapping("/api/todo/{todoId}")
    public ResponseEntity<ApiResult<Void>> updateTodo(
            @PathVariable Long todoId,
            @RequestBody TodoRequest todoRequest,
            Principal principal
    ) {
        String loginId=principal.getName();

        todoServiceImpl.todoUpdate(todoId, todoRequest, loginId);

        return ResponseEntity.ok(ApiResult.success());
    }

    /* =========================
       todo 삭제
     ========================= */
    @DeleteMapping("/api/todo/{todoId}")
    public ResponseEntity<ApiResult<Void>> deleteTodo(
            @PathVariable Long todoId,
            Principal principal
    ) {
        String loginId=principal.getName();

        todoServiceImpl.todoDelete(todoId, loginId);

        return ResponseEntity.ok(ApiResult.success());
    }

    /* =========================
       todo 완료 / 미완료 변경
     ========================= */
    @PatchMapping("/api/todo/{todoId}/complete")
    public ResponseEntity<ApiResult<Void>> changeCompleted(
            @PathVariable Long todoId,
            @RequestParam boolean completed,
            Principal principal
    ) {
        String loginId=principal.getName();

        todoServiceImpl.changeCompleted(todoId, completed, loginId);

        return ResponseEntity.ok(ApiResult.success());
    }
}
