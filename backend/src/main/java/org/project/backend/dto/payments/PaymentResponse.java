package org.project.backend.dto.payments;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.project.backend.enums.PaymentStatus;
import org.project.backend.enums.ReservationType;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {

    private Integer idPayment;
    private Float montant;
    private String currency;
    private String paymentMethod;
    private String stripePaymentIntentId;
    private LocalDateTime datePayment;
    private PaymentStatus status;
    private ReservationType reservationType;
    private Integer reservationId;
    private Integer trainingReservationId;
    private Integer orderId;
    
    // Customer/User information
    private Integer clientId;
    private String clientNom;
    private String userNom;
}
