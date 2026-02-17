package org.project.backend.repository;

import org.project.backend.enums.ReservationHotelStatus;
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

    @Query("SELECT COUNT(r) FROM ReservationHotel r WHERE r.hotel.id = :hotelId " +
            "AND r.status = :status " +
            "AND r.dateDebut <= :dateFin " +
            "AND r.dateFin >= :dateDebut")
    Long countOverlappingReservations(
            @Param("hotelId") Integer hotelId,
            @Param("dateDebut") LocalDate dateDebut,
            @Param("dateFin") LocalDate dateFin,
            @Param("status") ReservationHotelStatus status
    );

    @Query("SELECT COUNT(r) FROM ReservationHotel r WHERE r.hotel.id = :hotelId " +
            "AND r.status = :status " +
            "AND r.idReservation != :reservationId " +
            "AND r.dateDebut <= :dateFin " +
            "AND r.dateFin >= :dateDebut")
    Long countOverlappingReservationsExcludingCurrent(
            @Param("hotelId") Integer hotelId,
            @Param("dateDebut") LocalDate dateDebut,
            @Param("dateFin") LocalDate dateFin,
            @Param("status") ReservationHotelStatus status,
            @Param("reservationId") Integer reservationId
    );
}
