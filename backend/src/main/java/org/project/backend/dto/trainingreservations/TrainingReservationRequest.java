package org.project.backend.dto.trainingreservations;

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
public class TrainingReservationRequest {

    @NotNull(message = "Le type de formation est obligatoire")
    private Integer trainingTypeId;

    @NotNull(message = "La date de début est obligatoire")
    private LocalDate dateDebut;
}

