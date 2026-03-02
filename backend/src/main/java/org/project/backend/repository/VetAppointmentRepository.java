package org.project.backend.repository;

import org.project.backend.model.VetAppointment;
import org.project.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface VetAppointmentRepository extends JpaRepository<VetAppointment, Integer> {

    List<VetAppointment> findByUser(User user);

    List<VetAppointment> findByUserIdUser(Integer userId);

    /**
     * Vérifie s'il existe un rendez-vous chevauchant le créneau demandé
     * (peu importe le client) => un seul rendez-vous par créneau d'1h.
     */
    @Query("SELECT COUNT(a) FROM VetAppointment a " +
           "WHERE a.status <> 'CANCELLED' " +
           "AND a.dateHeure < :dateFin " +
           "AND a.dateHeureFin > :dateDebut")
    long countOverlapping(@Param("dateDebut") LocalDateTime dateDebut,
                          @Param("dateFin") LocalDateTime dateFin);

    /**
     * Même requête mais en excluant un rendez-vous particulier (utile lors de l'update).
     */
    @Query("SELECT COUNT(a) FROM VetAppointment a " +
           "WHERE a.status <> 'CANCELLED' " +
           "AND a.id <> :excludeId " +
           "AND a.dateHeure < :dateFin " +
           "AND a.dateHeureFin > :dateDebut")
    long countOverlappingExcluding(@Param("dateDebut") LocalDateTime dateDebut,
                                   @Param("dateFin") LocalDateTime dateFin,
                                   @Param("excludeId") Integer excludeId);
}

