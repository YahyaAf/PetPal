package org.project.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.project.backend.dto.cart.CartItemRequest;
import org.project.backend.dto.cart.CartResponse;
import org.project.backend.enums.CartStatus;
import org.project.backend.exception.ResourceNotFoundException;
import org.project.backend.mapper.CartMapper;
import org.project.backend.model.Cart;
import org.project.backend.model.CartItem;
import org.project.backend.model.Category;
import org.project.backend.model.Product;
import org.project.backend.model.User;
import org.project.backend.repository.CartItemRepository;
import org.project.backend.repository.CartRepository;
import org.project.backend.repository.ProductRepository;
import org.project.backend.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Tests unitaires pour CartService")
class CartServiceTest {

    @Mock
    private CartRepository cartRepository;

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CartMapper cartMapper;

    @InjectMocks
    private CartService cartService;

    private User testUser;
    private Cart testCart;
    private Product testProduct;
    private CartItem testCartItem;
    private CartResponse cartResponse;
    private CartItemRequest cartItemRequest;

    @BeforeEach
    void setUp() {
        // Setup test user
        testUser = User.builder()
                .idUser(1)
                .email("test@example.com")
                .nom("Test User")
                .build();

        // Setup test category
        Category testCategory = Category.builder()
                .idCategory(1)
                .nom("Croquettes")
                .dateCreation(LocalDateTime.now())
                .build();

        // Setup test product
        testProduct = Product.builder()
                .id(1)
                .nom("Croquettes Premium XL")
                .description("Nourriture de qualité premium")
                .prix(45.99f)
                .stock(100)
                .imageUrl("https://example.com/product1.jpg")
                .category(testCategory)
                .build();

        // Setup test cart
        testCart = Cart.builder()
                .idCart(1)
                .user(testUser)
                .status(CartStatus.EN_COURS)
                .cartItems(new ArrayList<>())
                .build();

        // Setup test cart item
        testCartItem = CartItem.builder()
                .idCartItem(1)
                .cart(testCart)
                .product(testProduct)
                .quantite(2)
                .prixUnitaire(45.99f)
                .build();

        // Setup cart item request
        cartItemRequest = CartItemRequest.builder()
                .productId(1)
                .quantite(2)
                .build();

        // Setup cart response
        cartResponse = CartResponse.builder()
                .idCart(1)
                .status(CartStatus.EN_COURS)
                .nombreArticles(1)
                .total(91.98f)
                .build();
    }

    // ───────────────────────────────────────────────────
    //  GET OR CREATE CART TESTS
    // ───────────────────────────────────────────────────

    @Test
    @DisplayName("Should get existing cart successfully")
    void testGetExistingCartSuccess() {
        // Arrange
        when(userRepository.findById(1)).thenReturn(Optional.of(testUser));
        when(cartRepository.findByUserIdUserAndStatus(1, CartStatus.EN_COURS))
                .thenReturn(Optional.of(testCart));
        when(cartMapper.toCartResponse(testCart)).thenReturn(cartResponse);

        // Act
        CartResponse response = cartService.getOrCreateCart(1);

        // Assert
        assertNotNull(response);
        assertEquals(1, response.getIdCart());
        assertEquals(CartStatus.EN_COURS, response.getStatus());

        verify(userRepository, times(1)).findById(1);
        verify(cartRepository, times(1)).findByUserIdUserAndStatus(1, CartStatus.EN_COURS);
        verify(cartMapper, times(1)).toCartResponse(testCart);
    }

