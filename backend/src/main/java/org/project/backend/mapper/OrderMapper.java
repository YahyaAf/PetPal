package org.project.backend.mapper;

import org.project.backend.dto.orders.OrderItemResponseDto;
import org.project.backend.dto.orders.OrderResponseDto;
import org.project.backend.model.Order;
import org.project.backend.model.OrderItem;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class OrderMapper {

    public OrderItemResponseDto toItemResponseDto(OrderItem item) {
        return OrderItemResponseDto.builder()
                .idOrderItem(item.getIdOrderItem())
                .productId(item.getProduct().getId())
                .productNom(item.getProduct().getNom())
                .quantite(item.getQuantite())
                .prixUnitaire(item.getPrixUnitaire())
                .sousTotal(item.getPrixUnitaire() * item.getQuantite())
                .build();
    }

    public OrderResponseDto toResponseDto(Order order) {
        List<OrderItemResponseDto> items = order.getOrderItems().stream()
                .map(this::toItemResponseDto)
                .collect(Collectors.toList());

        return OrderResponseDto.builder()
                .idOrder(order.getIdOrder())
                .total(order.getTotal())
                .dateOrder(order.getDateOrder())
                .status(order.getStatus())
                .userId(order.getUser().getIdUser())
                .userNom(order.getUser().getNom())
                .items(items)
                .build();
    }
}

