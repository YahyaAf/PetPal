package org.project.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.project.backend.dto.payments.PaymentRequest;
import org.project.backend.dto.payments.PaymentWithClientSecretResponse;
import org.project.backend.dto.trainingreservations.TrainingReservationRequest;
import org.project.backend.dto.trainingreservations.TrainingReservationResponse;
import org.project.backend.dto.trainingreservations.TrainingReservationWithPaymentResponse;
import org.project.backend.service.PaymentService;
import org.project.backend.service.TrainingReservationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/training-reservations")
@RequiredArgsConstructor
public class TrainingReservationController {

    private final TrainingReservationService trainingReservationService;
    private final PaymentService paymentService;

    @PostMapping
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<TrainingReservationWithPaymentResponse> create(
            @Valid @RequestBody TrainingReservationRequest request,
            Authentication authentication) {

        TrainingReservationResponse reservation = trainingReservationService.create(request, authentication);

        PaymentRequest paymentRequest = PaymentRequest.builder()
                .trainingReservationId(reservation.getIdReservation())
                .paymentMethod("card")
                .currency("eur")
                .build();

        PaymentWithClientSecretResponse payment = paymentService.createPaymentForTrainingWithClientSecret(paymentRequest);

        TrainingReservationWithPaymentResponse response = TrainingReservationWithPaymentResponse.builder()
                .reservation(reservation)
                .paymentId(payment.getIdPayment())
                .stripePaymentIntentId(payment.getStripePaymentIntentId())
                .stripeClientSecret(payment.getStripeClientSecret())
                .message("Réservation de formation créée avec succès. Veuillez procéder au paiement pour confirmer votre réservation.")
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/count")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Long>> count() {
        long count = trainingReservationService.count();
        Map<String, Long> response = new HashMap<>();
        response.put("count", count);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my-reservations")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<List<TrainingReservationResponse>> getMyReservations(Authentication authentication) {
        List<TrainingReservationResponse> reservations = trainingReservationService.getMyReservations(authentication);
        return ResponseEntity.ok(reservations);
    }

    @GetMapping("/my-dresseur-reservations")
    @PreAuthorize("hasRole('DRESSEUR')")
    public ResponseEntity<List<TrainingReservationResponse>> getMyDresseurReservations(Authentication authentication) {
        List<TrainingReservationResponse> reservations = trainingReservationService.getMyDresseurReservations(authentication);
        return ResponseEntity.ok(reservations);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TrainingReservationResponse>> getAll() {
        List<TrainingReservationResponse> reservations = trainingReservationService.getAll();
        return ResponseEntity.ok(reservations);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TrainingReservationResponse> getById(@PathVariable Integer id) {
        TrainingReservationResponse response = trainingReservationService.getById(id);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Integer id) {
        trainingReservationService.delete(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Réservation de formation supprimée avec succès");
        return ResponseEntity.ok(response);
    }
}

