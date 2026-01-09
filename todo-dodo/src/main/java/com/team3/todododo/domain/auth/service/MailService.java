package com.team3.todododo.domain.auth.service;

public interface MailService {
    void sendPasswordResetCode(String to, String code);
}

