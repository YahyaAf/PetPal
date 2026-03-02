package org.project.backend.dto.reviews;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.project.backend.enums.ReservationType;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewRequest {

    @NotNull(message = "La note est obligatoire")
    @Min(value = 1, message = "La note minimale est 1")
    @Max(value = 5, message = "La note maximale est 5")
    private Integer rating;

    @NotBlank(message = "Le commentaire est obligatoire")
    @Size(min = 5, max = 1000, message = "Le commentaire doit contenir entre 5 et 1000 caractères")
    private String commentaire;

    @NotNull(message = "Le type de réservation est obligatoire")
    private ReservationType reservationType;

    @NotNull(message = "L'ID de la réservation est obligatoire")
    private Integer reviewId;
}

