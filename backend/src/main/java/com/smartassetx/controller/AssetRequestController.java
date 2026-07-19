package com.smartassetx.controller;

import com.smartassetx.dto.AssetRequestDto;
import com.smartassetx.service.AssetRequestService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/requests")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AssetRequestController {

    private final AssetRequestService requestService;

    public AssetRequestController(AssetRequestService requestService) {
        this.requestService = requestService;
    }

    @PostMapping
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<AssetRequestDto> createRequest(@Valid @RequestBody AssetRequestDto dto) {
        return ResponseEntity.ok(requestService.createRequest(dto));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<AssetRequestDto> approveRequest(@PathVariable Long id) {
        return ResponseEntity.ok(requestService.approveRequest(id));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<AssetRequestDto> rejectRequest(@PathVariable Long id) {
        return ResponseEntity.ok(requestService.rejectRequest(id));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<List<AssetRequestDto>> getPendingRequests() {
        return ResponseEntity.ok(requestService.getPendingRequests());
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<List<AssetRequestDto>> getMyRequests() {
        return ResponseEntity.ok(requestService.getMyRequests());
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AssetRequestDto>> getAllRequests() {
        return ResponseEntity.ok(requestService.getAllRequests());
    }
}
