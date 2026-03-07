package org.project.backend.repository;

import org.project.backend.model.ReservationHotel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ReservationHotelRepository extends JpaRepository<ReservationHotel, Integer> {

    List<ReservationHotel> findByUserIdUser(Integer userId);

    List<ReservationHotel> findByHotelId(Integer hotelId);

    /**
     * Compte combien de réservations ACTIVES (CONFIRMEE + PENDING)
     * se chevauchent avec la période demandée [dateDebut, dateFin[.
     *
     * Formule de chevauchement : dateDebut_existante < dateFin_nouvelle AND dateFin_existante > dateDebut_nouvelle
     *
     * Utilisé à la CRÉATION pour vérifier la disponibilité avant de créer la réservation.
     */
    @Query("SELECT COUNT(r) FROM ReservationHotel r " +
            "WHERE r.hotel.id = :hotelId " +
            "AND r.status IN ('CONFIRMEE', 'PENDING') " +
            "AND r.dateDebut < :dateFin " +
            "AND r.dateFin > :dateDebut")
    Long countOverlappingActiveReservations(
            @Param("hotelId") Integer hotelId,
            @Param("dateDebut") LocalDate dateDebut,
            @Param("dateFin") LocalDate dateFin
    );

    /**
     * Compte combien de réservations CONFIRMEES se chevauchent avec la période,
     * en excluant la réservation courante (encore PENDING, en attente de confirmation).
     *
     * Utilisé à la CONFIRMATION (après paiement) pour anti-concurrence.
     */
    @Query("SELECT COUNT(r) FROM ReservationHotel r " +
            "WHERE r.hotel.id = :hotelId " +
            "AND r.status = 'CONFIRMEE' " +
            "AND r.idReservation != :excludeId " +
            "AND r.dateDebut < :dateFin " +
            "AND r.dateFin > :dateDebut")
    Long countOverlappingConfirmedExcluding(
            @Param("hotelId") Integer hotelId,
            @Param("dateDebut") LocalDate dateDebut,
            @Param("dateFin") LocalDate dateFin,
            @Param("excludeId") Integer excludeId
    );

    /**
     * Retourne toutes les réservations actives (CONFIRMEE + PENDING) dont la dateFin
     * est après une date donnée. Utilisé pour trouver la première date disponible.
     */
    @Query("SELECT r FROM ReservationHotel r " +
            "WHERE r.hotel.id = :hotelId " +
            "AND r.status IN ('CONFIRMEE', 'PENDING') " +
            "AND r.dateFin > :fromDate " +
            "ORDER BY r.dateFin ASC")
    List<ReservationHotel> findActiveReservationsEndingAfter(
            @Param("hotelId") Integer hotelId,
            @Param("fromDate") LocalDate fromDate
    );
}
