package org.project.backend.repository;

import org.project.backend.enums.CartStatus;
import org.project.backend.model.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Integer> {

    Optional<Cart> findByUserIdUserAndStatus(Integer userId, CartStatus status);

    boolean existsByUserIdUserAndStatus(Integer userId, CartStatus status);
}

