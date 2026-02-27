package org.project.backend.dto.orders;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.project.backend.enums.OrderStatus;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderCheckoutResponseDto {

    private Integer idOrder;
    private Float total;
    private LocalDateTime dateOrder;
    private OrderStatus status;
    private String checkoutUrl;
    private String message;
}

