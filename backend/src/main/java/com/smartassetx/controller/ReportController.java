package com.smartassetx.controller;

import com.smartassetx.dto.AssetDto;
import com.smartassetx.service.ReportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardSummary() {
        return ResponseEntity.ok(reportService.getDashboardSummary());
    }

    @GetMapping("/assets-by-category")
    public ResponseEntity<List<Map<String, Object>>> getAssetsByCategory() {
        return ResponseEntity.ok(reportService.getAssetsByCategory());
    }

    @GetMapping("/assets-by-department")
    public ResponseEntity<List<Map<String, Object>>> getAssetsByDepartment() {
        return ResponseEntity.ok(reportService.getAssetsByDepartment());
    }

    @GetMapping("/warranty-expiry")
    public ResponseEntity<List<AssetDto>> getExpiringWarrantyAssets() {
        return ResponseEntity.ok(reportService.getExpiringWarrantyAssets());
    }

    @GetMapping("/amc-expiry")
    public ResponseEntity<List<AssetDto>> getExpiringAmcAssets() {
        return ResponseEntity.ok(reportService.getExpiringAmcAssets());
    }

    @GetMapping("/export/excel")
    public ResponseEntity<byte[]> exportExcelReport() throws IOException {
        byte[] data = reportService.exportExcelReport();
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=assets_report.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(data);
    }

    @GetMapping("/export/pdf")
    public ResponseEntity<byte[]> exportPdfReport() throws IOException {
        byte[] data = reportService.exportPdfReport();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=assets_report.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(data);
    }
}
