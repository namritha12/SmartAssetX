package com.smartassetx.controller;

import com.smartassetx.dto.AssetAssignmentDto;
import com.smartassetx.service.AssetAssignmentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assignments")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AssetAssignmentController {

    private final AssetAssignmentService assignmentService;

    public AssetAssignmentController(AssetAssignmentService assignmentService) {
        this.assignmentService = assignmentService;
    }

    @PostMapping("/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AssetAssignmentDto> assignAsset(@Valid @RequestBody AssetAssignmentDto dto) {
        return ResponseEntity.ok(assignmentService.assignAsset(dto));
    }

    @PostMapping("/return/{id}")
    public ResponseEntity<AssetAssignmentDto> returnAsset(@PathVariable Long id, @RequestParam(required = false) String remarks) {
        return ResponseEntity.ok(assignmentService.returnAsset(id, remarks));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<AssetAssignmentDto>> getAllAssignments() {
        return ResponseEntity.ok(assignmentService.getAllAssignments());
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<AssetAssignmentDto>> getEmployeeAssignmentHistory(@PathVariable Long employeeId) {
        return ResponseEntity.ok(assignmentService.getEmployeeAssignmentHistory(employeeId));
    }

    @GetMapping("/my")
    public ResponseEntity<List<AssetAssignmentDto>> getMyAssignedAssets() {
        return ResponseEntity.ok(assignmentService.getMyAssignedAssets());
    }
}
