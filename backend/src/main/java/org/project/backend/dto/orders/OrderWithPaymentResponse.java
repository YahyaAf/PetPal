package org.project.backend.dto.orders;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.project.backend.enums.PaymentStatus;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderWithPaymentResponse {

    // Infos commande
    private Integer idOrder;
    private Float total;
    private LocalDateTime dateOrder;
    private org.project.backend.enums.OrderStatus orderStatus;

    // Infos paiement Stripe (clientSecret pour le front)
    private Integer paymentId;
    private String stripePaymentIntentId;
    private String stripeClientSecret;
    private PaymentStatus paymentStatus;

    private String message;
}

