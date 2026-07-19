package com.smartassetx.service;

import com.smartassetx.dto.AssetAssignmentDto;
import java.util.List;

public interface AssetAssignmentService {
    AssetAssignmentDto assignAsset(AssetAssignmentDto dto);
    AssetAssignmentDto returnAsset(Long assignmentId, String remarks);
    List<AssetAssignmentDto> getAllAssignments();
    List<AssetAssignmentDto> getEmployeeAssignmentHistory(Long employeeId);
    List<AssetAssignmentDto> getMyAssignedAssets();
}
