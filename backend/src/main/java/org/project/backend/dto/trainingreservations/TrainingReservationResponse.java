package org.project.backend.dto.trainingreservations;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.project.backend.dto.trainings.TrainingTypeResponse;
import org.project.backend.dto.users.UserResponse;
import org.project.backend.enums.TrainingReservationStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrainingReservationResponse {

    private Integer idReservation;
    private UserResponse client;
    private UserResponse dresseur;
    private TrainingTypeResponse trainingType;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private Double totalPrice;
    private LocalDateTime createdAt;
    private TrainingReservationStatus status;
}

