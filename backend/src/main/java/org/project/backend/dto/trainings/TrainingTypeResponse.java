package org.project.backend.dto.trainings;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrainingTypeResponse {

    private Integer idType;
    private String nom;
    private String description;
    private Double prix;
    private Integer duree;
}

