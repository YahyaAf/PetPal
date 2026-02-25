package org.project.backend.dto.trainingreservations;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrainingReservationWithPaymentResponse {

    private TrainingReservationResponse reservation;
    private Integer paymentId;
    private String stripePaymentIntentId;
    private String stripeClientSecret;
    private String message;
}

