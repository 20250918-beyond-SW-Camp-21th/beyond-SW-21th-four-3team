package com.team3.domain.auth.controller;


import com.team3.common.response.ApiResult;
import com.team3.domain.auth.dto.request.PasswordResetConfirmRequest;
import com.team3.domain.auth.dto.request.PasswordResetRequest;
import com.team3.domain.auth.service.PasswordResetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth/password/reset")
@RequiredArgsConstructor
public class PasswordResetController {

    private final PasswordResetService passwordResetService;

    @PostMapping("/request")
    public ApiResult<Void> requestReset(@Valid @RequestBody PasswordResetRequest req) {
        passwordResetService.requestReset(req);
        return ApiResult.success(null, "입력하신 정보가 맞다면 이메일로 재설정 코드를 전송했습니다.");
    }

    @PostMapping("/confirm")
    public ApiResult<Void> confirmReset(@Valid @RequestBody PasswordResetConfirmRequest req) {
        passwordResetService.confirmReset(req);
        return ApiResult.success(null, "비밀번호가 변경되었습니다.");
    }
}
