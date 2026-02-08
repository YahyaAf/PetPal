package org.project.backend.mapper;

import org.project.backend.dto.cities.CityRequest;
import org.project.backend.dto.cities.CityResponse;
import org.project.backend.model.City;
import org.springframework.stereotype.Component;

@Component
public class CityMapper {

    public City toEntity(CityRequest request) {
        return City.builder()
                .nomVille(request.getNomVille())
                .build();
    }

    public CityResponse toResponse(City city) {
        return CityResponse.builder()
                .idCity(city.getIdCity())
                .nomVille(city.getNomVille())
                .build();
    }

    public void updateEntityFromRequest(City city, CityRequest request) {
        city.setNomVille(request.getNomVille());
    }
}
