package org.project.backend.repository;

import org.project.backend.enums.TrainingReservationStatus;
import org.project.backend.model.TrainingReservation;
import org.project.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TrainingReservationRepository extends JpaRepository<TrainingReservation, Integer> {

    List<TrainingReservation> findByClient(User client);

    List<TrainingReservation> findByDresseur(User dresseur);

    @Query("SELECT tr FROM TrainingReservation tr WHERE tr.dresseur = :dresseur " +
           "AND (tr.status = org.project.backend.enums.TrainingReservationStatus.PENDING " +
           "OR tr.status = org.project.backend.enums.TrainingReservationStatus.CONFIRMEE) " +
           "AND ((tr.dateDebut <= :dateFin AND tr.dateFin >= :dateDebut))")
    List<TrainingReservation> findOverlappingReservations(
            @Param("dresseur") User dresseur,
            @Param("dateDebut") LocalDate dateDebut,
            @Param("dateFin") LocalDate dateFin
    );

    @Query("SELECT DISTINCT u FROM User u WHERE u.role = org.project.backend.enums.Role.DRESSEUR " +
           "AND u NOT IN (" +
           "SELECT tr.dresseur FROM TrainingReservation tr " +
           "WHERE (tr.status = org.project.backend.enums.TrainingReservationStatus.PENDING " +
           "OR tr.status = org.project.backend.enums.TrainingReservationStatus.CONFIRMEE) " +
           "AND ((tr.dateDebut <= :dateFin AND tr.dateFin >= :dateDebut))" +
           ")")
    List<User> findAvailableDresseurs(
            @Param("dateDebut") LocalDate dateDebut,
            @Param("dateFin") LocalDate dateFin
    );

    long countByStatus(TrainingReservationStatus status);
}

