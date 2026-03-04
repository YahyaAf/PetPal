package org.project.backend.dto.products;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponseDto {

    private Integer id;
    private String nom;
    private String description;
    private Float prix;
    private Integer stock;
    private String imageUrl;
    private Integer categoryId;
    private String categoryNom;
}

