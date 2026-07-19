package com.smartassetx.dto;

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
public class AssetAssignmentDto {
    private Long id;

    @NotNull(message = "Asset ID is required")
    private Long assetId;
    
    private String assetCode;
    private String assetName;

    @NotNull(message = "Employee ID is required")
    private Long employeeId;
    
    private String employeeName;
    private String employeeEmail;

    private Long assignedById;
    private String assignedByName;

    private LocalDateTime assignedDate;
    
    private LocalDateTime expectedReturnDate;
    
    private LocalDateTime actualReturnDate;
    
    private String remarks;
}
