package com.smartassetx.service.impl;

import com.smartassetx.dto.AssetRequestDto;
import com.smartassetx.entity.*;
import com.smartassetx.exception.BadRequestException;
import com.smartassetx.exception.ResourceNotFoundException;
import com.smartassetx.repository.*;
import com.smartassetx.service.AssetRequestService;
import com.smartassetx.service.AuthService;
import com.smartassetx.service.NotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AssetRequestServiceImpl implements AssetRequestService {

    private final AssetRequestRepository requestRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final AssetRepository assetRepository;
    private final AssetAssignmentRepository assignmentRepository;
    private final NotificationService notificationService;
    private final AuthService authService;

    public AssetRequestServiceImpl(AssetRequestRepository requestRepository,
                                   CategoryRepository categoryRepository,
                                   UserRepository userRepository,
                                   AssetRepository assetRepository,
                                   AssetAssignmentRepository assignmentRepository,
                                   NotificationService notificationService,
                                   AuthService authService) {
        this.requestRepository = requestRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.assetRepository = assetRepository;
        this.assignmentRepository = assignmentRepository;
        this.notificationService = notificationService;
        this.authService = authService;
    }

    @Override
    @Transactional
    public AssetRequestDto createRequest(AssetRequestDto dto) {
        User employee = authService.getCurrentUserEntity();

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + dto.getCategoryId()));

        AssetRequest request = AssetRequest.builder()
                .employee(employee)
                .assetCategory(category)
                .reason(dto.getReason())
                .status("Pending")
                .requestDate(LocalDateTime.now())
                .build();

        AssetRequest saved = requestRepository.save(request);
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public AssetRequestDto approveRequest(Long requestId) {
        AssetRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Asset request not found with ID: " + requestId));

        if (!"Pending".equalsIgnoreCase(request.getStatus())) {
            throw new BadRequestException("Request is already processed. Status: " + request.getStatus());
        }

        User manager = authService.getCurrentUserEntity();
        User employee = request.getEmployee();
        Category category = request.getAssetCategory();

        request.setStatus("Approved");
        request.setApprovedBy(manager);
        request.setApprovedDate(LocalDateTime.now());
        AssetRequest savedRequest = requestRepository.save(request);

        List<Asset> availableAssets = assetRepository.filterAssets(category.getId(), null, "Available");
        String notificationMessage;
        
        if (!availableAssets.isEmpty()) {
            Asset assetToAssign = availableAssets.get(0);
            
            assetToAssign.setStatus("Assigned");
            assetToAssign.setDepartment(employee.getDepartment());
            assetRepository.save(assetToAssign);

            AssetAssignment assignment = AssetAssignment.builder()
                    .asset(assetToAssign)
                    .employee(employee)
                    .assignedBy(manager)
                    .assignedDate(LocalDateTime.now())
                    .remarks("Assigned via Request Approval (Request ID: " + requestId + ")")
                    .build();
            assignmentRepository.save(assignment);

            notificationMessage = "✅ Your request for " + assetToAssign.getAssetName() + " has been approved.";
        } else {
            notificationMessage = "✅ Your request for " + category.getCategoryName() + " has been approved (Awaiting asset allocation by admin).";
        }

        notificationService.createNotification(employee, notificationMessage);

        return mapToDto(savedRequest);
    }

    @Override
    @Transactional
    public AssetRequestDto rejectRequest(Long requestId) {
        AssetRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Asset request not found with ID: " + requestId));

        if (!"Pending".equalsIgnoreCase(request.getStatus())) {
            throw new BadRequestException("Request is already processed. Status: " + request.getStatus());
        }

        User manager = authService.getCurrentUserEntity();
        request.setStatus("Rejected");
        request.setApprovedBy(manager);
        request.setApprovedDate(LocalDateTime.now());
        AssetRequest savedRequest = requestRepository.save(request);

        String notificationMessage = "❌ Your asset request has been rejected.";
        notificationService.createNotification(request.getEmployee(), notificationMessage);

        return mapToDto(savedRequest);
    }

    @Override
    public List<AssetRequestDto> getPendingRequests() {
        User currentUser = authService.getCurrentUserEntity();
        if (currentUser.getRole() == Role.ADMIN) {
            return requestRepository.findByStatus("Pending").stream()
                    .map(this::mapToDto)
                    .collect(Collectors.toList());
        } else if (currentUser.getRole() == Role.MANAGER) {
            if (currentUser.getDepartment() == null) {
                return List.of();
            }
            return requestRepository.findByEmployeeDepartmentIdAndStatus(currentUser.getDepartment().getId(), "Pending").stream()
                    .map(this::mapToDto)
                    .collect(Collectors.toList());
        }
        return List.of();
    }

    @Override
    public List<AssetRequestDto> getMyRequests() {
        User employee = authService.getCurrentUserEntity();
        return requestRepository.findByEmployeeId(employee.getId()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<AssetRequestDto> getAllRequests() {
        return requestRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private AssetRequestDto mapToDto(AssetRequest request) {
        return AssetRequestDto.builder()
                .id(request.getId())
                .employeeId(request.getEmployee().getId())
                .employeeName(request.getEmployee().getFullName())
                .employeeEmail(request.getEmployee().getEmail())
                .categoryId(request.getAssetCategory().getId())
                .categoryName(request.getAssetCategory().getCategoryName())
                .reason(request.getReason())
                .requestDate(request.getRequestDate())
                .status(request.getStatus())
                .approvedById(request.getApprovedBy() != null ? request.getApprovedBy().getId() : null)
                .approvedByName(request.getApprovedBy() != null ? request.getApprovedBy().getFullName() : null)
                .approvedDate(request.getApprovedDate())
                .build();
    }
}
