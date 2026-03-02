package org.project.backend.mapper;

import org.project.backend.dto.vetappointments.VetAppointmentResponse;
import org.project.backend.model.VetAppointment;
import org.springframework.stereotype.Component;

@Component
public class VetAppointmentMapper {

    public VetAppointmentResponse toResponse(VetAppointment appointment) {
        return VetAppointmentResponse.builder()
                .id(appointment.getId())
                .userId(appointment.getUser().getIdUser())
                .userNom(appointment.getUser().getNom())
                .userEmail(appointment.getUser().getEmail())
                .service(appointment.getService())
                .dateHeure(appointment.getDateHeure())
                .dateHeureFin(appointment.getDateHeureFin())
                .status(appointment.getStatus())
                .createdAt(appointment.getCreatedAt())
                .build();
    }
}

