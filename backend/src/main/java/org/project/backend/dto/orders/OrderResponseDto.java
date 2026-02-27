package org.project.backend.dto.orders;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.project.backend.enums.OrderStatus;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponseDto {

    private Integer idOrder;
    private Float total;
    private LocalDateTime dateOrder;
    private OrderStatus status;
    private Integer userId;
    private String userNom;
    private List<OrderItemResponseDto> items;
}

