package com.team3.todododo.domain.todo.service;

import com.team3.todododo.domain.auth.Repository.UserRepository;
import com.team3.todododo.domain.auth.entity.User;
import com.team3.todododo.domain.todo.dto.request.TodoRequest;
import com.team3.todododo.domain.todo.dto.response.TodoResponse;
import com.team3.todododo.domain.todo.entity.RepeatType;
import com.team3.todododo.domain.todo.entity.Todo;
import com.team3.todododo.domain.todo.repository.TodoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class TodoService {

    private final TodoRepository todoRepository;
    private final UserRepository userRepository;

    /* =========================
       todo 생성
     ========================= */
    @Transactional
    public Long todoCreate(TodoRequest request, String loginId) {

        validateRequest(request);

        Optional<User> user=userRepository.findByLoginId(loginId);


        RepeatType repeatType =
                request.getRepeatType() == null ? RepeatType.NONE : request.getRepeatType();

        Todo todo = Todo.builder()
                .userId(user.get().getId())
                .title(request.getTitle())
                .description(request.getDescription())
                .startDate(request.getStartDate())
                .startTime(request.getStartTime())
                .endDate(request.getEndDate())
                .endTime(request.getEndTime())
                .allDay(request.isAllday())
                .repeatType(repeatType)
                .priority(request.getPriority())
                .completed(false)
                .dayOfWeeks(
                        request.getDaysOfWeek() == null
                                ? Set.of()
                                : request.getDaysOfWeek()
                )
                .repeatUntil(request.getRepeatUntilDate())
                .build();

        return todoRepository.save(todo).getId();
    }

    /* =========================
       todo 수정
     ========================= */
    @Transactional
    public void todoUpdate(Long todoId, TodoRequest request, String loginId) {

        Optional<User> user=userRepository.findByLoginId(loginId);

        validateRequest(request);

        Todo todo = todoRepository.findById(todoId)
                .orElseThrow(() -> new IllegalArgumentException("Todo를 찾을 수 없습니다."));

        // 소유자 검증
        if (!todo.getUserId().equals(user.get().getId())) {
            throw new IllegalStateException("수정 권한이 없습니다.");
        }

        RepeatType repeatType =
                request.getRepeatType() == null ? RepeatType.NONE : request.getRepeatType();

        todo.update(
                request.getTitle(),
                request.getDescription(),
                request.getStartDate(),
                request.getStartTime(),
                request.getEndDate(),
                request.getEndTime(),
                request.isAllday(),
                repeatType,
                request.getPriority(),
                request.getDaysOfWeek() == null ? Set.of() : request.getDaysOfWeek(),
                request.getRepeatUntilDate()
        );
    }

    /* =========================
       todo 삭제
     ========================= */
    @Transactional
    public void todoDelete(Long todoId, String loginId) {

        Optional<User> user=userRepository.findByLoginId(loginId);

        Todo todo = todoRepository.findById(todoId)
                .orElseThrow(() -> new IllegalArgumentException("Todo를 찾을 수 없습니다."));

        if (!todo.getUserId().equals(user.get().getId())) {
            throw new IllegalStateException("삭제 권한이 없습니다.");
        }

        todoRepository.delete(todo);
    }

    /* =========================
       todo 완료 / 미완료 변경
     ========================= */
    @Transactional
    public void changeCompleted(Long todoId, boolean completed, String loginId) {

        Optional<User> user=userRepository.findByLoginId(loginId);

        Todo todo = todoRepository.findById(todoId)
                .orElseThrow(() -> new IllegalArgumentException("Todo를 찾을 수 없습니다."));

        if (!todo.getUserId().equals(user.get().getId())) {
            throw new IllegalStateException("완료 상태 변경 권한이 없습니다.");
        }

        todo.changeCompleted(completed);
    }

    @Transactional(readOnly = true)
    public List<TodoResponse> getTodo(String loginId) {

        User user = userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        List<Todo> todoList = todoRepository.getTodosByUserId(user.getId());

        return TodoResponse.froms(todoList);
    }


    /* =========================
       공통 validation
     ========================= */
    private void validateRequest(TodoRequest request) {

        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw new IllegalArgumentException("title은 필수입니다.");
        }
        if (request.getStartDate() == null || request.getEndDate() == null) {
            throw new IllegalArgumentException("startDate / endDate는 필수입니다.");
        }
        if (request.getStartTime() == null || request.getEndTime() == null) {
            throw new IllegalArgumentException("startTime / endTime은 필수입니다.");
        }

        if (request.getStartDate().isAfter(request.getEndDate())) {
            throw new IllegalArgumentException("startDate가 endDate보다 늦을 수 없습니다.");
        }
        if (request.getStartDate().isEqual(request.getEndDate())
                && request.getStartTime().isAfter(request.getEndTime())) {
            throw new IllegalArgumentException("startTime이 endTime보다 늦을 수 없습니다.");
        }

        RepeatType repeatType =
                request.getRepeatType() == null ? RepeatType.NONE : request.getRepeatType();

        if (repeatType != RepeatType.NONE
                && (request.getDaysOfWeek() == null || request.getDaysOfWeek().isEmpty())) {
            throw new IllegalArgumentException("반복 일정은 daysOfWeek가 필요합니다.");
        }
    }
}
