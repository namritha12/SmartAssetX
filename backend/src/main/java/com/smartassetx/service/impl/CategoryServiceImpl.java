package com.smartassetx.service.impl;

import com.smartassetx.dto.CategoryDto;
import com.smartassetx.entity.Category;
import com.smartassetx.exception.BadRequestException;
import com.smartassetx.exception.ResourceNotFoundException;
import com.smartassetx.repository.CategoryRepository;
import com.smartassetx.service.CategoryService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryServiceImpl(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    public List<CategoryDto> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public CategoryDto getCategoryById(Long id) {
        Category cat = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + id));
        return mapToDto(cat);
    }

    @Override
    @Transactional
    public CategoryDto createCategory(CategoryDto dto) {
        if (categoryRepository.existsByCategoryName(dto.getCategoryName())) {
            throw new BadRequestException("Category name already exists");
        }
        Category cat = new Category(null, dto.getCategoryName());
        return mapToDto(categoryRepository.save(cat));
    }

    @Override
    @Transactional
    public CategoryDto updateCategory(Long id, CategoryDto dto) {
        Category cat = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + id));

        if (!cat.getCategoryName().equalsIgnoreCase(dto.getCategoryName()) &&
                categoryRepository.existsByCategoryName(dto.getCategoryName())) {
            throw new BadRequestException("Category name already exists");
        }

        cat.setCategoryName(dto.getCategoryName());
        return mapToDto(categoryRepository.save(cat));
    }

    @Override
    @Transactional
    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Category not found with ID: " + id);
        }
        categoryRepository.deleteById(id);
    }

    private CategoryDto mapToDto(Category cat) {
        return new CategoryDto(cat.getId(), cat.getCategoryName());
    }
}
