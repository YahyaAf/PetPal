package org.project.backend.mapper;

import lombok.RequiredArgsConstructor;
import org.project.backend.dto.payments.PaymentRequest;
import org.project.backend.dto.payments.PaymentResponse;
import org.project.backend.enums.PaymentStatus;
import org.project.backend.exception.ResourceNotFoundException;
import org.project.backend.model.Payment;
import org.project.backend.model.ReservationHotel;
import org.project.backend.model.TrainingReservation;
import org.project.backend.repository.ReservationHotelRepository;
import org.project.backend.repository.TrainingReservationRepository;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PaymentMapper {

    private final ReservationHotelRepository reservationHotelRepository;
    private final TrainingReservationRepository trainingReservationRepository;

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

    public Payment toEntityForTraining(PaymentRequest request) {
        TrainingReservation trainingReservation = trainingReservationRepository.findById(request.getTrainingReservationId())
                .orElseThrow(() -> new ResourceNotFoundException("TrainingReservation", "id", request.getTrainingReservationId()));

        return Payment.builder()
                .montant(trainingReservation.getTotalPrice().floatValue())
                .currency(request.getCurrency())
                .paymentMethod(request.getPaymentMethod())
                .trainingReservation(trainingReservation)
                .status(PaymentStatus.INITIE)
                .build();
    }

    public PaymentResponse toResponse(Payment payment) {
        PaymentResponse.PaymentResponseBuilder builder = PaymentResponse.builder()
                .idPayment(payment.getIdPayment())
                .montant(payment.getMontant())
                .currency(payment.getCurrency())
                .paymentMethod(payment.getPaymentMethod())
                .stripePaymentIntentId(payment.getStripePaymentIntentId())
                .datePayment(payment.getDatePayment())
                .status(payment.getStatus());

        if (payment.getReservationHotel() != null) {
            builder.reservationId(payment.getReservationHotel().getIdReservation());
        }

        if (payment.getTrainingReservation() != null) {
            builder.trainingReservationId(payment.getTrainingReservation().getIdReservation());
        }

        return builder.build();
    }
}
