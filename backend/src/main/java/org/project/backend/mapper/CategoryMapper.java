package org.project.backend.mapper;

import org.project.backend.dto.categories.CategoryRequestDto;
import org.project.backend.dto.categories.CategoryResponseDto;
import org.project.backend.model.Category;
import org.springframework.stereotype.Component;

@Component
public class CategoryMapper {

    public Category toEntity(CategoryRequestDto dto) {
        if (dto == null) return null;
        return Category.builder()
                .nom(dto.getNom())
                .build();
    }

    public CategoryResponseDto toResponseDto(Category category) {
        if (category == null) return null;
        return CategoryResponseDto.builder()
                .idCategory(category.getIdCategory())
                .nom(category.getNom())
                .dateCreation(category.getDateCreation())
                .build();
    }

    public void updateEntityFromRequest(Category category, CategoryRequestDto dto) {
        category.setNom(dto.getNom());
    }
}
