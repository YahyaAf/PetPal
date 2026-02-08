package org.project.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "hotels")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Hotel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private String adresse;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Float prixParJour;

    @Column(nullable = false)
    private Boolean disponibilite;

    @Column(nullable = false)
    private Integer countOfPlace;

    @ManyToOne
    @JoinColumn(name = "city_id", nullable = false)
    private City city;
}
