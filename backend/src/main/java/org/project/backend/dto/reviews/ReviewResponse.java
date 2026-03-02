package org.project.backend.dto.reviews;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.project.backend.enums.ReservationType;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {

    private Integer idReview;
    private Integer userId;
    private String userNom;
    private String userEmail;
    private Integer rating;
    private String commentaire;
    private LocalDateTime dateReview;
    private ReservationType reservationType;
    private Integer reviewId;
}

