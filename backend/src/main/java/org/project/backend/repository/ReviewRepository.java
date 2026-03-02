package org.project.backend.repository;

import org.project.backend.enums.ReservationType;
import org.project.backend.model.Review;
import org.project.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Integer> {

    List<Review> findByUser(User user);

    List<Review> findByReservationType(ReservationType reservationType);

    List<Review> findByReservationTypeAndReviewId(ReservationType reservationType, Integer reviewId);

    Optional<Review> findByUserAndReservationTypeAndReviewId(User user, ReservationType reservationType, Integer reviewId);
}

