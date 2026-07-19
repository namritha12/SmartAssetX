package com.smartassetx.service.impl;

import com.smartassetx.dto.AssetDto;
import com.smartassetx.entity.Asset;
import com.smartassetx.entity.Category;
import com.smartassetx.entity.Department;
import com.smartassetx.exception.BadRequestException;
import com.smartassetx.exception.ResourceNotFoundException;
import com.smartassetx.repository.AssetRepository;
import com.smartassetx.repository.CategoryRepository;
import com.smartassetx.repository.DepartmentRepository;
import com.smartassetx.service.AssetService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AssetServiceImpl implements AssetService {

    private final AssetRepository assetRepository;
    private final CategoryRepository categoryRepository;
    private final DepartmentRepository departmentRepository;

    public AssetServiceImpl(AssetRepository assetRepository,
                            CategoryRepository categoryRepository,
                            DepartmentRepository departmentRepository) {
        this.assetRepository = assetRepository;
        this.categoryRepository = categoryRepository;
        this.departmentRepository = departmentRepository;
    }

    @Override
    public List<AssetDto> getAllAssets() {
        return assetRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public AssetDto getAssetById(Long id) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found with ID: " + id));
        return mapToDto(asset);
    }

    @Override
    @Transactional
    public AssetDto createAsset(AssetDto assetDto) {
        if (assetRepository.existsByAssetCode(assetDto.getAssetCode())) {
            throw new BadRequestException("Asset code " + assetDto.getAssetCode() + " is already in use");
        }

        if (assetDto.getSerialNumber() != null && !assetDto.getSerialNumber().isBlank()) {
            if (assetRepository.findBySerialNumber(assetDto.getSerialNumber()).isPresent()) {
                throw new BadRequestException("Serial number " + assetDto.getSerialNumber() + " is already in use");
            }
        }

        Category category = categoryRepository.findById(assetDto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + assetDto.getCategoryId()));

        Department department = null;
        if (assetDto.getDepartmentId() != null) {
            department = departmentRepository.findById(assetDto.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + assetDto.getDepartmentId()));
        }

        Asset asset = Asset.builder()
                .assetCode(assetDto.getAssetCode())
                .assetName(assetDto.getAssetName())
                .serialNumber(assetDto.getSerialNumber())
                .brand(assetDto.getBrand())
                .model(assetDto.getModel())
                .purchaseDate(assetDto.getPurchaseDate())
                .purchaseCost(assetDto.getPurchaseCost())
                .warrantyExpiry(assetDto.getWarrantyExpiry())
                .amcExpiry(assetDto.getAmcExpiry())
                .status(assetDto.getStatus() != null ? assetDto.getStatus() : "Available")
                .category(category)
                .department(department)
                .build();

        Asset savedAsset = assetRepository.save(asset);
        return mapToDto(savedAsset);
    }

    @Override
    @Transactional
    public AssetDto updateAsset(Long id, AssetDto assetDto) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found with ID: " + id));

        if (!asset.getAssetCode().equals(assetDto.getAssetCode()) &&
                assetRepository.existsByAssetCode(assetDto.getAssetCode())) {
            throw new BadRequestException("Asset code " + assetDto.getAssetCode() + " is already in use");
        }

        if (assetDto.getSerialNumber() != null && !assetDto.getSerialNumber().isBlank()) {
            Asset existing = assetRepository.findBySerialNumber(assetDto.getSerialNumber()).orElse(null);
            if (existing != null && !existing.getId().equals(id)) {
                throw new BadRequestException("Serial number " + assetDto.getSerialNumber() + " is already in use");
            }
        }

        Category category = categoryRepository.findById(assetDto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + assetDto.getCategoryId()));

        Department department = null;
        if (assetDto.getDepartmentId() != null) {
            department = departmentRepository.findById(assetDto.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + assetDto.getDepartmentId()));
        }

        asset.setAssetCode(assetDto.getAssetCode());
        asset.setAssetName(assetDto.getAssetName());
        asset.setSerialNumber(assetDto.getSerialNumber());
        asset.setBrand(assetDto.getBrand());
        asset.setModel(assetDto.getModel());
        asset.setPurchaseDate(assetDto.getPurchaseDate());
        asset.setPurchaseCost(assetDto.getPurchaseCost());
        asset.setWarrantyExpiry(assetDto.getWarrantyExpiry());
        asset.setAmcExpiry(assetDto.getAmcExpiry());
        asset.setStatus(assetDto.getStatus());
        asset.setCategory(category);
        asset.setDepartment(department);

        Asset updatedAsset = assetRepository.save(asset);
        return mapToDto(updatedAsset);
    }

    @Override
    @Transactional
    public void deleteAsset(Long id) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found with ID: " + id));

        if ("Assigned".equalsIgnoreCase(asset.getStatus())) {
            throw new BadRequestException("Cannot delete asset that is currently assigned");
        }
        assetRepository.delete(asset);
    }

    @Override
    public List<AssetDto> searchAssets(String query) {
        if (query == null || query.isBlank()) {
            return getAllAssets();
        }
        return assetRepository.searchAssets(query).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<AssetDto> filterAssets(Long categoryId, Long departmentId, String status) {
        String filterStatus = (status == null || status.isBlank() || "All".equalsIgnoreCase(status)) ? null : status;
        
        return assetRepository.filterAssets(categoryId, departmentId, filterStatus).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
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
