package com.smartassetx.service.impl;

import com.smartassetx.dto.DepartmentDto;
import com.smartassetx.entity.Department;
import com.smartassetx.exception.BadRequestException;
import com.smartassetx.exception.ResourceNotFoundException;
import com.smartassetx.repository.DepartmentRepository;
import com.smartassetx.service.DepartmentService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository departmentRepository;

    public DepartmentServiceImpl(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    @Override
    public List<DepartmentDto> getAllDepartments() {
        return departmentRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public DepartmentDto getDepartmentById(Long id) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + id));
        return mapToDto(dept);
    }

    @Override
    @Transactional
    public DepartmentDto createDepartment(DepartmentDto dto) {
        if (departmentRepository.existsByDepartmentName(dto.getDepartmentName())) {
            throw new BadRequestException("Department name already exists");
        }
        Department dept = new Department(null, dto.getDepartmentName(), dto.getDescription());
        return mapToDto(departmentRepository.save(dept));
    }

    @Override
    @Transactional
    public DepartmentDto updateDepartment(Long id, DepartmentDto dto) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + id));
        
        if (!dept.getDepartmentName().equalsIgnoreCase(dto.getDepartmentName()) &&
                departmentRepository.existsByDepartmentName(dto.getDepartmentName())) {
            throw new BadRequestException("Department name already exists");
        }
        
        dept.setDepartmentName(dto.getDepartmentName());
        dept.setDescription(dto.getDescription());
        return mapToDto(departmentRepository.save(dept));
    }

    @Override
    @Transactional
    public void deleteDepartment(Long id) {
        if (!departmentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Department not found with ID: " + id);
        }
        departmentRepository.deleteById(id);
    }

    private DepartmentDto mapToDto(Department dept) {
        return new DepartmentDto(dept.getId(), dept.getDepartmentName(), dept.getDescription());
    }
}
