package org.project.backend.mapper;

import lombok.RequiredArgsConstructor;
import org.project.backend.dto.trainingreservations.TrainingReservationResponse;
import org.project.backend.model.TrainingReservation;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TrainingReservationMapper {

    private final UserMapper userMapper;
    private final TrainingTypeMapper trainingTypeMapper;

    public TrainingReservationResponse toResponse(TrainingReservation trainingReservation) {
        return TrainingReservationResponse.builder()
                .idReservation(trainingReservation.getIdReservation())
                .client(userMapper.toResponse(trainingReservation.getClient()))
                .dresseur(userMapper.toResponse(trainingReservation.getDresseur()))
                .trainingType(trainingTypeMapper.toResponse(trainingReservation.getTrainingType()))
                .dateDebut(trainingReservation.getDateDebut())
                .dateFin(trainingReservation.getDateFin())
                .totalPrice(trainingReservation.getTotalPrice())
                .createdAt(trainingReservation.getCreatedAt())
                .status(trainingReservation.getStatus())
                .build();
    }
}

