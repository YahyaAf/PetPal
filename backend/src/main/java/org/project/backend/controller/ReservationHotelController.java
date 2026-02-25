package org.project.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.project.backend.dto.payments.PaymentRequest;
import org.project.backend.dto.payments.PaymentWithClientSecretResponse;
import org.project.backend.dto.reservations.ReservationHotelRequest;
import org.project.backend.dto.reservations.ReservationHotelResponse;
import org.project.backend.dto.reservations.ReservationWithPaymentResponse;
import org.project.backend.service.PaymentService;
import org.project.backend.service.ReservationHotelService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationHotelController {

    private final ReservationHotelService reservationService;
    private final PaymentService paymentService;


    @PostMapping
    public ResponseEntity<ReservationWithPaymentResponse> create(
            @Valid @RequestBody ReservationHotelRequest request,
            Authentication authentication) {

        // 1. Créer la réservation
        ReservationHotelResponse reservation = reservationService.create(request, authentication);

        // 2. Créer automatiquement le paiement avec Stripe
        PaymentRequest paymentRequest = PaymentRequest.builder()
                .reservationId(reservation.getIdReservation())
                .paymentMethod("card")
                .currency("eur") // ou "mad" selon votre configuration
                .build();

        PaymentWithClientSecretResponse payment = paymentService.createPaymentWithClientSecret(paymentRequest);

        // 3. Retourner la réservation avec les informations de paiement
        ReservationWithPaymentResponse response = ReservationWithPaymentResponse.builder()
                .reservation(reservation)
                .paymentId(payment.getIdPayment())
                .stripePaymentIntentId(payment.getStripePaymentIntentId())
                .stripeClientSecret(payment.getStripeClientSecret())
                .message("Réservation créée avec succès. Veuillez procéder au paiement pour confirmer votre réservation.")
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/count")
    public ResponseEntity<Long> count() {
        long count = reservationService.count();
        return ResponseEntity.ok(count);
    }

    @GetMapping("/my-reservations")
    public ResponseEntity<List<ReservationHotelResponse>> getMyReservations(Authentication authentication) {
        List<ReservationHotelResponse> reservations = reservationService.getMyReservations(authentication);
        return ResponseEntity.ok(reservations);
    }

    @GetMapping("/hotel/{hotelId}")
    public ResponseEntity<List<ReservationHotelResponse>> getByHotel(@PathVariable Integer hotelId) {
        List<ReservationHotelResponse> reservations = reservationService.getByHotel(hotelId);
        return ResponseEntity.ok(reservations);
    }

    @GetMapping
    public ResponseEntity<List<ReservationHotelResponse>> getAll() {
        List<ReservationHotelResponse> reservations = reservationService.getAll();
        return ResponseEntity.ok(reservations);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReservationHotelResponse> getById(@PathVariable Integer id) {
        ReservationHotelResponse response = reservationService.getById(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/confirm")
    public ResponseEntity<Void> confirmReservation(@PathVariable Integer id) {
        reservationService.confirmReservation(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelReservation(@PathVariable Integer id) {
        reservationService.cancelReservation(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        reservationService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
