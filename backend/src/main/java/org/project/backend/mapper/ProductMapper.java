package org.project.backend.mapper;

import org.project.backend.dto.products.ProductRequestDto;
import org.project.backend.dto.products.ProductResponseDto;
import org.project.backend.model.Category;
import org.project.backend.model.Product;
import org.springframework.stereotype.Component;

@Component
public class ProductMapper {

    public Product toEntity(ProductRequestDto dto, Category category) {
        return Product.builder()
                .nom(dto.getNom())
                .description(dto.getDescription())
                .prix(dto.getPrix())
                .stock(dto.getStock())
                .imageUrl(dto.getImageUrl())
                .category(category)
                .build();
    }

    public ProductResponseDto toResponseDto(Product product) {
        return ProductResponseDto.builder()
                .id(product.getId())
                .nom(product.getNom())
                .description(product.getDescription())
                .prix(product.getPrix())
                .stock(product.getStock())
                .imageUrl(product.getImageUrl())
                .categoryId(product.getCategory().getIdCategory())
                .categoryNom(product.getCategory().getNom())
                .build();
    }

    public void updateEntityFromRequest(Product product, ProductRequestDto dto, Category category) {
        product.setNom(dto.getNom());
        product.setDescription(dto.getDescription());
        product.setPrix(dto.getPrix());
        product.setStock(dto.getStock());
        product.setImageUrl(dto.getImageUrl());
        product.setCategory(category);
    }
}

