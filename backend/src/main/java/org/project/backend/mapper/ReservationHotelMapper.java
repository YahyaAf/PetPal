package org.project.backend.mapper;

import lombok.RequiredArgsConstructor;
import org.project.backend.dto.clients.ClientResponse;
import org.project.backend.dto.reservations.ReservationHotelRequest;
import org.project.backend.dto.reservations.ReservationHotelResponse;
import org.project.backend.enums.ReservationHotelStatus;
import org.project.backend.exception.ResourceNotFoundException;
import org.project.backend.model.Client;
import org.project.backend.model.Hotel;
import org.project.backend.model.ReservationHotel;
import org.project.backend.model.User;
import org.project.backend.repository.HotelRepository;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
public class ReservationHotelMapper {

    private final HotelRepository hotelRepository;
    private final ClientMapper clientMapper;
    private final HotelMapper hotelMapper;

    public ReservationHotel toEntity(ReservationHotelRequest request, User user) {
        Hotel hotel = hotelRepository.findById(request.getHotelId())
                .orElseThrow(() -> new ResourceNotFoundException("Hotel", "id", request.getHotelId()));

        LocalDate dateFin = request.getDateDebut().plusDays(request.getDays());
        Float montantTotal = hotel.getPrixParJour() * request.getDays();

        return ReservationHotel.builder()
                .dateDebut(request.getDateDebut())
                .dateFin(dateFin)
                .days(request.getDays())
                .user(user)
                .hotel(hotel)
                .montantTotal(montantTotal)
                .status(ReservationHotelStatus.PENDING)
                .build();
    }

    public ReservationHotelResponse toResponse(ReservationHotel reservation) {
        ClientResponse clientResponse = null;
        if (reservation.getUser() instanceof Client client) {
            clientResponse = clientMapper.toResponse(client);
        }

        return ReservationHotelResponse.builder()
                .idReservation(reservation.getIdReservation())
                .dateDebut(reservation.getDateDebut())
                .dateFin(reservation.getDateFin())
                .days(reservation.getDays())
                .montantTotal(reservation.getMontantTotal() != null ? reservation.getMontantTotal().doubleValue() : null)
                .status(reservation.getStatus().name())
                .client(clientResponse)
                .hotel(hotelMapper.toResponse(reservation.getHotel()))
                .build();
    }
}
