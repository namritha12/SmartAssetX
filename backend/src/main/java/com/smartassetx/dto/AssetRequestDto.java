package com.smartassetx.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssetRequestDto {
    private Long id;
    
    private Long employeeId;
    private String employeeName;
    private String employeeEmail;
    
    @NotNull(message = "Category ID is required")
    private Long categoryId;
    
    private String categoryName;
    
    @NotBlank(message = "Reason is required")
    private String reason;
    
    private LocalDateTime requestDate;
    
    private String status; // Pending, Approved, Rejected
    
    private Long approvedById;
    private String approvedByName;
    private LocalDateTime approvedDate;
}
