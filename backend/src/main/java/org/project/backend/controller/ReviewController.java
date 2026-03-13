package org.project.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.project.backend.dto.reviews.ReviewRequest;
import org.project.backend.dto.reviews.ReviewResponse;
import org.project.backend.dto.reviews.ReviewUpdateRequest;
import org.project.backend.enums.ReservationType;
import org.project.backend.service.ReviewService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    // POST /api/reviews
    @PostMapping
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<ReviewResponse> create(
            @Valid @RequestBody ReviewRequest request,
            Authentication authentication) {
        ReviewResponse response = reviewService.create(request, authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // GET /api/reviews
    @GetMapping
    @PreAuthorize("hasAnyRole('CLIENT', 'ADMIN')")
    public ResponseEntity<List<ReviewResponse>> getAll() {
        return ResponseEntity.ok(reviewService.getAll());
    }

    // GET /api/reviews/count
    @GetMapping("/count")
    @PreAuthorize("hasAnyRole('CLIENT', 'ADMIN')")
    public ResponseEntity<Map<String, Long>> count() {
        Map<String, Long> response = new HashMap<>();
        response.put("count", reviewService.count());
        return ResponseEntity.ok(response);
    }

    // GET /api/reviews/my-reviews
    @GetMapping("/my-reviews")
    @PreAuthorize("hasAnyRole('CLIENT', 'ADMIN')")
    public ResponseEntity<List<ReviewResponse>> getMyReviews(Authentication authentication) {
        return ResponseEntity.ok(reviewService.getMyReviews(authentication));
    }

    // GET /api/reviews/{id}
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CLIENT', 'ADMIN')")
    public ResponseEntity<ReviewResponse> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(reviewService.getById(id));
    }

    // GET /api/reviews/type/{type}  => ex: /api/reviews/type/HOTEL
    @GetMapping("/type/{type}")
    @PreAuthorize("hasAnyRole('CLIENT', 'ADMIN')")
    public ResponseEntity<List<ReviewResponse>> getByType(@PathVariable ReservationType type) {
        return ResponseEntity.ok(reviewService.getByType(type));
    }

    // GET /api/reviews/type/{type}/{reviewId}  => avis d'une réservation précise
    @GetMapping("/type/{type}/{reviewId}")
    @PreAuthorize("hasAnyRole('CLIENT', 'ADMIN')")
    public ResponseEntity<List<ReviewResponse>> getByTypeAndId(
            @PathVariable ReservationType type,
            @PathVariable Integer reviewId) {
        return ResponseEntity.ok(reviewService.getByTypeAndId(type, reviewId));
    }

    // PUT /api/reviews/{id}
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<ReviewResponse> update(
            @PathVariable Integer id,
            @Valid @RequestBody ReviewUpdateRequest request,
            Authentication authentication) {
        ReviewResponse response = reviewService.update(id, request, authentication);
        return ResponseEntity.ok(response);
    }

    // DELETE /api/reviews/{id}
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('CLIENT', 'ADMIN')")
    public ResponseEntity<Map<String, String>> delete(
            @PathVariable Integer id,
            Authentication authentication) {
        reviewService.delete(id, authentication);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Avis supprimé avec succès");
        return ResponseEntity.ok(response);
    }
}

