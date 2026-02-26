package org.project.backend.service;

import lombok.RequiredArgsConstructor;
import org.project.backend.dto.categories.CategoryRequestDto;
import org.project.backend.dto.categories.CategoryResponseDto;
import org.project.backend.exception.DuplicateResourceException;
import org.project.backend.exception.ResourceNotFoundException;
import org.project.backend.mapper.CategoryMapper;
import org.project.backend.model.Category;
import org.project.backend.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    @Transactional
    public CategoryResponseDto createCategory(CategoryRequestDto requestDto) {
        if (categoryRepository.existsByNom(requestDto.getNom())) {
            throw new DuplicateResourceException("Category", "nom", requestDto.getNom());
        }
        Category category = categoryMapper.toEntity(requestDto);
        category = categoryRepository.save(category);
        return categoryMapper.toResponseDto(category);
    }

    @Transactional(readOnly = true)
    public List<CategoryResponseDto> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(categoryMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CategoryResponseDto getCategoryById(Integer id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        return categoryMapper.toResponseDto(category);
    }

    @Transactional
    public CategoryResponseDto updateCategory(Integer id, CategoryRequestDto requestDto) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));

        if (!category.getNom().equals(requestDto.getNom()) &&
                categoryRepository.existsByNom(requestDto.getNom())) {
            throw new DuplicateResourceException("Category", "nom", requestDto.getNom());
        }

        categoryMapper.updateEntityFromRequest(category, requestDto);
        category = categoryRepository.save(category);
        return categoryMapper.toResponseDto(category);
    }

    @Transactional
    public void deleteCategory(Integer id) {
        if (!categoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Category", "id", id);
        }
        categoryRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public long count() {
        return categoryRepository.count();
    }
}
