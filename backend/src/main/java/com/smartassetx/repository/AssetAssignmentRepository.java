package com.smartassetx.repository;

import com.smartassetx.entity.AssetAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssetAssignmentRepository extends JpaRepository<AssetAssignment, Long> {

    List<AssetAssignment> findByEmployeeId(Long employeeId);

    List<AssetAssignment> findByAssetId(Long assetId);

    List<AssetAssignment> findByActualReturnDateIsNull();

    List<AssetAssignment> findByEmployeeIdAndActualReturnDateIsNull(Long employeeId);

    Optional<AssetAssignment> findFirstByAssetIdAndActualReturnDateIsNullOrderByAssignedDateDesc(Long assetId);
}
