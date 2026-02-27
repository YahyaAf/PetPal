package org.project.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.project.backend.dto.orders.OrderRequestDto;
import org.project.backend.dto.orders.OrderResponseDto;
import org.project.backend.dto.orders.OrderWithPaymentResponse;
import org.project.backend.model.User;
import org.project.backend.service.OrderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Slf4j
public class OrderController {

    private final OrderService orderService;

    // ─────────────────────────────────────────────
    //  CRÉER UNE COMMANDE + PAYMENT INITIE (même logique que réservations)
    // ─────────────────────────────────────────────
    @PostMapping
    public ResponseEntity<OrderWithPaymentResponse> createOrder(
            @Valid @RequestBody OrderRequestDto requestDto,
            @AuthenticationPrincipal User currentUser) {
        OrderWithPaymentResponse response = orderService.createOrder(requestDto, currentUser.getIdUser());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // ─────────────────────────────────────────────
    //  LECTURES
    // ─────────────────────────────────────────────
    @GetMapping
    public ResponseEntity<List<OrderResponseDto>> getAll() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponseDto> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<OrderResponseDto>> getByUser(@PathVariable Integer userId) {
        return ResponseEntity.ok(orderService.getOrdersByUser(userId));
    }

    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> count() {
        Map<String, Long> response = new HashMap<>();
        response.put("count", orderService.count());
        return ResponseEntity.ok(response);
    }

    // ─────────────────────────────────────────────
    //  ANNULER UNE COMMANDE
    // ─────────────────────────────────────────────
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<OrderResponseDto> cancelOrder(@PathVariable Integer id) {
        return ResponseEntity.ok(orderService.cancelOrder(id));
    }
}
