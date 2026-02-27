package org.project.backend.dto.orders;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemResponseDto {

    private Integer idOrderItem;
    private Integer productId;
    private String productNom;
    private Integer quantite;
    private Float prixUnitaire;
    private Float sousTotal;
}

