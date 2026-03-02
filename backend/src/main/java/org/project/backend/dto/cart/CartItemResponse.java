package org.project.backend.dto.cart;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemResponse {

    private Integer idCartItem;
    private Integer productId;
    private String productNom;
    private Float prixUnitaire;
    private Integer quantite;
    private Float sousTotal;
}

