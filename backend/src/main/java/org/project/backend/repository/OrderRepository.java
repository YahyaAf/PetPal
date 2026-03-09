package org.project.backend.repository;

import org.project.backend.enums.OrderStatus;
import org.project.backend.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {

    List<Order> findByUserIdUser(Integer userId);

    List<Order> findByUserIdUserAndStatus(Integer userId, OrderStatus status);
}

