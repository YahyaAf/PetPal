package org.project.backend.mapper;

import lombok.RequiredArgsConstructor;
import org.project.backend.dto.payments.PaymentRequest;
import org.project.backend.dto.payments.PaymentResponse;
import org.project.backend.enums.PaymentStatus;
import org.project.backend.enums.ReservationType;
import org.project.backend.exception.ResourceNotFoundException;
import org.project.backend.model.Order;
import org.project.backend.model.Payment;
import org.project.backend.model.ReservationHotel;
import org.project.backend.model.TrainingReservation;
import org.project.backend.repository.OrderRepository;
import org.project.backend.repository.ReservationHotelRepository;
import org.project.backend.repository.TrainingReservationRepository;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PaymentMapper {

    private final ReservationHotelRepository reservationHotelRepository;
    private final TrainingReservationRepository trainingReservationRepository;
    private final OrderRepository orderRepository;

    public Payment toEntity(PaymentRequest request) {
        ReservationHotel reservation = reservationHotelRepository.findById(request.getReservationId())
                .orElseThrow(() -> new ResourceNotFoundException("Reservation", "id", request.getReservationId()));

        return Payment.builder()
                .montant(reservation.getMontantTotal())
                .currency(request.getCurrency())
                .paymentMethod(request.getPaymentMethod())
                .reservationHotel(reservation)
                .reservationType(ReservationType.HOTEL)
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
                .reservationType(ReservationType.TRAINING)
                .status(PaymentStatus.INITIE)
                .build();
    }

    public Payment toEntityForOrder(PaymentRequest request) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", request.getOrderId()));

        return Payment.builder()
                .montant(order.getTotal())
                .currency(request.getCurrency())
                .paymentMethod(request.getPaymentMethod())
                .order(order)
                .reservationType(ReservationType.ORDER)
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
                .status(payment.getStatus())
                .reservationType(payment.getReservationType());

        if (payment.getReservationHotel() != null) {
            builder.reservationId(payment.getReservationHotel().getIdReservation());
        }
        if (payment.getTrainingReservation() != null) {
            builder.trainingReservationId(payment.getTrainingReservation().getIdReservation());
        }
        if (payment.getOrder() != null) {
            builder.orderId(payment.getOrder().getIdOrder());
        }

        return builder.build();
    }
}
