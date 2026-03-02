package org.project.backend.mapper;

import org.project.backend.dto.reviews.ReviewResponse;
import org.project.backend.model.Review;
import org.springframework.stereotype.Component;

@Component
public class ReviewMapper {

    public ReviewResponse toResponse(Review review) {
        return ReviewResponse.builder()
                .idReview(review.getIdReview())
                .userId(review.getUser().getIdUser())
                .userNom(review.getUser().getNom())
                .userEmail(review.getUser().getEmail())
                .rating(review.getRating())
                .commentaire(review.getCommentaire())
                .dateReview(review.getDateReview())
                .reservationType(review.getReservationType())
                .reviewId(review.getReviewId())
                .build();
    }
}

