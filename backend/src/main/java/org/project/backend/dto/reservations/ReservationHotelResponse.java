package org.project.backend.dto.reservations;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.project.backend.dto.hotels.HotelResponse;
import org.project.backend.dto.users.UserResponse;
import org.project.backend.enums.ReservationHotelStatus;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReservationHotelResponse {

    private Integer idReservation;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private Integer days;
    private Float montantTotal;
    private ReservationHotelStatus status;
    private UserResponse user;
    private HotelResponse hotel;
}
