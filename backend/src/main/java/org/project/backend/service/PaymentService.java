package org.project.backend.service;

import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.project.backend.dto.payments.PaymentRequest;
import org.project.backend.dto.payments.PaymentResponse;
import org.project.backend.dto.payments.PaymentWithClientSecretResponse;
import org.project.backend.enums.PaymentStatus;
import org.project.backend.exception.ResourceNotFoundException;
import org.project.backend.mapper.PaymentMapper;
import org.project.backend.model.Order;
import org.project.backend.model.Payment;
import org.project.backend.enums.OrderStatus;
import org.project.backend.repository.OrderRepository;
import org.project.backend.repository.PaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentMapper paymentMapper;
    private final ReservationHotelService reservationService;
    private final TrainingReservationService trainingReservationService;
    private final OrderRepository orderRepository;
    private final OrderService orderService;
    private final StripeService stripeService;

    @Transactional
    public PaymentWithClientSecretResponse createPaymentWithClientSecret(PaymentRequest request) {
        // Créer le paiement avec statut INITIE
        Payment payment = paymentMapper.toEntity(request);

        try {
            // Intégration Stripe - Créer un PaymentIntent avec client secret
            PaymentIntent paymentIntent = stripeService.createPaymentIntentWithDetails(
                payment.getMontant(),
                payment.getCurrency()
            );
            payment.setStripePaymentIntentId(paymentIntent.getId());
            log.info("PaymentIntent Stripe créé avec succès: {}", paymentIntent.getId());

            Payment savedPayment = paymentRepository.save(payment);

            // Créer la réponse avec le client secret
            return PaymentWithClientSecretResponse.builder()
                    .idPayment(savedPayment.getIdPayment())
                    .montant(savedPayment.getMontant())
                    .currency(savedPayment.getCurrency())
                    .paymentMethod(savedPayment.getPaymentMethod())
                    .stripePaymentIntentId(savedPayment.getStripePaymentIntentId())
                    .stripeClientSecret(paymentIntent.getClientSecret())
                    .datePayment(savedPayment.getDatePayment())
                    .status(savedPayment.getStatus())
                    .reservationType(savedPayment.getReservationType())
                    .reservationId(savedPayment.getReservationHotel().getIdReservation())
                    .build();

        } catch (StripeException e) {
            log.error("Erreur lors de la création du PaymentIntent Stripe: {}", e.getMessage());
            throw new RuntimeException("Erreur lors de la création du paiement: " + e.getMessage());
        }
    }

    @Transactional
    public PaymentWithClientSecretResponse createPaymentForTrainingWithClientSecret(PaymentRequest request) {
        Payment payment = paymentMapper.toEntityForTraining(request);

        try {
            PaymentIntent paymentIntent = stripeService.createPaymentIntentWithDetails(
                payment.getMontant(),
                payment.getCurrency()
            );
            payment.setStripePaymentIntentId(paymentIntent.getId());
            log.info("PaymentIntent Stripe créé avec succès pour formation: {}", paymentIntent.getId());

            Payment savedPayment = paymentRepository.save(payment);

            return PaymentWithClientSecretResponse.builder()
                    .idPayment(savedPayment.getIdPayment())
                    .montant(savedPayment.getMontant())
                    .currency(savedPayment.getCurrency())
                    .paymentMethod(savedPayment.getPaymentMethod())
                    .stripePaymentIntentId(savedPayment.getStripePaymentIntentId())
                    .stripeClientSecret(paymentIntent.getClientSecret())
                    .datePayment(savedPayment.getDatePayment())
                    .status(savedPayment.getStatus())
                    .reservationType(savedPayment.getReservationType())
                    .trainingReservationId(savedPayment.getTrainingReservation().getIdReservation())
                    .build();

        } catch (StripeException e) {
            log.error("Erreur lors de la création du PaymentIntent Stripe: {}", e.getMessage());
            throw new RuntimeException("Erreur lors de la création du paiement: " + e.getMessage());
        }
    }

    @Transactional
    public PaymentWithClientSecretResponse createPaymentForOrderWithClientSecret(PaymentRequest request) {
        Payment payment = paymentMapper.toEntityForOrder(request);

        try {
            PaymentIntent paymentIntent = stripeService.createPaymentIntentWithDetails(
                payment.getMontant(),
                payment.getCurrency()
            );
            payment.setStripePaymentIntentId(paymentIntent.getId());
            log.info("PaymentIntent Stripe créé pour commande: {}", paymentIntent.getId());

            Payment savedPayment = paymentRepository.save(payment);

            return PaymentWithClientSecretResponse.builder()
                    .idPayment(savedPayment.getIdPayment())
                    .montant(savedPayment.getMontant())
                    .currency(savedPayment.getCurrency())
                    .paymentMethod(savedPayment.getPaymentMethod())
                    .stripePaymentIntentId(savedPayment.getStripePaymentIntentId())
                    .stripeClientSecret(paymentIntent.getClientSecret())
                    .datePayment(savedPayment.getDatePayment())
                    .status(savedPayment.getStatus())
                    .reservationType(savedPayment.getReservationType())
                    .orderId(savedPayment.getOrder().getIdOrder())
                    .build();

        } catch (StripeException e) {
            log.error("Erreur lors de la création du PaymentIntent Stripe pour commande: {}", e.getMessage());
            throw new RuntimeException("Erreur lors de la création du paiement: " + e.getMessage());
        }
    }

    @Transactional
    public PaymentResponse confirmPayment(Integer paymentId, String stripePaymentIntentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "id", paymentId));

        try {
            boolean isSuccessful = stripeService.isPaymentSuccessful(stripePaymentIntentId);

            if (!isSuccessful) {
                throw new RuntimeException("Le paiement n'a pas été confirmé sur Stripe");
            }

            payment.setStatus(PaymentStatus.SUCCES);
            payment.setStripePaymentIntentId(stripePaymentIntentId);
            Payment updatedPayment = paymentRepository.save(payment);

            if (payment.getReservationHotel() != null) {
                reservationService.confirmReservation(payment.getReservationHotel().getIdReservation());
            } else if (payment.getTrainingReservation() != null) {
                trainingReservationService.updateStatus(payment.getTrainingReservation().getIdReservation(),
                    org.project.backend.enums.TrainingReservationStatus.CONFIRMEE);
            } else if (payment.getOrder() != null) {
                orderService.confirmOrder(payment.getOrder().getIdOrder());
            }

            log.info("Paiement {} confirmé avec succès", paymentId);
            return paymentMapper.toResponse(updatedPayment);

        } catch (StripeException e) {
            log.error("Erreur lors de la vérification du paiement Stripe: {}", e.getMessage());
            throw new RuntimeException("Erreur lors de la confirmation du paiement: " + e.getMessage());
        }
    }

    @Transactional
    public PaymentResponse failPayment(Integer paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "id", paymentId));

        try {
            if (payment.getStripePaymentIntentId() != null) {
                stripeService.cancelPaymentIntent(payment.getStripePaymentIntentId());
                log.info("PaymentIntent {} annulé sur Stripe", payment.getStripePaymentIntentId());
            }

            payment.setStatus(PaymentStatus.ECHEC);
            Payment updatedPayment = paymentRepository.save(payment);

            if (payment.getReservationHotel() != null) {
                reservationService.cancelReservationBySystem(payment.getReservationHotel().getIdReservation());
            } else if (payment.getTrainingReservation() != null) {
                trainingReservationService.updateStatus(payment.getTrainingReservation().getIdReservation(),
                    org.project.backend.enums.TrainingReservationStatus.ANNULEE);
            } else if (payment.getOrder() != null) {
                Order order = payment.getOrder();
                order.setStatus(OrderStatus.ANNULEE);
                orderRepository.save(order);
            }

            log.info("Paiement {} marqué comme échoué", paymentId);
            return paymentMapper.toResponse(updatedPayment);

        } catch (StripeException e) {
            log.error("Erreur lors de l'annulation du PaymentIntent Stripe: {}", e.getMessage());
            payment.setStatus(PaymentStatus.ECHEC);
            Payment updatedPayment = paymentRepository.save(payment);

            if (payment.getReservationHotel() != null) {
                reservationService.cancelReservationBySystem(payment.getReservationHotel().getIdReservation());
            } else if (payment.getTrainingReservation() != null) {
                trainingReservationService.updateStatus(payment.getTrainingReservation().getIdReservation(),
                    org.project.backend.enums.TrainingReservationStatus.ANNULEE);
            } else if (payment.getOrder() != null) {
                Order order = payment.getOrder();
                order.setStatus(OrderStatus.ANNULEE);
                orderRepository.save(order);
            }

            return paymentMapper.toResponse(updatedPayment);
        }
    }

    @Transactional(readOnly = true)
    public PaymentResponse getById(Integer id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "id", id));
        return paymentMapper.toResponse(payment);
    }

    @Transactional(readOnly = true)
    public PaymentResponse getByReservationId(Integer reservationId) {
        Payment payment = paymentRepository.findByReservationHotelIdReservation(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "reservationId", reservationId));
        return paymentMapper.toResponse(payment);
    }

    @Transactional(readOnly = true)
    public PaymentResponse getByTrainingReservationId(Integer trainingReservationId) {
        Payment payment = paymentRepository.findByTrainingReservationIdReservation(trainingReservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "trainingReservationId", trainingReservationId));
        return paymentMapper.toResponse(payment);
    }

    @Transactional(readOnly = true)
    public PaymentResponse getByOrderId(Integer orderId) {
        Payment payment = paymentRepository.findByOrderIdOrder(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "orderId", orderId));
        return paymentMapper.toResponse(payment);
    }

    @Transactional(readOnly = true)
    public PaymentResponse getByStripePaymentIntentId(String stripePaymentIntentId) {
        Payment payment = paymentRepository.findByStripePaymentIntentId(stripePaymentIntentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "stripePaymentIntentId", stripePaymentIntentId));
        return paymentMapper.toResponse(payment);
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getAll() {
        return paymentRepository.findAll()
                .stream()
                .map(paymentMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long count() {
        return paymentRepository.count();
    }
}
