package org.project.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.project.backend.dto.orders.OrderItemRequestDto;
import org.project.backend.dto.orders.OrderRequestDto;
import org.project.backend.dto.orders.OrderResponseDto;
import org.project.backend.dto.orders.OrderWithPaymentResponse;
import org.project.backend.enums.OrderStatus;
import org.project.backend.enums.PaymentStatus;
import org.project.backend.enums.ReservationType;
import org.project.backend.exception.InsufficientStockException;
import org.project.backend.exception.ResourceNotFoundException;
import org.project.backend.mapper.OrderMapper;
import org.project.backend.model.Order;
import org.project.backend.model.OrderItem;
import org.project.backend.model.Payment;
import org.project.backend.model.Product;
import org.project.backend.model.User;
import org.project.backend.repository.OrderRepository;
import org.project.backend.repository.PaymentRepository;
import org.project.backend.repository.ProductRepository;
import org.project.backend.repository.UserRepository;
import com.stripe.model.PaymentIntent;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Tests unitaires pour OrderService")
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private OrderMapper orderMapper;

    @Mock
    private StripeService stripeService;

    @InjectMocks
    private OrderService orderService;

    private User testUser;
    private Product testProduct;
    private Order testOrder;
    private OrderItem testOrderItem;
    private OrderResponseDto orderResponse;

    @BeforeEach
    void setUp() {
        // Setup test user
        testUser = User.builder()
                .idUser(1)
                .email("client@example.com")
                .nom("Test Client")
                .build();

        // Setup test product
        testProduct = Product.builder()
                .id(1)
                .nom("Croquettes Premium")
                .prix(45.99f)
                .stock(100)
                .build();

        // Setup test order
        testOrder = Order.builder()
                .idOrder(1)
                .user(testUser)
                .total(91.98f)
                .status(OrderStatus.PENDING)
                .dateOrder(LocalDateTime.now())
                .orderItems(new ArrayList<>())
                .build();

        // Setup test order item
        testOrderItem = OrderItem.builder()
                .idOrderItem(1)
                .order(testOrder)
                .product(testProduct)
                .quantite(2)
                .prixUnitaire(45.99f)
                .build();

        testOrder.getOrderItems().add(testOrderItem);

        // Setup order response
        orderResponse = OrderResponseDto.builder()
                .idOrder(1)
                .total(91.98f)
                .status(OrderStatus.PENDING)
                .build();
    }

    // ───────────────────────────────────────────────────
    //  CREATE ORDER TESTS
    // ───────────────────────────────────────────────────

    @Test
    @DisplayName("Should create order successfully with valid products")
    void testCreateOrderSuccess() throws Exception {
        // Arrange
        OrderItemRequestDto itemRequest = OrderItemRequestDto.builder()
                .productId(1)
                .quantite(2)
                .build();

        OrderRequestDto orderRequest = OrderRequestDto.builder()
                .items(Arrays.asList(itemRequest))
                .build();

        PaymentIntent paymentIntent = new PaymentIntent();
        paymentIntent.setId("pi_test123");
        paymentIntent.setClientSecret("secret_test123");

        when(userRepository.findById(1)).thenReturn(Optional.of(testUser));
        when(orderRepository.findByUserIdUserAndStatus(1, OrderStatus.PENDING)).thenReturn(new ArrayList<>());
        when(productRepository.findById(1)).thenReturn(Optional.of(testProduct));
        when(orderRepository.save(any(Order.class))).thenReturn(testOrder);
        when(stripeService.createPaymentIntentWithDetails(91.98f, "mad")).thenReturn(paymentIntent);
        when(paymentRepository.save(any(Payment.class))).thenReturn(Payment.builder()
                .idPayment(1)
                .stripePaymentIntentId("pi_test123")
                .status(PaymentStatus.INITIE)
                .build());

        // Act
        OrderWithPaymentResponse response = orderService.createOrder(orderRequest, 1);

        // Assert
        assertNotNull(response);
        assertEquals(1, response.getIdOrder());
        assertEquals(OrderStatus.PENDING, response.getOrderStatus());
        assertEquals(PaymentStatus.INITIE, response.getPaymentStatus());

        verify(userRepository, times(1)).findById(1);
        verify(productRepository, times(1)).findById(1);
        verify(orderRepository, times(1)).save(any(Order.class));
    }

    @Test
    @DisplayName("Should throw InsufficientStockException when product stock too low")
    void testCreateOrderInsufficientStock() {
        // Arrange
        Product lowStockProduct = Product.builder()
                .id(1)
                .nom("Croquettes Premium")
                .prix(45.99f)
                .stock(1)
                .build();

        OrderItemRequestDto itemRequest = OrderItemRequestDto.builder()
                .productId(1)
                .quantite(5)
                .build();

        OrderRequestDto orderRequest = OrderRequestDto.builder()
                .items(Arrays.asList(itemRequest))
                .build();

        when(userRepository.findById(1)).thenReturn(Optional.of(testUser));
        when(orderRepository.findByUserIdUserAndStatus(1, OrderStatus.PENDING)).thenReturn(new ArrayList<>());
        when(productRepository.findById(1)).thenReturn(Optional.of(lowStockProduct));

        // Act & Assert
        assertThrows(InsufficientStockException.class,
                () -> orderService.createOrder(orderRequest, 1));

        verify(productRepository, times(1)).findById(1);
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when user not found")
    void testCreateOrderUserNotFound() {
        // Arrange
        OrderItemRequestDto itemRequest = OrderItemRequestDto.builder()
                .productId(1)
                .quantite(2)
                .build();

        OrderRequestDto orderRequest = OrderRequestDto.builder()
                .items(Arrays.asList(itemRequest))
                .build();

        when(userRepository.findById(999)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class,
                () -> orderService.createOrder(orderRequest, 999));

        verify(userRepository, times(1)).findById(999);
    }

    @Test
    @DisplayName("Should cancel pending pending orders before creating new one")
    void testCreateOrderCancelsPreviousPending() throws Exception {
        // Arrange
        Order pendingOrder = Order.builder()
                .idOrder(99)
                .status(OrderStatus.PENDING)
                .user(testUser)
                .build();

        OrderItemRequestDto itemRequest = OrderItemRequestDto.builder()
                .productId(1)
                .quantite(2)
                .build();

        OrderRequestDto orderRequest = OrderRequestDto.builder()
                .items(Arrays.asList(itemRequest))
                .build();

        PaymentIntent paymentIntent = new PaymentIntent();
        paymentIntent.setId("pi_test123");

        when(userRepository.findById(1)).thenReturn(Optional.of(testUser));
        when(orderRepository.findByUserIdUserAndStatus(1, OrderStatus.PENDING))
                .thenReturn(Arrays.asList(pendingOrder));
        when(productRepository.findById(1)).thenReturn(Optional.of(testProduct));
        when(orderRepository.save(any(Order.class))).thenReturn(testOrder);
        when(stripeService.createPaymentIntentWithDetails(91.98f, "mad")).thenReturn(paymentIntent);
        when(paymentRepository.save(any(Payment.class))).thenReturn(Payment.builder()
                .idPayment(1)
                .stripePaymentIntentId("pi_test123")
                .status(PaymentStatus.INITIE)
                .build());

        // Act
        orderService.createOrder(orderRequest, 1);

        // Assert
        assertEquals(OrderStatus.ANNULEE, pendingOrder.getStatus());
        verify(orderRepository, times(1)).findByUserIdUserAndStatus(1, OrderStatus.PENDING);
    }

    // ───────────────────────────────────────────────────
    //  CONFIRM ORDER TESTS
    // ───────────────────────────────────────────────────

    @Test
    @DisplayName("Should confirm order and update product stock")
    void testConfirmOrderSuccess() {
        // Arrange
        testOrder.setStatus(OrderStatus.PENDING);
        when(orderRepository.findById(1)).thenReturn(Optional.of(testOrder));
        when(productRepository.save(testProduct)).thenReturn(testProduct);
        when(orderRepository.save(testOrder)).thenReturn(testOrder);

        // Act
        orderService.confirmOrder(1);

        // Assert
        assertEquals(OrderStatus.PAYEE, testOrder.getStatus());
        assertEquals(98, testProduct.getStock()); // 100 - 2
        verify(orderRepository, times(1)).findById(1);
        verify(productRepository, times(1)).save(testProduct);
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when order not found")
    void testConfirmOrderNotFound() {
        // Arrange
        when(orderRepository.findById(999)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class,
                () -> orderService.confirmOrder(999));

        verify(orderRepository, times(1)).findById(999);
    }

    // ───────────────────────────────────────────────────
    //  CANCEL ORDER TESTS
    // ───────────────────────────────────────────────────

    @Test
    @DisplayName("Should cancel pending order successfully")
    void testCancelOrderSuccess() {
        // Arrange
        testOrder.setStatus(OrderStatus.PENDING);
        when(orderRepository.findById(1)).thenReturn(Optional.of(testOrder));
        when(orderRepository.save(testOrder)).thenReturn(testOrder);
        when(orderMapper.toResponseDto(testOrder)).thenReturn(orderResponse);

        // Act
        OrderResponseDto response = orderService.cancelOrder(1);

        // Assert
        assertEquals(OrderStatus.ANNULEE, testOrder.getStatus());
        verify(orderRepository, times(1)).findById(1);
        verify(orderRepository, times(1)).save(testOrder);
    }

    @Test
    @DisplayName("Should throw exception when cancelling paid order")
    void testCancelPaidOrderFails() {
        // Arrange
        testOrder.setStatus(OrderStatus.PAYEE);
        when(orderRepository.findById(1)).thenReturn(Optional.of(testOrder));

        // Act & Assert
        assertThrows(RuntimeException.class,
                () -> orderService.cancelOrder(1));

        verify(orderRepository, times(1)).findById(1);
    }

    // ───────────────────────────────────────────────────
    //  GET ORDER TESTS
    // ───────────────────────────────────────────────────

    @Test
    @DisplayName("Should get order by ID successfully")
    void testGetOrderByIdSuccess() {
        // Arrange
        when(orderRepository.findById(1)).thenReturn(Optional.of(testOrder));
        when(orderMapper.toResponseDto(testOrder)).thenReturn(orderResponse);

        // Act
        OrderResponseDto response = orderService.getOrderById(1);

        // Assert
        assertNotNull(response);
        assertEquals(1, response.getIdOrder());
        verify(orderRepository, times(1)).findById(1);
    }

    @Test
    @DisplayName("Should get all orders successfully")
    void testGetAllOrdersSuccess() {
        // Arrange
        when(orderRepository.findAll()).thenReturn(Arrays.asList(testOrder));
        when(orderMapper.toResponseDto(testOrder)).thenReturn(orderResponse);

        // Act
        List<OrderResponseDto> responses = orderService.getAllOrders();

        // Assert
        assertNotNull(responses);
        assertEquals(1, responses.size());
        verify(orderRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Should get orders by user successfully")
    void testGetOrdersByUserSuccess() {
        // Arrange
        when(orderRepository.findByUserIdUser(1)).thenReturn(Arrays.asList(testOrder));
        when(orderMapper.toResponseDto(testOrder)).thenReturn(orderResponse);

        // Act
        List<OrderResponseDto> responses = orderService.getOrdersByUser(1);

        // Assert
        assertNotNull(responses);
        assertEquals(1, responses.size());
        verify(orderRepository, times(1)).findByUserIdUser(1);
    }

    @Test
    @DisplayName("Should count orders successfully")
    void testCountOrdersSuccess() {
        // Arrange
        when(orderRepository.count()).thenReturn(5L);

        // Act
        long count = orderService.count();

        // Assert
        assertEquals(5L, count);
        verify(orderRepository, times(1)).count();
    }
}




