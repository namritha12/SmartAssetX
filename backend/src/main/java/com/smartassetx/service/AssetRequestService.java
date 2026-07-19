package com.smartassetx.service;

import com.smartassetx.dto.AssetRequestDto;
import java.util.List;

public interface AssetRequestService {
    AssetRequestDto createRequest(AssetRequestDto dto);
    AssetRequestDto approveRequest(Long requestId);
    AssetRequestDto rejectRequest(Long requestId);
    List<AssetRequestDto> getPendingRequests();
    List<AssetRequestDto> getMyRequests();
    List<AssetRequestDto> getAllRequests();
}
