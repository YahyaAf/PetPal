package org.project.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.project.backend.dto.cart.CartItemRequest;
import org.project.backend.dto.cart.CartResponse;
import org.project.backend.enums.CartStatus;
import org.project.backend.exception.ResourceNotFoundException;
import org.project.backend.mapper.CartMapper;
import org.project.backend.model.Cart;
import org.project.backend.model.CartItem;
import org.project.backend.model.Product;
import org.project.backend.model.User;
import org.project.backend.repository.CartItemRepository;
import org.project.backend.repository.CartRepository;
import org.project.backend.repository.ProductRepository;
import org.project.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CartMapper cartMapper;

    // ─────────────────────────────────────────────
    //  OBTENIR LE PANIER EN COURS (ou en créer un)
    // ─────────────────────────────────────────────
    @Transactional
    public CartResponse getOrCreateCart(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Cart cart = cartRepository.findByUserIdUserAndStatus(userId, CartStatus.EN_COURS)
                .orElseGet(() -> {
                    Cart newCart = Cart.builder()
                            .user(user)
                            .status(CartStatus.EN_COURS)
                            .build();
                    Cart saved = cartRepository.save(newCart);
                    log.info("Nouveau panier créé pour l'utilisateur #{}", userId);
                    return saved;
                });

        return cartMapper.toCartResponse(cart);
    }

    // ─────────────────────────────────────────────
    //  AJOUTER UN PRODUIT AU PANIER
    //  Si le produit existe déjà → incrémenter la quantité
    // ─────────────────────────────────────────────
    @Transactional
    public CartResponse addItem(Integer userId, CartItemRequest request) {
        Cart cart = getActiveCart(userId);

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", request.getProductId()));

        // Vérifier le stock disponible
        validateStock(product, request.getQuantite());

        // Si le produit existe déjà dans le panier → incrémenter
        cartItemRepository.findByCartIdCartAndProductId(cart.getIdCart(), product.getId())
                .ifPresentOrElse(existingItem -> {
                    int newQuantite = existingItem.getQuantite() + request.getQuantite();
                    validateStock(product, newQuantite);
                    existingItem.setQuantite(newQuantite);
                    cartItemRepository.save(existingItem);
                    log.info("Quantité mise à jour pour le produit '{}' dans le panier #{}", product.getNom(), cart.getIdCart());
                }, () -> {
                    CartItem newItem = CartItem.builder()
                            .cart(cart)
                            .product(product)
                            .quantite(request.getQuantite())
                            .prixUnitaire(product.getPrix())
                            .build();
                    cartItemRepository.save(newItem);
                    log.info("Produit '{}' ajouté au panier #{}", product.getNom(), cart.getIdCart());
                });

        // Recharger le panier après modification
        Cart updatedCart = cartRepository.findById(cart.getIdCart())
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "id", cart.getIdCart()));
        return cartMapper.toCartResponse(updatedCart);
    }

    // ─────────────────────────────────────────────
    //  METTRE À JOUR LA QUANTITÉ D'UN ITEM
    // ─────────────────────────────────────────────
    @Transactional
    public CartResponse updateItemQuantity(Integer userId, Integer cartItemId, Integer quantite) {
        Cart cart = getActiveCart(userId);

        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "id", cartItemId));

        // Vérifier que l'item appartient bien au panier de cet utilisateur
        if (!item.getCart().getIdCart().equals(cart.getIdCart())) {
            throw new RuntimeException("Cet article n'appartient pas à votre panier");
        }

        if (quantite <= 0) {
            cartItemRepository.delete(item);
            log.info("Article #{} supprimé du panier (quantité = 0)", cartItemId);
        } else {
            validateStock(item.getProduct(), quantite);
            item.setQuantite(quantite);
            cartItemRepository.save(item);
            log.info("Quantité de l'article #{} mise à jour à {}", cartItemId, quantite);
        }

        Cart updatedCart = cartRepository.findById(cart.getIdCart())
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "id", cart.getIdCart()));
        return cartMapper.toCartResponse(updatedCart);
    }

    // ─────────────────────────────────────────────
    //  SUPPRIMER UN ITEM DU PANIER
    // ─────────────────────────────────────────────
    @Transactional
    public CartResponse removeItem(Integer userId, Integer cartItemId) {
        Cart cart = getActiveCart(userId);

        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "id", cartItemId));

        if (!item.getCart().getIdCart().equals(cart.getIdCart())) {
            throw new RuntimeException("Cet article n'appartient pas à votre panier");
        }

        cartItemRepository.delete(item);
        log.info("Article '{}' supprimé du panier #{}", item.getProduct().getNom(), cart.getIdCart());

        Cart updatedCart = cartRepository.findById(cart.getIdCart())
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "id", cart.getIdCart()));
        return cartMapper.toCartResponse(updatedCart);
    }

    // ─────────────────────────────────────────────
    //  VIDER LE PANIER (supprimer tous les items)
    // ─────────────────────────────────────────────
    @Transactional
    public CartResponse clearCart(Integer userId) {
        Cart cart = getActiveCart(userId);
        cart.getCartItems().clear();
        cartRepository.save(cart);
        log.info("Panier #{} vidé pour l'utilisateur #{}", cart.getIdCart(), userId);
        return cartMapper.toCartResponse(cart);
    }

    // ─────────────────────────────────────────────
    //  VALIDER LE PANIER (passer à VALIDE)
    //  Appelé lors du passage en commande
    // ─────────────────────────────────────────────
    @Transactional
    public CartResponse validateCart(Integer userId) {
        Cart cart = getActiveCart(userId);

        if (cart.getCartItems().isEmpty()) {
            throw new RuntimeException("Impossible de valider un panier vide");
        }

        cart.setStatus(CartStatus.VALIDE);
        Cart saved = cartRepository.save(cart);
        log.info("Panier #{} validé pour l'utilisateur #{}", cart.getIdCart(), userId);
        return cartMapper.toCartResponse(saved);
    }

    // ─────────────────────────────────────────────
    //  MÉTHODES PRIVÉES
    // ─────────────────────────────────────────────
    private Cart getActiveCart(Integer userId) {
        return cartRepository.findByUserIdUserAndStatus(userId, CartStatus.EN_COURS)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
                    Cart newCart = Cart.builder()
                            .user(user)
                            .status(CartStatus.EN_COURS)
                            .build();
                    Cart saved = cartRepository.save(newCart);
                    log.info("Nouveau panier créé automatiquement pour l'utilisateur #{}", userId);
                    return saved;
                });
    }

    private void validateStock(Product product, Integer quantite) {
        if (product.getStock() < quantite) {
            throw new RuntimeException(
                String.format("Stock insuffisant pour '%s'. Disponible: %d, demandé: %d",
                    product.getNom(), product.getStock(), quantite)
            );
        }
    }
}

