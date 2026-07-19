package com.smartassetx.service;

import com.smartassetx.dto.AssetDto;
import java.io.IOException;
import java.util.List;
import java.util.Map;

public interface ReportService {
    Map<String, Object> getDashboardSummary();
    List<Map<String, Object>> getAssetsByCategory();
    List<Map<String, Object>> getAssetsByDepartment();
    List<AssetDto> getExpiringWarrantyAssets();
    List<AssetDto> getExpiringAmcAssets();
    byte[] exportExcelReport() throws IOException;
    byte[] exportPdfReport() throws IOException;
}
