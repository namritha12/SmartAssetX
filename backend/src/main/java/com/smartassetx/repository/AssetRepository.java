package com.smartassetx.repository;

import com.smartassetx.entity.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Long> {

    Optional<Asset> findByAssetCode(String assetCode);

    Optional<Asset> findBySerialNumber(String serialNumber);

    boolean existsByAssetCode(String assetCode);

    long countByStatus(String status);

    @Query("SELECT COUNT(a) FROM Asset a WHERE a.category.id = :categoryId")
    long countByCategoryId(@Param("categoryId") Long categoryId);

    @Query("SELECT COUNT(a) FROM Asset a WHERE a.department.id = :departmentId")
    long countByDepartmentId(@Param("departmentId") Long departmentId);

    List<Asset> findByCategoryId(Long categoryId);

    List<Asset> findByDepartmentId(Long departmentId);

    @Query("SELECT a FROM Asset a WHERE LOWER(a.assetName) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(a.assetCode) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(a.serialNumber) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(a.brand) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(a.model) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Asset> searchAssets(@Param("query") String query);

    @Query("SELECT a FROM Asset a WHERE (:categoryId IS NULL OR a.category.id = :categoryId) " +
           "AND (:departmentId IS NULL OR a.department.id = :departmentId) " +
           "AND (:status IS NULL OR a.status = :status)")
    List<Asset> filterAssets(@Param("categoryId") Long categoryId,
                             @Param("departmentId") Long departmentId,
                             @Param("status") String status);

    @Query("SELECT a FROM Asset a WHERE a.warrantyExpiry IS NOT NULL AND a.warrantyExpiry <= :date")
    List<Asset> findExpiringWarranty(@Param("date") LocalDate date);

    @Query("SELECT a FROM Asset a WHERE a.amcExpiry IS NOT NULL AND a.amcExpiry <= :date")
    List<Asset> findExpiringAmc(@Param("date") LocalDate date);
}
