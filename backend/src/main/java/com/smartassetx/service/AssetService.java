package com.smartassetx.service;

import com.smartassetx.dto.AssetDto;
import java.util.List;

public interface AssetService {
    List<AssetDto> getAllAssets();
    AssetDto getAssetById(Long id);
    AssetDto createAsset(AssetDto assetDto);
    AssetDto updateAsset(Long id, AssetDto assetDto);
    void deleteAsset(Long id);
    List<AssetDto> searchAssets(String query);
    List<AssetDto> filterAssets(Long categoryId, Long departmentId, String status);
}
