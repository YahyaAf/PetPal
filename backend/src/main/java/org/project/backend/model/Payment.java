package org.project.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.project.backend.enums.PaymentStatus;

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

    @OneToOne
    @JoinColumn(name = "reservation_hotel_id")
    private ReservationHotel reservationHotel;

    @OneToOne
    @JoinColumn(name = "training_reservation_id")
    private TrainingReservation trainingReservation;

    @OneToOne
    @JoinColumn(name = "order_id")
    private Order order;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PaymentStatus status = PaymentStatus.INITIE;
}
