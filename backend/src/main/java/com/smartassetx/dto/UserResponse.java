package com.smartassetx.dto;

import com.smartassetx.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String employeeId;
    private String fullName;
    private String email;
    private String phone;
    private String designation;
    private Role role;
    private String status;
    private LocalDateTime createdAt;
    private Long departmentId;
    private String departmentName;
}
