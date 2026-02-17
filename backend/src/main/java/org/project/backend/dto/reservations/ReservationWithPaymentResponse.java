package org.project.backend.dto.reservations;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReservationWithPaymentResponse {

    private ReservationHotelResponse reservation;
    private Integer paymentId;
    private String stripePaymentIntentId;
    private String stripeClientSecret;
    private String message;
}
