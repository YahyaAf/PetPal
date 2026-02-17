package org.project.backend.mapper;

import lombok.RequiredArgsConstructor;
import org.project.backend.dto.payments.PaymentRequest;
import org.project.backend.dto.payments.PaymentResponse;
import org.project.backend.enums.PaymentStatus;
import org.project.backend.exception.ResourceNotFoundException;
import org.project.backend.model.Payment;
import org.project.backend.model.ReservationHotel;
import org.project.backend.repository.ReservationHotelRepository;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PaymentMapper {

    private final ReservationHotelRepository reservationHotelRepository;

    public Payment toEntity(PaymentRequest request) {
        ReservationHotel reservation = reservationHotelRepository.findById(request.getReservationId())
                .orElseThrow(() -> new ResourceNotFoundException("Reservation", "id", request.getReservationId()));

        return Payment.builder()
                .montant(reservation.getMontantTotal())
                .currency(request.getCurrency())
                .paymentMethod(request.getPaymentMethod())
                .reservationHotel(reservation)
                .status(PaymentStatus.INITIE)
                .build();
    }

    public PaymentResponse toResponse(Payment payment) {
        return PaymentResponse.builder()
                .idPayment(payment.getIdPayment())
                .montant(payment.getMontant())
                .currency(payment.getCurrency())
                .paymentMethod(payment.getPaymentMethod())
                .stripePaymentIntentId(payment.getStripePaymentIntentId())
                .datePayment(payment.getDatePayment())
                .status(payment.getStatus())
                .reservationId(payment.getReservationHotel().getIdReservation())
                .build();
    }
}
