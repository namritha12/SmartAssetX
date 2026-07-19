package com.smartassetx.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssetDto {

    private Long id;

    @NotBlank(message = "Asset Code is required")
    private String assetCode;

    @NotBlank(message = "Asset Name is required")
    private String assetName;

    private String serialNumber;

    private String brand;

    private String model;

    private LocalDate purchaseDate;

    private BigDecimal purchaseCost;

    private LocalDate warrantyExpiry;

    private LocalDate amcExpiry;

    @NotBlank(message = "Status is required")
    private String status; // Available, Assigned, Maintenance, Damaged, Lost, Retired

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    private String categoryName;

    private Long departmentId;

    private String departmentName;
}
