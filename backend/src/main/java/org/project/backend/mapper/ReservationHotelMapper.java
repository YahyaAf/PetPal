package org.project.backend.mapper;

import lombok.RequiredArgsConstructor;
import org.project.backend.dto.reservations.ReservationHotelRequest;
import org.project.backend.dto.reservations.ReservationHotelResponse;
import org.project.backend.enums.ReservationHotelStatus;
import org.project.backend.exception.ResourceNotFoundException;
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
    private final UserMapper userMapper;
    private final HotelMapper hotelMapper;

    public ReservationHotel toEntity(ReservationHotelRequest request, User user) {
        Hotel hotel = hotelRepository.findById(request.getHotelId())
                .orElseThrow(() -> new ResourceNotFoundException("Hotel", "id", request.getHotelId()));

        // Calculer la date de fin automatiquement
        LocalDate dateFin = request.getDateDebut().plusDays(request.getDays());

        // Calculer le montant total
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
        return ReservationHotelResponse.builder()
                .idReservation(reservation.getIdReservation())
                .dateDebut(reservation.getDateDebut())
                .dateFin(reservation.getDateFin())
                .days(reservation.getDays())
                .montantTotal(reservation.getMontantTotal())
                .status(reservation.getStatus())
                .user(userMapper.toResponse(reservation.getUser()))
                .hotel(hotelMapper.toResponse(reservation.getHotel()))
                .build();
    }
}
