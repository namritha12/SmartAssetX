package com.smartassetx.service.impl;

import com.smartassetx.dto.AssetAssignmentDto;
import com.smartassetx.entity.Asset;
import com.smartassetx.entity.AssetAssignment;
import com.smartassetx.entity.User;
import com.smartassetx.exception.BadRequestException;
import com.smartassetx.exception.ResourceNotFoundException;
import com.smartassetx.repository.AssetAssignmentRepository;
import com.smartassetx.repository.AssetRepository;
import com.smartassetx.repository.UserRepository;
import com.smartassetx.service.AssetAssignmentService;
import com.smartassetx.service.AuthService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AssetAssignmentServiceImpl implements AssetAssignmentService {

    private final AssetAssignmentRepository assignmentRepository;
    private final AssetRepository assetRepository;
    private final UserRepository userRepository;
    private final AuthService authService;

    public AssetAssignmentServiceImpl(AssetAssignmentRepository assignmentRepository,
                                      AssetRepository assetRepository,
                                      UserRepository userRepository,
                                      AuthService authService) {
        this.assignmentRepository = assignmentRepository;
        this.assetRepository = assetRepository;
        this.userRepository = userRepository;
        this.authService = authService;
    }

    @Override
    @Transactional
    public AssetAssignmentDto assignAsset(AssetAssignmentDto dto) {
        Asset asset = assetRepository.findById(dto.getAssetId())
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found with ID: " + dto.getAssetId()));

        if (!"Available".equalsIgnoreCase(asset.getStatus())) {
            throw new BadRequestException("Asset is not available for assignment. Current status: " + asset.getStatus());
        }

        User employee = userRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + dto.getEmployeeId()));

        User admin = authService.getCurrentUserEntity();

        AssetAssignment assignment = AssetAssignment.builder()
                .asset(asset)
                .employee(employee)
                .assignedBy(admin)
                .assignedDate(LocalDateTime.now())
                .expectedReturnDate(dto.getExpectedReturnDate())
                .remarks(dto.getRemarks())
                .build();

        // Update asset status and department
        asset.setStatus("Assigned");
        asset.setDepartment(employee.getDepartment());
        assetRepository.save(asset);

        AssetAssignment saved = assignmentRepository.save(assignment);
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public AssetAssignmentDto returnAsset(Long assignmentId, String remarks) {
        AssetAssignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment record not found with ID: " + assignmentId));

        if (assignment.getActualReturnDate() != null) {
            throw new BadRequestException("Asset has already been returned");
        }

        assignment.setActualReturnDate(LocalDateTime.now());
        if (remarks != null && !remarks.isBlank()) {
            assignment.setRemarks(assignment.getRemarks() + " | Return remarks: " + remarks);
        }

        // Update asset status and release department
        Asset asset = assignment.getAsset();
        asset.setStatus("Available");
        asset.setDepartment(null);
        assetRepository.save(asset);

        AssetAssignment updated = assignmentRepository.save(assignment);
        return mapToDto(updated);
    }

    @Override
    public List<AssetAssignmentDto> getAllAssignments() {
        return assignmentRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<AssetAssignmentDto> getEmployeeAssignmentHistory(Long employeeId) {
        return assignmentRepository.findByEmployeeId(employeeId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<AssetAssignmentDto> getMyAssignedAssets() {
        User employee = authService.getCurrentUserEntity();
        return assignmentRepository.findByEmployeeIdAndActualReturnDateIsNull(employee.getId()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private AssetAssignmentDto mapToDto(AssetAssignment assignment) {
        return AssetAssignmentDto.builder()
                .id(assignment.getId())
                .assetId(assignment.getAsset().getId())
                .assetCode(assignment.getAsset().getAssetCode())
                .assetName(assignment.getAsset().getAssetName())
                .employeeId(assignment.getEmployee().getId())
                .employeeName(assignment.getEmployee().getFullName())
                .employeeEmail(assignment.getEmployee().getEmail())
                .assignedById(assignment.getAssignedBy().getId())
                .assignedByName(assignment.getAssignedBy().getFullName())
                .assignedDate(assignment.getAssignedDate())
                .expectedReturnDate(assignment.getExpectedReturnDate())
                .actualReturnDate(assignment.getActualReturnDate())
                .remarks(assignment.getRemarks())
                .build();
    }
}
