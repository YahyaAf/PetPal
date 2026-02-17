package org.project.backend.controller;

import lombok.RequiredArgsConstructor;
import org.project.backend.dto.payments.PaymentResponse;
import org.project.backend.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    /**
     * GET /api/payments/{id}
     * Récupérer un paiement par ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<PaymentResponse> getById(@PathVariable Integer id) {
        PaymentResponse payment = paymentService.getById(id);
        return ResponseEntity.ok(payment);
    }

    /**
     * GET /api/payments/reservation/{reservationId}
     * Récupérer le paiement d'une réservation
     */
    @GetMapping("/reservation/{reservationId}")
    public ResponseEntity<PaymentResponse> getByReservationId(@PathVariable Integer reservationId) {
        PaymentResponse payment = paymentService.getByReservationId(reservationId);
        return ResponseEntity.ok(payment);
    }

    /**
     * GET /api/payments
     * Récupérer tous les paiements (Admin)
     */
    @GetMapping
    public ResponseEntity<List<PaymentResponse>> getAll() {
        List<PaymentResponse> payments = paymentService.getAll();
        return ResponseEntity.ok(payments);
    }

    /**
     * POST /api/payments/{id}/confirm
     * Confirmer un paiement (après paiement Stripe réussi)
     * Body: { "stripePaymentIntentId": "pi_xxx..." }
     */
    @PostMapping("/{id}/confirm")
    public ResponseEntity<PaymentResponse> confirmPayment(
            @PathVariable Integer id,
            @RequestBody ConfirmPaymentRequest request) {
        PaymentResponse payment = paymentService.confirmPayment(id, request.stripePaymentIntentId());
        return ResponseEntity.ok(payment);
    }

    /**
     * POST /api/payments/{id}/fail
     * Marquer un paiement comme échoué
     */
    @PostMapping("/{id}/fail")
    public ResponseEntity<PaymentResponse> failPayment(@PathVariable Integer id) {
        PaymentResponse payment = paymentService.failPayment(id);
        return ResponseEntity.ok(payment);
    }

    /**
     * DTO pour la confirmation de paiement
     */
    public record ConfirmPaymentRequest(String stripePaymentIntentId) {}
}
