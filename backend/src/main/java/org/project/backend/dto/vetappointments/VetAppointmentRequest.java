package org.project.backend.dto.vetappointments;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VetAppointmentRequest {

    @NotBlank(message = "Le service est obligatoire")
    private String service;

    /**
     * Date et heure de début au format ISO : "2026-03-10T09:00:00"
     * - Seules les heures pleines sont acceptées (minutes = 0).
     * - Week-end interdit (samedi / dimanche).
     * - La date ne peut pas être dans le passé.
     */
    @NotNull(message = "La date et heure sont obligatoires")
    private String dateHeure; // reçu en String pour valider les minutes côté service
}

