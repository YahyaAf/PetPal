package org.project.backend.repository;

import org.project.backend.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Integer> {

    Optional<Payment> findByReservationHotelIdReservation(Integer reservationId);

    Optional<Payment> findByTrainingReservationIdReservation(Integer trainingReservationId);

    Optional<Payment> findByOrderIdOrder(Integer orderId);

    Optional<Payment> findByStripePaymentIntentId(String stripePaymentIntentId);
}
