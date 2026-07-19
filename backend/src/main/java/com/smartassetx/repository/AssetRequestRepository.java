package com.smartassetx.repository;

import com.smartassetx.entity.AssetRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssetRequestRepository extends JpaRepository<AssetRequest, Long> {

    List<AssetRequest> findByEmployeeId(Long employeeId);

    List<AssetRequest> findByStatus(String status);

    long countByStatus(String status);

    List<AssetRequest> findByEmployeeDepartmentId(Long departmentId);

    List<AssetRequest> findByEmployeeDepartmentIdAndStatus(Long departmentId, String status);
}
