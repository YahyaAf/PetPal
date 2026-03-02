package org.project.backend.dto.vetappointments;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.project.backend.enums.VetAppointmentStatus;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VetAppointmentStatusRequest {

    @NotNull(message = "Le statut est obligatoire")
    private VetAppointmentStatus status;
}

