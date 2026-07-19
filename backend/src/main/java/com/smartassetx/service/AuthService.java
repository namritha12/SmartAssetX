package com.smartassetx.service;

import com.smartassetx.dto.*;
import com.smartassetx.entity.User;

public interface AuthService {
    UserResponse register(RegisterRequest registerRequest);
    LoginResponse login(LoginRequest loginRequest);
    UserResponse getCurrentUserProfile();
    void changePassword(PasswordChangeRequest request);
    User getCurrentUserEntity();
}
