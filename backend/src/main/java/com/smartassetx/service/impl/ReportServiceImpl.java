package com.smartassetx.service.impl;

import com.lowagie.text.Document;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.smartassetx.dto.AssetDto;
import com.smartassetx.entity.*;
import com.smartassetx.repository.*;
import com.smartassetx.service.AuthService;
import com.smartassetx.service.ReportService;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReportServiceImpl implements ReportService {

    private final AssetRepository assetRepository;
    private final DepartmentRepository departmentRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final AssetRequestRepository requestRepository;
    private final AssetAssignmentRepository assignmentRepository;
    private final AuthService authService;

    public ReportServiceImpl(AssetRepository assetRepository,
                             DepartmentRepository departmentRepository,
                             CategoryRepository categoryRepository,
                             UserRepository userRepository,
                             AssetRequestRepository requestRepository,
                             AssetAssignmentRepository assignmentRepository,
                             AuthService authService) {
        this.assetRepository = assetRepository;
        this.departmentRepository = departmentRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.requestRepository = requestRepository;
        this.assignmentRepository = assignmentRepository;
        this.authService = authService;
    }

    @Override
    public Map<String, Object> getDashboardSummary() {
        User user = authService.getCurrentUserEntity();
        Map<String, Object> summary = new HashMap<>();
        summary.put("role", user.getRole().name());

        if (user.getRole() == Role.ADMIN) {
            summary.put("totalAssets", assetRepository.count());
            summary.put("availableAssets", assetRepository.countByStatus("Available"));
            summary.put("assignedAssets", assetRepository.countByStatus("Assigned"));
            summary.put("maintenanceAssets", assetRepository.countByStatus("Maintenance"));
            summary.put("damagedAssets", assetRepository.countByStatus("Damaged"));
            summary.put("totalDepartments", departmentRepository.count());
            summary.put("totalEmployees", userRepository.countByRole(Role.EMPLOYEE));
            summary.put("totalManagers", userRepository.countByRole(Role.MANAGER));
            summary.put("pendingRequests", requestRepository.countByStatus("Pending"));
            summary.put("expiringWarranty", assetRepository.findExpiringWarranty(LocalDate.now().plusDays(180)).size());
            summary.put("expiringAmc", assetRepository.findExpiringAmc(LocalDate.now().plusDays(180)).size());
        } else if (user.getRole() == Role.MANAGER) {
            Long deptId = user.getDepartment() != null ? user.getDepartment().getId() : null;
            if (deptId != null) {
                long pendingReq = requestRepository.findByEmployeeDepartmentIdAndStatus(deptId, "Pending").size();
                List<Asset> deptAssets = assetRepository.findByDepartmentId(deptId);
                long totalDept = deptAssets.size();
                long assignedDept = deptAssets.stream().filter(a -> "Assigned".equalsIgnoreCase(a.getStatus())).count();
                long maintDept = deptAssets.stream().filter(a -> "Maintenance".equalsIgnoreCase(a.getStatus())).count();

                summary.put("pendingRequests", pendingReq);
                summary.put("departmentAssets", totalDept);
                summary.put("assignedAssets", assignedDept);
                summary.put("maintenanceAssets", maintDept);
            } else {
                summary.put("pendingRequests", 0);
                summary.put("departmentAssets", 0);
                summary.put("assignedAssets", 0);
                summary.put("maintenanceAssets", 0);
            }
        } else {
            // EMPLOYEE
            List<AssetAssignment> activeAss = assignmentRepository.findByEmployeeIdAndActualReturnDateIsNull(user.getId());
            long activeReq = requestRepository.findByEmployeeId(user.getId()).stream()
                    .filter(r -> "Pending".equalsIgnoreCase(r.getStatus())).count();
            long returnedCount = assignmentRepository.findByEmployeeId(user.getId()).stream()
                    .filter(a -> a.getActualReturnDate() != null).count();

            summary.put("assignedAssets", activeAss.size());
            summary.put("activeRequests", activeReq);
            summary.put("returnedAssets", returnedCount);
        }

        return summary;
    }

    @Override
    public List<Map<String, Object>> getAssetsByCategory() {
        List<Category> categories = categoryRepository.findAll();
        List<Map<String, Object>> breakdown = new ArrayList<>();
        for (Category cat : categories) {
            long count = assetRepository.countByCategoryId(cat.getId());
            Map<String, Object> entry = new HashMap<>();
            entry.put("categoryName", cat.getCategoryName());
            entry.put("count", count);
            breakdown.add(entry);
        }
        return breakdown;
    }

    @Override
    public List<Map<String, Object>> getAssetsByDepartment() {
        List<Department> departments = departmentRepository.findAll();
        List<Map<String, Object>> breakdown = new ArrayList<>();
        for (Department dept : departments) {
            long count = assetRepository.countByDepartmentId(dept.getId());
            Map<String, Object> entry = new HashMap<>();
            entry.put("departmentName", dept.getDepartmentName());
            entry.put("count", count);
            breakdown.add(entry);
        }
        return breakdown;
    }

    @Override
    public List<AssetDto> getExpiringWarrantyAssets() {
        return assetRepository.findExpiringWarranty(LocalDate.now().plusDays(180)).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<AssetDto> getExpiringAmcAssets() {
        return assetRepository.findExpiringAmc(LocalDate.now().plusDays(180)).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public byte[] exportExcelReport() throws IOException {
        List<Asset> assets = assetRepository.findAll();
        
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Assets");

            // Header Style
            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFillForegroundColor(IndexedColors.INDIGO.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            org.apache.poi.ss.usermodel.Font font = workbook.createFont();
            font.setColor(IndexedColors.WHITE.getIndex());
            font.setBold(true);
            headerStyle.setFont(font);

            // Row headers
            String[] columns = {"ID", "Asset Code", "Asset Name", "Serial Number", "Brand", "Model", "Category", "Department", "Status", "Purchase Date", "Cost"};
            Row headerRow = sheet.createRow(0);
            for (int col = 0; col < columns.length; col++) {
                Cell cell = headerRow.createCell(col);
                cell.setCellValue(columns[col]);
                cell.setCellStyle(headerStyle);
            }

            int rowIdx = 1;
            for (Asset asset : assets) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(asset.getId());
                row.createCell(1).setCellValue(asset.getAssetCode());
                row.createCell(2).setCellValue(asset.getAssetName());
                row.createCell(3).setCellValue(asset.getSerialNumber() != null ? asset.getSerialNumber() : "N/A");
                row.createCell(4).setCellValue(asset.getBrand() != null ? asset.getBrand() : "N/A");
                row.createCell(5).setCellValue(asset.getModel() != null ? asset.getModel() : "N/A");
                row.createCell(6).setCellValue(asset.getCategory().getCategoryName());
                row.createCell(7).setCellValue(asset.getDepartment() != null ? asset.getDepartment().getDepartmentName() : "Unassigned");
                row.createCell(8).setCellValue(asset.getStatus());
                
                String dateStr = asset.getPurchaseDate() != null ? asset.getPurchaseDate().format(DateTimeFormatter.ISO_LOCAL_DATE) : "N/A";
                row.createCell(9).setCellValue(dateStr);
                
                double cost = asset.getPurchaseCost() != null ? asset.getPurchaseCost().doubleValue() : 0.0;
                row.createCell(10).setCellValue(cost);
            }

            // Auto-size columns
            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }

    @Override
    public byte[] exportPdfReport() throws IOException {
        List<Asset> assets = assetRepository.findAll();
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        Document document = new Document(PageSize.A4);
        PdfWriter.getInstance(document, out);

        document.open();
        
        Font titleFont = new Font(Font.HELVETICA, 18, Font.BOLD, Color.BLACK);
        Paragraph title = new Paragraph("SmartAssetX - Office Assets Report", titleFont);
        title.setAlignment(Paragraph.ALIGN_CENTER);
        title.setSpacingAfter(20);
        document.add(title);

        PdfPTable table = new PdfPTable(6);
        table.setWidthPercentage(100f);
        table.setWidths(new float[]{1.5f, 2.5f, 2.0f, 2.0f, 2.0f, 2.0f});

        Font headFont = new Font(Font.HELVETICA, 10, Font.BOLD, Color.WHITE);
        String[] headers = {"Code", "Name", "Category", "Status", "Department", "Brand"};

        for (String header : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(header, headFont));
            cell.setBackgroundColor(new Color(63, 81, 181));
            cell.setHorizontalAlignment(PdfPCell.ALIGN_CENTER);
            cell.setPadding(6);
            table.addCell(cell);
        }

        Font bodyFont = new Font(Font.HELVETICA, 9, Font.NORMAL, Color.BLACK);
        for (Asset asset : assets) {
            table.addCell(new Phrase(asset.getAssetCode(), bodyFont));
            table.addCell(new Phrase(asset.getAssetName(), bodyFont));
            table.addCell(new Phrase(asset.getCategory().getCategoryName(), bodyFont));
            table.addCell(new Phrase(asset.getStatus(), bodyFont));
            
            String deptName = asset.getDepartment() != null ? asset.getDepartment().getDepartmentName() : "Unassigned";
            table.addCell(new Phrase(deptName, bodyFont));
            
            String brandName = asset.getBrand() != null ? asset.getBrand() : "N/A";
            table.addCell(new Phrase(brandName, bodyFont));
        }

        document.add(table);
        document.close();

        return out.toByteArray();
    }

    private AssetDto mapToDto(Asset asset) {
        return AssetDto.builder()
                .id(asset.getId())
                .assetCode(asset.getAssetCode())
                .assetName(asset.getAssetName())
                .serialNumber(asset.getSerialNumber())
                .brand(asset.getBrand())
                .model(asset.getModel())
                .purchaseDate(asset.getPurchaseDate())
                .purchaseCost(asset.getPurchaseCost())
                .warrantyExpiry(asset.getWarrantyExpiry())
                .amcExpiry(asset.getAmcExpiry())
                .status(asset.getStatus())
                .categoryId(asset.getCategory().getId())
                .categoryName(asset.getCategory().getCategoryName())
                .departmentId(asset.getDepartment() != null ? asset.getDepartment().getId() : null)
                .departmentName(asset.getDepartment() != null ? asset.getDepartment().getDepartmentName() : null)
                .build();
    }
}
