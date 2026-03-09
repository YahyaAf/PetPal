package org.project.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
@Slf4j
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

        if (request.getDateDebut().isBefore(LocalDate.now())) {
            throw new InvalidRequestException("La date de début ne peut pas être dans le passé");
        }

        ReservationHotel reservation = reservationMapper.toEntity(request, user);

        // Vérifier la capacité (CONFIRMEE + PENDING) avant de créer la réservation
        validateCapacityForCreate(reservation.getHotel().getId(), reservation.getDateDebut(), reservation.getDateFin());

        ReservationHotel savedReservation = reservationRepository.save(reservation);
        return reservationMapper.toResponse(savedReservation);
    }

    /**
     * Vérifie la disponibilité à la CRÉATION.
     *
     * Logique :
     *   - Compter combien de réservations ACTIVES (CONFIRMEE + PENDING) se chevauchent avec la période demandée.
     *   - Si ce nombre >= countOfPlace → l'hôtel est complet → erreur avec la première date disponible.
     *
     * Exemple : hôtel 1 chambre.
     *   - Réservation existante : 5 mars → 10 mars (CONFIRMEE)
     *   - Nouvelle demande      : 7 mars → 12 mars  → chevauchement → BLOQUÉ
     *   - Nouvelle demande      : 10 mars → 15 mars → pas de chevauchement → OK
     */
    private void validateCapacityForCreate(Integer hotelId, LocalDate dateDebut, LocalDate dateFin) {
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel", "id", hotelId));

        int capacity = hotel.getCountOfPlace();

        long overlapping = reservationRepository.countOverlappingActiveReservations(hotelId, dateDebut, dateFin);

        if (overlapping >= capacity) {
            LocalDate firstAvailable = findFirstAvailableDate(hotelId, dateDebut, dateFin, capacity);
            throw new HotelCapacityExceededException(
                    String.format(
                            "L'hôtel '%s' est complet (capacité: %d place(s)) pour la période du %s au %s. " +
                            "La prochaine disponibilité est à partir du %s.",
                            hotel.getNom(),
                            capacity,
                            dateDebut,
                            dateFin,
                            firstAvailable
                    )
            );
        }
    }

    /**
     * Vérifie la capacité à la CONFIRMATION (après paiement réussi).
     * Compte uniquement les CONFIRMEE en excluant la réservation courante (encore PENDING).
     * Cas de concurrence rare : deux clients paient en même temps pour la dernière place.
     */
    private void validateCapacityForConfirm(Integer hotelId, LocalDate dateDebut, LocalDate dateFin, Integer reservationId) {
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel", "id", hotelId));

        int capacity = hotel.getCountOfPlace();

        long overlapping = reservationRepository.countOverlappingConfirmedExcluding(hotelId, dateDebut, dateFin, reservationId);

        if (overlapping >= capacity) {
            throw new HotelCapacityExceededException(
                    String.format(
                            "Impossible de confirmer : l'hôtel '%s' est complet (capacité: %d place(s)) " +
                            "pour la période du %s au %s. Le paiement sera remboursé.",
                            hotel.getNom(),
                            capacity,
                            dateDebut,
                            dateFin
                    )
            );
        }
    }

    /**
     * Trouve la première date à partir de laquelle la période demandée devient disponible.
     * Principe : on cherche la dateFin des réservations qui bloquent → à partir de cette date
     * le chevauchement diminue. On teste chaque dateFin comme nouveau dateDebut candidat.
     */
    private LocalDate findFirstAvailableDate(Integer hotelId, LocalDate dateDebut, LocalDate dateFin, int capacity) {
        int durationDays = (int) (dateFin.toEpochDay() - dateDebut.toEpochDay());

        // Récupérer toutes les réservations actives qui se terminent après dateDebut
        List<ReservationHotel> activeReservations = reservationRepository.findActiveReservationsEndingAfter(hotelId, dateDebut);

        // Tester chaque dateFin existante comme candidat de début
        List<LocalDate> candidates = activeReservations.stream()
                .map(ReservationHotel::getDateFin)
                .distinct()
                .sorted()
                .toList();

        for (LocalDate candidate : candidates) {
            LocalDate candidateFin = candidate.plusDays(durationDays);
            long overlapping = reservationRepository.countOverlappingActiveReservations(hotelId, candidate, candidateFin);
            if (overlapping < capacity) {
                return candidate;
            }
        }

        // Fallback : lendemain de la dernière réservation active
        return candidates.isEmpty()
                ? dateDebut.plusDays(1)
                : candidates.get(candidates.size() - 1).plusDays(1);
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

        if (reservation.getStatus() == ReservationHotelStatus.ANNULEE) {
            throw new InvalidRequestException("Impossible de confirmer une réservation annulée.");
        }

        // Vérifier que la capacité CONFIRMEE n'est pas dépassée (en excluant cette résa PENDING)
        validateCapacityForConfirm(
                reservation.getHotel().getId(),
                reservation.getDateDebut(),
                reservation.getDateFin(),
                reservationId
        );

        reservation.setStatus(ReservationHotelStatus.CONFIRMEE);
        reservationRepository.save(reservation);
    }

    @Transactional
    public void cancelReservation(Integer reservationId) {
        ReservationHotel reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation", "id", reservationId));

        if (reservation.getStatus() == ReservationHotelStatus.CONFIRMEE) {
            throw new InvalidRequestException(
                    "Impossible d'annuler une réservation déjà confirmée. Veuillez contacter l'établissement pour toute demande d'annulation."
            );
        }

        if (reservation.getStatus() == ReservationHotelStatus.ANNULEE) {
            throw new InvalidRequestException("Cette réservation est déjà annulée.");
        }

        reservation.setStatus(ReservationHotelStatus.ANNULEE);
        reservationRepository.save(reservation);
    }

    /**
     * Annulation forcée par le système (ex: paiement échoué/annulé).
     * Pas de vérification de statut — override tout.
     */
    @Transactional
    public void cancelReservationBySystem(Integer reservationId) {
        ReservationHotel reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation", "id", reservationId));

        if (reservation.getStatus() == ReservationHotelStatus.ANNULEE) {
            return; // Déjà annulée, rien à faire
        }

        reservation.setStatus(ReservationHotelStatus.ANNULEE);
        reservationRepository.save(reservation);
        log.info("Réservation hôtel #{} annulée par le système (paiement échoué/annulé)", reservationId);
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
