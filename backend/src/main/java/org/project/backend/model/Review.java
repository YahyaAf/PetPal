package org.project.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.project.backend.enums.ReservationType;

import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idReview;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * Note de 1 à 5
     */
    @Column(nullable = false)
    private Integer rating;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String commentaire;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime dateReview = LocalDateTime.now();

    /**
     * Type de la réservation concernée : HOTEL, TRAINING ou ORDER
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReservationType reservationType;

    /**
     * ID de la réservation concernée (hotel, training ou order selon reservationType)
     */
    @Column(nullable = false)
    private Integer reviewId;

    @PrePersist
    protected void onCreate() {
        if (dateReview == null) {
            dateReview = LocalDateTime.now();
        }
    }
}

