package org.project.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.project.backend.dto.cart.CartItemRequest;
import org.project.backend.dto.cart.CartResponse;
import org.project.backend.model.User;
import org.project.backend.service.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<CartResponse> getCart(@AuthenticationPrincipal User currentUser) {
        CartResponse cart = cartService.getOrCreateCart(currentUser.getIdUser());
        return ResponseEntity.ok(cart);
    }

    @PostMapping("/items")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<CartResponse> addItem(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody CartItemRequest request) {
        CartResponse cart = cartService.addItem(currentUser.getIdUser(), request);
        return ResponseEntity.ok(cart);
    }

    @PutMapping("/items/{cartItemId}")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<CartResponse> updateItemQuantity(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Integer cartItemId,
            @RequestBody Map<String, Integer> body) {
        Integer quantite = body.get("quantite");
        if (quantite == null) {
            throw new RuntimeException("Le champ 'quantite' est obligatoire");
        }
        CartResponse cart = cartService.updateItemQuantity(currentUser.getIdUser(), cartItemId, quantite);
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping("/items/{cartItemId}")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<CartResponse> removeItem(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Integer cartItemId) {
        CartResponse cart = cartService.removeItem(currentUser.getIdUser(), cartItemId);
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<CartResponse> clearCart(@AuthenticationPrincipal User currentUser) {
        CartResponse cart = cartService.clearCart(currentUser.getIdUser());
        return ResponseEntity.ok(cart);
    }

    @PostMapping("/validate")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<CartResponse> validateCart(@AuthenticationPrincipal User currentUser) {
        CartResponse cart = cartService.validateCart(currentUser.getIdUser());
        return ResponseEntity.ok(cart);
    }
}

