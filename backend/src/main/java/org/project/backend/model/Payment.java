package org.project.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.project.backend.enums.PaymentStatus;
import org.project.backend.enums.ReservationType;

import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idPayment;

    @Column(nullable = false)
    private Float montant;

    @Column(nullable = false)
    private String currency;

    @Column(nullable = false)
    private String paymentMethod;

    @Column(unique = true)
    private String stripePaymentIntentId;

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime datePayment = LocalDateTime.now();

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "reservation_hotel_id")
    private ReservationHotel reservationHotel;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "training_reservation_id")
    private TrainingReservation trainingReservation;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "order_id")
    private Order order;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PaymentStatus status = PaymentStatus.INITIE;

    @Enumerated(EnumType.STRING)
    @Column(nullable = true)
    private ReservationType reservationType;
}
