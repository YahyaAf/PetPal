package org.project.backend.dto.payments;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequest {

    private Integer reservationId;

    private Integer trainingReservationId;

    @NotBlank(message = "La méthode de paiement est obligatoire")
    private String paymentMethod;

    @NotBlank(message = "La devise est obligatoire")
    private String currency;
}
