package org.project.backend.service;

import lombok.RequiredArgsConstructor;
import org.project.backend.dto.reviews.ReviewRequest;
import org.project.backend.dto.reviews.ReviewResponse;
import org.project.backend.dto.reviews.ReviewUpdateRequest;
import org.project.backend.enums.ReservationType;
import org.project.backend.exception.DuplicateResourceException;
import org.project.backend.exception.InvalidRequestException;
import org.project.backend.exception.ResourceNotFoundException;
import org.project.backend.mapper.ReviewMapper;
import org.project.backend.model.Review;
import org.project.backend.model.User;
import org.project.backend.repository.OrderRepository;
import org.project.backend.repository.ReservationHotelRepository;
import org.project.backend.repository.ReviewRepository;
import org.project.backend.repository.TrainingReservationRepository;
import org.project.backend.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ReviewMapper reviewMapper;
    private final UserRepository userRepository;
    private final ReservationHotelRepository reservationHotelRepository;
    private final TrainingReservationRepository trainingReservationRepository;
    private final OrderRepository orderRepository;

    @Transactional
    public ReviewResponse create(ReviewRequest request, Authentication authentication) {
        String userEmail = authentication.getName();
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        // Vérifier que la réservation existe
        validateReservationExists(request.getReservationType(), request.getReviewId());

        // Un utilisateur ne peut laisser qu'un seul avis par réservation
        reviewRepository.findByUserAndReservationTypeAndReviewId(user, request.getReservationType(), request.getReviewId())
                .ifPresent(r -> {
                    throw new DuplicateResourceException(
                            "Vous avez déjà laissé un avis pour cette réservation."
                    );
                });

        Review review = Review.builder()
                .user(user)
                .rating(request.getRating())
                .commentaire(request.getCommentaire())
                .reservationType(request.getReservationType())
                .reviewId(request.getReviewId())
                .build();

        return reviewMapper.toResponse(reviewRepository.save(review));
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getAll() {
        return reviewRepository.findAll()
                .stream()
                .map(reviewMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ReviewResponse getById(Integer id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", id));
        return reviewMapper.toResponse(review);
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getMyReviews(Authentication authentication) {
        String userEmail = authentication.getName();
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));
        return reviewRepository.findByUser(user)
                .stream()
                .map(reviewMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getByType(ReservationType type) {
        return reviewRepository.findByReservationType(type)
                .stream()
                .map(reviewMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getByTypeAndId(ReservationType type, Integer reviewId) {
        return reviewRepository.findByReservationTypeAndReviewId(type, reviewId)
                .stream()
                .map(reviewMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ReviewResponse update(Integer id, ReviewUpdateRequest request, Authentication authentication) {
        String userEmail = authentication.getName();
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", id));

        // Seul l'auteur peut modifier son avis
        if (!review.getUser().getIdUser().equals(user.getIdUser())) {
            throw new InvalidRequestException("Vous ne pouvez modifier que vos propres avis.");
        }

        review.setRating(request.getRating());
        review.setCommentaire(request.getCommentaire());

        return reviewMapper.toResponse(reviewRepository.save(review));
    }

    @Transactional
    public void delete(Integer id, Authentication authentication) {
        String userEmail = authentication.getName();
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", id));

        // Seul l'auteur ou un admin peut supprimer
        boolean isAdmin = user.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));

        if (!review.getUser().getIdUser().equals(user.getIdUser()) && !isAdmin) {
            throw new InvalidRequestException("Vous ne pouvez supprimer que vos propres avis.");
        }

        reviewRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public long count() {
        return reviewRepository.count();
    }

    // -------------------------------------------------------------------------
    private void validateReservationExists(ReservationType type, Integer id) {
        switch (type) {
            case HOTEL -> {
                if (!reservationHotelRepository.existsById(id)) {
                    throw new ResourceNotFoundException("ReservationHotel", "id", id);
                }
            }
            case TRAINING -> {
                if (!trainingReservationRepository.existsById(id)) {
                    throw new ResourceNotFoundException("TrainingReservation", "id", id);
                }
            }
            case ORDER -> {
                if (!orderRepository.existsById(id)) {
                    throw new ResourceNotFoundException("Order", "id", id);
                }
            }
        }
    }
}


