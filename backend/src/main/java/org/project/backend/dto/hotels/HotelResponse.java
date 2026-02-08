package org.project.backend.dto.hotels;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.project.backend.dto.cities.CityResponse;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HotelResponse {

    private Integer id;
    private String nom;
    private String adresse;
    private String description;
    private Float prixParJour;
    private Boolean disponibilite;
    private Integer countOfPlace;
    private CityResponse city;
}
