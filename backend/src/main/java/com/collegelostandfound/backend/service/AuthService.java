package com.collegelostandfound.backend.service;

import com.collegelostandfound.backend.dto.request.ForgotPasswordRequest;
import com.collegelostandfound.backend.dto.request.LoginRequest;
import com.collegelostandfound.backend.dto.request.RegisterRequest;
import com.collegelostandfound.backend.dto.request.ResetPasswordRequest;
import com.collegelostandfound.backend.dto.response.LoginResponse;
import com.collegelostandfound.backend.dto.response.MessageResponse;
import com.collegelostandfound.backend.dto.response.RegisterResponse;

public interface AuthService {

    RegisterResponse register(RegisterRequest request);

    LoginResponse login(LoginRequest request);

    MessageResponse forgotPassword(ForgotPasswordRequest request);

    MessageResponse resetPassword(ResetPasswordRequest request);
}