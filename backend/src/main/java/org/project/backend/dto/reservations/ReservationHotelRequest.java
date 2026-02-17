package org.project.backend.dto.reservations;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReservationHotelRequest {

    @NotNull(message = "La date de début est obligatoire")
    private LocalDate dateDebut;

    @NotNull(message = "Le nombre de jours est obligatoire")
    @Min(value = 1, message = "Le nombre de jours doit être au moins 1")
    @Max(value = 365, message = "Le nombre de jours ne peut pas dépasser 365")
    private Integer days;

    @NotNull(message = "L'ID de l'hôtel est obligatoire")
    private Integer hotelId;

    // userId sera récupéré depuis l'authentification (pas dans le DTO)
}
