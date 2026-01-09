package com.team3.todododo.domain.auth.service;


import com.team3.todododo.common.error.CoreException;
import com.team3.todododo.common.error.ErrorCode;
import com.team3.todododo.domain.auth.Repository.UserRepository;
import com.team3.todododo.domain.auth.dto.request.SignupRequest;
import com.team3.todododo.domain.auth.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * 회원가입
     */
    @Transactional
    public Long signup(SignupRequest request) {
        // 1. 로그인 ID 중복 체크
        if (userRepository.existsByLoginId(request.getLoginId())) {
            throw new CoreException(ErrorCode.DUPLICATE_LOGIN_ID);
        }

        // 2. 이메일 중복 체크
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new CoreException(ErrorCode.DUPLICATE_EMAIL);
        }

        // 3. 비밀번호 암호화
        String encodedPassword = passwordEncoder.encode(request.getPassword());

        // 4. 사용자 생성
        User user = User.builder()
                .loginId(request.getLoginId())
                .email(request.getEmail())
                .password(encodedPassword)
                .nickname(request.getNickname())
                .build();

        User savedUser = userRepository.save(user);
        return savedUser.getId();
    }
}