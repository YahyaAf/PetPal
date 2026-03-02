package org.project.backend.dto.vetappointments;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.project.backend.enums.VetAppointmentStatus;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VetAppointmentResponse {

    private Integer id;
    private Integer userId;
    private String userNom;
    private String userEmail;
    private String service;
    private LocalDateTime dateHeure;
    private LocalDateTime dateHeureFin;
    private VetAppointmentStatus status;
    private LocalDateTime createdAt;
}

