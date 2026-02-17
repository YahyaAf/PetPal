package org.project.backend.controller;

import com.stripe.exception.StripeException;
import lombok.RequiredArgsConstructor;
import org.project.backend.dto.payments.PaymentResponse;
import org.project.backend.service.PaymentService;
import org.project.backend.service.StripeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final StripeService stripeService;

    @GetMapping("/{id}")
    public ResponseEntity<PaymentResponse> getById(@PathVariable Integer id) {
        PaymentResponse payment = paymentService.getById(id);
        return ResponseEntity.ok(payment);
    }

    @GetMapping("/reservation/{reservationId}")
    public ResponseEntity<PaymentResponse> getByReservationId(@PathVariable Integer reservationId) {
        PaymentResponse payment = paymentService.getByReservationId(reservationId);
        return ResponseEntity.ok(payment);
    }

    @GetMapping
    public ResponseEntity<List<PaymentResponse>> getAll() {
        List<PaymentResponse> payments = paymentService.getAll();
        return ResponseEntity.ok(payments);
    }

    @PostMapping("/{id}/confirm")
    public ResponseEntity<PaymentResponse> confirmPayment(
            @PathVariable Integer id,
            @RequestBody ConfirmPaymentRequest request) {
        PaymentResponse payment = paymentService.confirmPayment(id, request.stripePaymentIntentId());
        return ResponseEntity.ok(payment);
    }

    @PostMapping("/{id}/fail")
    public ResponseEntity<PaymentResponse> failPayment(@PathVariable Integer id) {
        PaymentResponse payment = paymentService.failPayment(id);
        return ResponseEntity.ok(payment);
    }

    @GetMapping("/{id}/checkout")
    public ResponseEntity<Map<String, String>> createCheckoutSession(@PathVariable Integer id) {
        try {
            PaymentResponse payment = paymentService.getById(id);

            String checkoutUrl = stripeService.createCheckoutSession(
                payment.getMontant(),
                payment.getCurrency(),
                payment.getReservationId(),
                payment.getIdPayment()
            );

            Map<String, String> response = new HashMap<>();
            response.put("checkoutUrl", checkoutUrl);
            response.put("message", "Ouvre ce lien dans ton navigateur pour payer");
            response.put("paymentId", payment.getIdPayment().toString());
            response.put("montant", payment.getMontant().toString());

            return ResponseEntity.ok(response);

        } catch (StripeException e) {
            throw new RuntimeException("Erreur lors de la création de la session checkout: " + e.getMessage());
        }
    }

    @GetMapping("/checkout/success")
    public RedirectView checkoutSuccess(
            @RequestParam("session_id") String sessionId,
            @RequestParam("payment_id") Integer paymentId) {
        try {
            var session = stripeService.retrieveCheckoutSession(sessionId);

            if ("paid".equals(session.getPaymentStatus())) {
                paymentService.confirmPayment(paymentId, session.getPaymentIntent());
            }

            return new RedirectView("http://localhost:8080/api/payments/" + paymentId + "/success-page");

        } catch (Exception e) {
            return new RedirectView("http://localhost:8080/api/payments/" + paymentId + "/error-page");
        }
    }

    @GetMapping("/checkout/cancel")
    public RedirectView checkoutCancel(@RequestParam("payment_id") Integer paymentId) {
        paymentService.failPayment(paymentId);
        return new RedirectView("http://localhost:8080/api/payments/" + paymentId + "/cancel-page");
    }

    @GetMapping("/{id}/success-page")
    public ResponseEntity<Map<String, Object>> successPage(@PathVariable Integer id) {
        PaymentResponse payment = paymentService.getById(id);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "✅ Paiement réussi !");
        response.put("payment", payment);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/cancel-page")
    public ResponseEntity<Map<String, Object>> cancelPage(@PathVariable Integer id) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", "❌ Paiement annulé");
        response.put("paymentId", id);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/error-page")
    public ResponseEntity<Map<String, Object>> errorPage(@PathVariable Integer id) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", "❌ Erreur lors du paiement");
        response.put("paymentId", id);

        return ResponseEntity.ok(response);
    }

    public record ConfirmPaymentRequest(String stripePaymentIntentId) {}
}
