package org.project.backend.mapper;

import org.project.backend.dto.cart.CartItemResponse;
import org.project.backend.dto.cart.CartResponse;
import org.project.backend.model.Cart;
import org.project.backend.model.CartItem;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class CartMapper {

    public CartItemResponse toCartItemResponse(CartItem item) {
        return CartItemResponse.builder()
                .idCartItem(item.getIdCartItem())
                .productId(item.getProduct().getId())
                .productNom(item.getProduct().getNom())
                .prixUnitaire(item.getPrixUnitaire())
                .quantite(item.getQuantite())
                .sousTotal(item.getPrixUnitaire() * item.getQuantite())
                .build();
    }

    public CartResponse toCartResponse(Cart cart) {
        List<CartItemResponse> items = cart.getCartItems()
                .stream()
                .map(this::toCartItemResponse)
                .collect(Collectors.toList());

        float total = items.stream()
                .map(CartItemResponse::getSousTotal)
                .reduce(0f, Float::sum);

        int nombreArticles = cart.getCartItems()
                .stream()
                .mapToInt(CartItem::getQuantite)
                .sum();

        return CartResponse.builder()
                .idCart(cart.getIdCart())
                .userId(cart.getUser().getIdUser())
                .userNom(cart.getUser().getNom())
                .status(cart.getStatus())
                .createdAt(cart.getCreatedAt())
                .updatedAt(cart.getUpdatedAt())
                .items(items)
                .total(total)
                .nombreArticles(nombreArticles)
                .build();
    }
}

