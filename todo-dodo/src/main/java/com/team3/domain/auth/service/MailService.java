package com.team3.domain.auth.service;

public interface MailService {
    void sendPasswordResetCode(String to, String code);
}

