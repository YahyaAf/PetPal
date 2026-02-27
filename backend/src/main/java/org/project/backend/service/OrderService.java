package org.project.backend.service;

import com.stripe.model.PaymentIntent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.project.backend.dto.orders.OrderItemRequestDto;
import org.project.backend.dto.orders.OrderRequestDto;
import org.project.backend.dto.orders.OrderResponseDto;
import org.project.backend.dto.orders.OrderWithPaymentResponse;
import org.project.backend.enums.OrderStatus;
import org.project.backend.enums.PaymentStatus;
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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;
    private final OrderMapper orderMapper;
    private final StripeService stripeService;

    // ─────────────────────────────────────────────
    //  CRÉER UNE COMMANDE + PAYMENT (INITIE) en même temps
    //  Même logique que ReservationHotel + TrainingReservation
    // ─────────────────────────────────────────────
    @Transactional
    public OrderWithPaymentResponse createOrder(OrderRequestDto requestDto, Integer userId) {

        // 1. Vérifier que l'utilisateur existe
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // 2. Construire les order items et calculer le total
        List<OrderItem> orderItems = new ArrayList<>();
        float total = 0f;

        for (OrderItemRequestDto itemDto : requestDto.getItems()) {
            Product product = productRepository.findById(itemDto.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "id", itemDto.getProductId()));

            if (product.getStock() < itemDto.getQuantite()) {
                throw new InsufficientStockException(
                    product.getNom(),
                    product.getStock(),
                    itemDto.getQuantite()
                );
            }

            OrderItem item = OrderItem.builder()
                    .product(product)
                    .quantite(itemDto.getQuantite())
                    .prixUnitaire(product.getPrix())
                    .build();

            orderItems.add(item);
            total += product.getPrix() * itemDto.getQuantite();
        }

        // 3. Créer la commande avec statut PENDING
        Order order = Order.builder()
                .user(user)
                .total(total)
                .status(OrderStatus.PENDING)
                .orderItems(new ArrayList<>())
                .build();

        for (OrderItem item : orderItems) {
            item.setOrder(order);
            order.getOrderItems().add(item);
        }

        Order savedOrder = orderRepository.save(order);
        log.info("Commande #{} créée pour l'utilisateur {}", savedOrder.getIdOrder(), user.getNom());

        // 4. Créer le PaymentIntent Stripe + Payment (statut INITIE) — même logique que réservations
        try {
            PaymentIntent paymentIntent = stripeService.createPaymentIntentWithDetails(total, "mad");

            Payment payment = Payment.builder()
                    .montant(total)
                    .currency("mad")
                    .paymentMethod("card")
                    .stripePaymentIntentId(paymentIntent.getId())
                    .order(savedOrder)
                    .status(PaymentStatus.INITIE)
                    .build();

            Payment savedPayment = paymentRepository.save(payment);
            log.info("Payment #{} créé (INITIE) pour commande #{}", savedPayment.getIdPayment(), savedOrder.getIdOrder());

            return OrderWithPaymentResponse.builder()
                    .idOrder(savedOrder.getIdOrder())
                    .total(savedOrder.getTotal())
                    .dateOrder(savedOrder.getDateOrder())
                    .orderStatus(savedOrder.getStatus())
                    .paymentId(savedPayment.getIdPayment())
                    .stripePaymentIntentId(savedPayment.getStripePaymentIntentId())
                    .stripeClientSecret(paymentIntent.getClientSecret())
                    .paymentStatus(savedPayment.getStatus())
                    .message("Commande créée. Utilisez paymentId pour obtenir le lien de paiement.")
                    .build();

        } catch (Exception e) {
            log.error("Erreur Stripe: {}", e.getMessage());
            throw new RuntimeException("Erreur lors de la création du paiement: " + e.getMessage());
        }
    }

    // ─────────────────────────────────────────────
    //  CONFIRMER UNE COMMANDE (appelé par PaymentService après paiement)
    // ─────────────────────────────────────────────
    @Transactional
    public void confirmOrder(Integer orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        // Décrémenter le stock
        for (OrderItem item : order.getOrderItems()) {
            Product product = item.getProduct();
            product.setStock(product.getStock() - item.getQuantite());
            productRepository.save(product);
            log.info("Stock mis à jour pour '{}': {} restants", product.getNom(), product.getStock());
        }

        order.setStatus(OrderStatus.PAYEE);
        orderRepository.save(order);
        log.info("Commande #{} confirmée et payée", orderId);
    }

    // ─────────────────────────────────────────────
    //  ANNULER UNE COMMANDE
    // ─────────────────────────────────────────────
    @Transactional
    public OrderResponseDto cancelOrder(Integer orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (order.getStatus() == OrderStatus.PAYEE) {
            throw new RuntimeException("Impossible d'annuler une commande déjà payée.");
        }

        order.setStatus(OrderStatus.ANNULEE);
        Order updatedOrder = orderRepository.save(order);
        log.info("Commande #{} annulée", orderId);
        return orderMapper.toResponseDto(updatedOrder);
    }

    // ─────────────────────────────────────────────
    //  LECTURES
    // ─────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<OrderResponseDto> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(orderMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderResponseDto getOrderById(Integer id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));
        return orderMapper.toResponseDto(order);
    }

    @Transactional(readOnly = true)
    public List<OrderResponseDto> getOrdersByUser(Integer userId) {
        return orderRepository.findByUserIdUser(userId).stream()
                .map(orderMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long count() {
        return orderRepository.count();
    }
}
