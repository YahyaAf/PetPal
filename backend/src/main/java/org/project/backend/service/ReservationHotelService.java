package org.project.backend.service;

import lombok.RequiredArgsConstructor;
import org.project.backend.dto.reservations.ReservationHotelRequest;
import org.project.backend.dto.reservations.ReservationHotelResponse;
import org.project.backend.enums.ReservationHotelStatus;
import org.project.backend.exception.HotelCapacityExceededException;
import org.project.backend.exception.InvalidRequestException;
import org.project.backend.exception.ResourceNotFoundException;
import org.project.backend.mapper.ReservationHotelMapper;
import org.project.backend.model.Hotel;
import org.project.backend.model.ReservationHotel;
import org.project.backend.model.User;
import org.project.backend.repository.HotelRepository;
import org.project.backend.repository.ReservationHotelRepository;
import org.project.backend.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReservationHotelService {

    private final ReservationHotelRepository reservationRepository;
    private final ReservationHotelMapper reservationMapper;
    private final UserRepository userRepository;
    private final HotelRepository hotelRepository;

    @Transactional
    public ReservationHotelResponse create(ReservationHotelRequest request, Authentication authentication) {
        String userEmail = authentication.getName();
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        // Valider que la date de début n'est pas dans le passé
        if (request.getDateDebut().isBefore(LocalDate.now())) {
            throw new InvalidRequestException("La date de début ne peut pas être dans le passé");
        }

        ReservationHotel reservation = reservationMapper.toEntity(request, user);

        validateHotelCapacity(reservation);

        ReservationHotel savedReservation = reservationRepository.save(reservation);
        return reservationMapper.toResponse(savedReservation);
    }

    private void validateHotelCapacity(ReservationHotel reservation) {
        Hotel hotel = hotelRepository.findById(reservation.getHotel().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Hotel", "id", reservation.getHotel().getId()));

        Long overlappingReservations = reservationRepository.countOverlappingReservations(
                hotel.getId(),
                reservation.getDateDebut(),
                reservation.getDateFin(),
                ReservationHotelStatus.CONFIRMEE
        );

        if (overlappingReservations >= hotel.getCountOfPlace()) {
            throw new HotelCapacityExceededException(
                    String.format("L'hôtel '%s' a atteint sa capacité maximale (%d places) pour la période du %s au %s. Il y a déjà %d réservation(s) confirmée(s).",
                            hotel.getNom(),
                            hotel.getCountOfPlace(),
                            reservation.getDateDebut(),
                            reservation.getDateFin(),
                            overlappingReservations)
            );
        }
    }

    @Transactional(readOnly = true)
    public List<ReservationHotelResponse> getAll() {
        return reservationRepository.findAll()
                .stream()
                .map(reservationMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ReservationHotelResponse getById(Integer id) {
        ReservationHotel reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation", "id", id));
        return reservationMapper.toResponse(reservation);
    }

    @Transactional(readOnly = true)
    public List<ReservationHotelResponse> getMyReservations(Authentication authentication) {
        String userEmail = authentication.getName();
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        return reservationRepository.findByUserIdUser(user.getIdUser())
                .stream()
                .map(reservationMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReservationHotelResponse> getByHotel(Integer hotelId) {
        return reservationRepository.findByHotelId(hotelId)
                .stream()
                .map(reservationMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void confirmReservation(Integer reservationId) {
        ReservationHotel reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation", "id", reservationId));

        if (reservation.getStatus() == ReservationHotelStatus.CONFIRMEE) {
            return;
        }

        Hotel hotel = reservation.getHotel();

        Long overlappingReservations = reservationRepository.countOverlappingReservationsExcludingCurrent(
                hotel.getId(),
                reservation.getDateDebut(),
                reservation.getDateFin(),
                ReservationHotelStatus.CONFIRMEE,
                reservationId
        );

        if (overlappingReservations >= hotel.getCountOfPlace()) {
            throw new HotelCapacityExceededException(
                    String.format("Impossible de confirmer la réservation. L'hôtel '%s' a atteint sa capacité maximale (%d places) pour la période du %s au %s. Il y a déjà %d réservation(s) confirmée(s).",
                            hotel.getNom(),
                            hotel.getCountOfPlace(),
                            reservation.getDateDebut(),
                            reservation.getDateFin(),
                            overlappingReservations)
            );
        }

        reservation.setStatus(ReservationHotelStatus.CONFIRMEE);
        reservationRepository.save(reservation);
    }

    @Transactional
    public void cancelReservation(Integer reservationId) {
        ReservationHotel reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation", "id", reservationId));

        reservation.setStatus(ReservationHotelStatus.ANNULEE);
        reservationRepository.save(reservation);
    }

    @Transactional
    public void delete(Integer id) {
        if (!reservationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Reservation", "id", id);
        }
        reservationRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public long count() {
        return reservationRepository.count();
    }
}
