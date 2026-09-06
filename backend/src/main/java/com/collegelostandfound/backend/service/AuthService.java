package com.collegelostandfound.backend.service;

import com.collegelostandfound.backend.dto.request.LoginRequest;
import com.collegelostandfound.backend.dto.request.RegisterRequest;
import com.collegelostandfound.backend.dto.response.LoginResponse;
import com.collegelostandfound.backend.dto.response.RegisterResponse;

public interface AuthService {

    RegisterResponse register(RegisterRequest request);

    LoginResponse login(LoginRequest request);
}