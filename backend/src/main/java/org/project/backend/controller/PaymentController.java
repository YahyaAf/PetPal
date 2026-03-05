package org.project.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.project.backend.dto.payments.PaymentRequest;
import org.project.backend.dto.payments.PaymentResponse;
import org.project.backend.dto.payments.PaymentWithClientSecretResponse;
import org.project.backend.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    /**
     * Créer un paiement pour une réservation hôtel.
     * Retourne le clientSecret Stripe pour utiliser Stripe Elements côté front.
     * POST /api/payments/hotel
     */
    @PostMapping("/hotel")
    public ResponseEntity<PaymentWithClientSecretResponse> createPaymentForHotel(
            @Valid @RequestBody PaymentRequest request) {
        PaymentWithClientSecretResponse response = paymentService.createPaymentWithClientSecret(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Créer un paiement pour une réservation training.
     * Retourne le clientSecret Stripe pour utiliser Stripe Elements côté front.
     * POST /api/payments/training
     */
    @PostMapping("/training")
    public ResponseEntity<PaymentWithClientSecretResponse> createPaymentForTraining(
            @Valid @RequestBody PaymentRequest request) {
        PaymentWithClientSecretResponse response = paymentService.createPaymentForTrainingWithClientSecret(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Créer un paiement pour une commande (order).
     * Retourne le clientSecret Stripe pour utiliser Stripe Elements côté front.
     * POST /api/payments/order
     */
    @PostMapping("/order")
    public ResponseEntity<PaymentWithClientSecretResponse> createPaymentForOrder(
            @Valid @RequestBody PaymentRequest request) {
        PaymentWithClientSecretResponse response = paymentService.createPaymentForOrderWithClientSecret(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Confirmer un paiement après que Stripe l'a traité côté front.
     * Le front envoie le stripePaymentIntentId après confirmation Stripe Elements.
     * POST /api/payments/{id}/confirm
     */
    @PostMapping("/{id}/confirm")
    public ResponseEntity<PaymentResponse> confirmPayment(
            @PathVariable Integer id,
            @RequestBody Map<String, String> body) {
        String stripePaymentIntentId = body.get("stripePaymentIntentId");
        PaymentResponse response = paymentService.confirmPayment(id, stripePaymentIntentId);
        return ResponseEntity.ok(response);
    }

    /**
     * Annuler/échouer un paiement.
     * POST /api/payments/{id}/cancel
     */
    @PostMapping("/{id}/cancel")
    public ResponseEntity<PaymentResponse> cancelPayment(@PathVariable Integer id) {
        PaymentResponse response = paymentService.failPayment(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Récupérer un paiement par son ID.
     * GET /api/payments/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<PaymentResponse> getById(@PathVariable Integer id) {
        PaymentResponse payment = paymentService.getById(id);
        return ResponseEntity.ok(payment);
    }

    /**
     * Récupérer le paiement d'une réservation hôtel.
     * GET /api/payments/reservation/{reservationId}
     */
    @GetMapping("/reservation/{reservationId}")
    public ResponseEntity<PaymentResponse> getByReservationId(@PathVariable Integer reservationId) {
        PaymentResponse payment = paymentService.getByReservationId(reservationId);
        return ResponseEntity.ok(payment);
    }

    /**
     * Récupérer le paiement d'une réservation training.
     * GET /api/payments/training-reservation/{trainingReservationId}
     */
    @GetMapping("/training-reservation/{trainingReservationId}")
    public ResponseEntity<PaymentResponse> getByTrainingReservationId(@PathVariable Integer trainingReservationId) {
        PaymentResponse payment = paymentService.getByTrainingReservationId(trainingReservationId);
        return ResponseEntity.ok(payment);
    }

    /**
     * Récupérer le paiement d'une commande.
     * GET /api/payments/order/{orderId}
     */
    @GetMapping("/order/{orderId}")
    public ResponseEntity<PaymentResponse> getByOrderId(@PathVariable Integer orderId) {
        PaymentResponse payment = paymentService.getByOrderId(orderId);
        return ResponseEntity.ok(payment);
    }

    /**
     * Récupérer tous les paiements.
     * GET /api/payments
     */
    @GetMapping
    public ResponseEntity<List<PaymentResponse>> getAll() {
        List<PaymentResponse> payments = paymentService.getAll();
        return ResponseEntity.ok(payments);
    }

    /**
     * Compter tous les paiements.
     * GET /api/payments/count
     */
    @GetMapping("/count")
    public ResponseEntity<Long> count() {
        return ResponseEntity.ok(paymentService.count());
    }
}
