package org.project.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.project.backend.enums.VetAppointmentStatus;

import java.time.LocalDateTime;

@Entity
@Table(name = "vet_appointments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VetAppointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * Service / motif du rendez-vous (ex: "Vaccination", "Consultation", etc.)
     */
    @Column(nullable = false)
    private String service;

    /**
     * Date et heure de début choisie par le client.
     * Minutes toujours à 0 (heure pleine uniquement), week-end interdit.
     */
    @Column(name = "date_heure", nullable = false)
    private LocalDateTime dateHeure;

    /**
     * Date et heure de fin = dateHeure + 1 heure (générée automatiquement).
     */
    @Column(name = "date_heure_fin", nullable = false)
    private LocalDateTime dateHeureFin;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private VetAppointmentStatus status = VetAppointmentStatus.PENDING;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        // Forcer dateHeureFin = dateHeure + 1 heure
        if (dateHeure != null) {
            dateHeureFin = dateHeure.plusHours(1);
        }
    }
}