    @Test
    @DisplayName("Should create new cart when none exists")
    void testCreateNewCartSuccess() {
        // Arrange
        when(userRepository.findById(1)).thenReturn(Optional.of(testUser));
        when(cartRepository.findByUserIdUserAndStatus(1, CartStatus.EN_COURS))
                .thenReturn(Optional.empty());
        when(cartRepository.save(any(Cart.class))).thenReturn(testCart);
        when(cartMapper.toCartResponse(testCart)).thenReturn(cartResponse);

        // Act
        CartResponse response = cartService.getOrCreateCart(1);

        // Assert
        assertNotNull(response);
        assertEquals(1, response.getIdCart());

        verify(userRepository, times(1)).findById(1);
        verify(cartRepository, times(1)).findByUserIdUserAndStatus(1, CartStatus.EN_COURS);
        verify(cartRepository, times(1)).save(any(Cart.class));
        verify(cartMapper, times(1)).toCartResponse(testCart);
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when user not found")
    void testGetOrCreateCartUserNotFound() {
        // Arrange
        when(userRepository.findById(999)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class,
                () -> cartService.getOrCreateCart(999));

        verify(userRepository, times(1)).findById(999);
    }

    // ───────────────────────────────────────────────────
    //  ADD ITEM TO CART TESTS
    // ───────────────────────────────────────────────────

    @Test
    @DisplayName("Should add new product to cart successfully")
    void testAddItemNewProductSuccess() {
        // Arrange
        when(cartRepository.findByUserIdUserAndStatus(1, CartStatus.EN_COURS))
                .thenReturn(Optional.of(testCart));
        when(productRepository.findById(1)).thenReturn(Optional.of(testProduct));
        when(cartItemRepository.findByCartIdCartAndProductId(1, 1))
                .thenReturn(Optional.empty());
        when(cartRepository.findById(1)).thenReturn(Optional.of(testCart));
        when(cartMapper.toCartResponse(testCart)).thenReturn(cartResponse);

        // Act
        CartResponse response = cartService.addItem(1, cartItemRequest);

        // Assert
        assertNotNull(response);
        verify(cartRepository, times(1)).findByUserIdUserAndStatus(1, CartStatus.EN_COURS);
        verify(productRepository, times(1)).findById(1);
        verify(cartItemRepository, times(1)).findByCartIdCartAndProductId(1, 1);
        verify(cartItemRepository, times(1)).save(any(CartItem.class));
    }

    @Test
    @DisplayName("Should increment quantity when product already in cart")
    void testAddItemExistingProductSuccess() {
        // Arrange
        testCart.getCartItems().add(testCartItem);
        when(cartRepository.findByUserIdUserAndStatus(1, CartStatus.EN_COURS))
                .thenReturn(Optional.of(testCart));
        when(productRepository.findById(1)).thenReturn(Optional.of(testProduct));
        when(cartItemRepository.findByCartIdCartAndProductId(1, 1))
                .thenReturn(Optional.of(testCartItem));
        when(cartRepository.findById(1)).thenReturn(Optional.of(testCart));
        when(cartMapper.toCartResponse(testCart)).thenReturn(cartResponse);

        // Act
        CartResponse response = cartService.addItem(1, cartItemRequest);

        // Assert
        assertNotNull(response);
        verify(cartItemRepository, times(1)).findByCartIdCartAndProductId(1, 1);
        verify(cartItemRepository, times(1)).save(testCartItem);
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when product not found")
    void testAddItemProductNotFound() {
        // Arrange
        when(cartRepository.findByUserIdUserAndStatus(1, CartStatus.EN_COURS))
                .thenReturn(Optional.of(testCart));
        when(productRepository.findById(999)).thenReturn(Optional.empty());

        // Act & Assert
        CartItemRequest invalidRequest = CartItemRequest.builder()
                .productId(999)
                .quantite(2)
                .build();

        assertThrows(ResourceNotFoundException.class,
                () -> cartService.addItem(1, invalidRequest));

        verify(productRepository, times(1)).findById(999);
    }

    @Test
    @DisplayName("Should throw RuntimeException when stock insufficient")
    void testAddItemInsufficientStock() {
        // Arrange
        Product lowStockProduct = Product.builder()
                .id(2)
                .nom("Low Stock Product")
                .prix(20.0f)
                .stock(1)
                .build();

        CartItemRequest highQuantityRequest = CartItemRequest.builder()
                .productId(2)
                .quantite(10)
                .build();

        when(cartRepository.findByUserIdUserAndStatus(1, CartStatus.EN_COURS))
                .thenReturn(Optional.of(testCart));
        when(productRepository.findById(2)).thenReturn(Optional.of(lowStockProduct));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> cartService.addItem(1, highQuantityRequest));
        assertTrue(exception.getMessage().contains("Stock insuffisant"));
    }

    // ───────────────────────────────────────────────────
    //  UPDATE ITEM QUANTITY TESTS
    // ───────────────────────────────────────────────────

    @Test
    @DisplayName("Should update item quantity successfully")
    void testUpdateItemQuantitySuccess() {
        // Arrange
        testCart.getCartItems().add(testCartItem);
        when(cartRepository.findByUserIdUserAndStatus(1, CartStatus.EN_COURS))
                .thenReturn(Optional.of(testCart));
        when(cartItemRepository.findById(1)).thenReturn(Optional.of(testCartItem));
        when(cartRepository.findById(1)).thenReturn(Optional.of(testCart));
        when(cartMapper.toCartResponse(testCart)).thenReturn(cartResponse);

        // Act
        CartResponse response = cartService.updateItemQuantity(1, 1, 5);

        // Assert
        assertNotNull(response);
        verify(cartItemRepository, times(1)).findById(1);
        verify(cartItemRepository, times(1)).save(testCartItem);
    }

    @Test
    @DisplayName("Should remove item when quantity is 0")
    void testUpdateItemQuantityZero() {
        // Arrange
        testCart.getCartItems().add(testCartItem);
        when(cartRepository.findByUserIdUserAndStatus(1, CartStatus.EN_COURS))
                .thenReturn(Optional.of(testCart));
        when(cartItemRepository.findById(1)).thenReturn(Optional.of(testCartItem));
        when(cartRepository.findById(1)).thenReturn(Optional.of(testCart));
        when(cartMapper.toCartResponse(testCart)).thenReturn(cartResponse);

        // Act
        CartResponse response = cartService.updateItemQuantity(1, 1, 0);

        // Assert
        assertNotNull(response);
        verify(cartItemRepository, times(1)).delete(testCartItem);
    }

    // ───────────────────────────────────────────────────
    //  REMOVE ITEM TESTS
    // ───────────────────────────────────────────────────

    @Test
    @DisplayName("Should remove item from cart successfully")
    void testRemoveItemSuccess() {
        // Arrange
        testCart.getCartItems().add(testCartItem);
        when(cartRepository.findByUserIdUserAndStatus(1, CartStatus.EN_COURS))
                .thenReturn(Optional.of(testCart));
        when(cartItemRepository.findById(1)).thenReturn(Optional.of(testCartItem));
        when(cartRepository.findById(1)).thenReturn(Optional.of(testCart));
        when(cartMapper.toCartResponse(testCart)).thenReturn(cartResponse);

        // Act
        CartResponse response = cartService.removeItem(1, 1);

        // Assert
        assertNotNull(response);
        verify(cartItemRepository, times(1)).delete(testCartItem);
    }

    // ───────────────────────────────────────────────────
    //  CLEAR CART TESTS
    // ───────────────────────────────────────────────────

    @Test
    @DisplayName("Should clear cart successfully")
    void testClearCartSuccess() {
        // Arrange
        testCart.getCartItems().add(testCartItem);
        when(cartRepository.findByUserIdUserAndStatus(1, CartStatus.EN_COURS))
                .thenReturn(Optional.of(testCart));
        when(cartRepository.save(testCart)).thenReturn(testCart);
        when(cartMapper.toCartResponse(testCart)).thenReturn(cartResponse);

        // Act
        CartResponse response = cartService.clearCart(1);

        // Assert
        assertNotNull(response);
        assertTrue(testCart.getCartItems().isEmpty());
        verify(cartRepository, times(1)).save(testCart);
    }

    // ───────────────────────────────────────────────────
    //  VALIDATE CART TESTS
    // ───────────────────────────────────────────────────

    @Test
    @DisplayName("Should validate cart successfully with items")
    void testValidateCartSuccess() {
        // Arrange
        testCart.getCartItems().add(testCartItem);
        when(cartRepository.findByUserIdUserAndStatus(1, CartStatus.EN_COURS))
                .thenReturn(Optional.of(testCart));
        when(cartRepository.save(testCart)).thenReturn(testCart);
        when(cartMapper.toCartResponse(testCart)).thenReturn(cartResponse);

        // Act
        CartResponse response = cartService.validateCart(1);

        // Assert
        assertNotNull(response);
        assertEquals(CartStatus.VALIDE, CartStatus.VALIDE);
        verify(cartRepository, times(1)).save(testCart);
    }

    @Test
    @DisplayName("Should throw RuntimeException when validating empty cart")
    void testValidateEmptyCartFails() {
        // Arrange
        when(cartRepository.findByUserIdUserAndStatus(1, CartStatus.EN_COURS))
                .thenReturn(Optional.of(testCart));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> cartService.validateCart(1));
        assertTrue(exception.getMessage().contains("panier vide"));
    }
}





