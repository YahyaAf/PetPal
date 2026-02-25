package org.project.backend.mapper;

import org.project.backend.dto.trainings.TrainingTypeRequest;
import org.project.backend.dto.trainings.TrainingTypeResponse;
import org.project.backend.model.TrainingType;
import org.springframework.stereotype.Component;

@Component
public class TrainingTypeMapper {

    public TrainingType toEntity(TrainingTypeRequest request) {
        return TrainingType.builder()
                .nom(request.getNom())
                .description(request.getDescription())
                .prix(request.getPrix())
                .duree(request.getDuree())
                .build();
    }

    public TrainingTypeResponse toResponse(TrainingType trainingType) {
        return TrainingTypeResponse.builder()
                .idType(trainingType.getIdType())
                .nom(trainingType.getNom())
                .description(trainingType.getDescription())
                .prix(trainingType.getPrix())
                .duree(trainingType.getDuree())
                .build();
    }

    public void updateEntityFromRequest(TrainingType trainingType, TrainingTypeRequest request) {
        trainingType.setNom(request.getNom());
        trainingType.setDescription(request.getDescription());
        trainingType.setPrix(request.getPrix());
        trainingType.setDuree(request.getDuree());
    }
}

