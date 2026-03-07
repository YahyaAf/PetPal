package org.project.backend.dto.reservations;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.project.backend.dto.clients.ClientResponse;
import org.project.backend.dto.hotels.HotelResponse;

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
    private Double montantTotal;
    private String status;
    private ClientResponse client;
    private HotelResponse hotel;
}
