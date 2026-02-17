package org.project.backend.mapper;

import lombok.RequiredArgsConstructor;
import org.project.backend.dto.hotels.HotelRequest;
import org.project.backend.dto.hotels.HotelResponse;
import org.project.backend.exception.ResourceNotFoundException;
import org.project.backend.model.City;
import org.project.backend.model.Hotel;
import org.project.backend.repository.CityRepository;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class HotelMapper {

    private final CityRepository cityRepository;
    private final CityMapper cityMapper;

    public Hotel toEntity(HotelRequest request) {
        City city = cityRepository.findById(request.getCityId())
                .orElseThrow(() -> new ResourceNotFoundException("City", "id", request.getCityId()));

        return Hotel.builder()
                .nom(request.getNom())
                .adresse(request.getAdresse())
                .description(request.getDescription())
                .prixParJour(request.getPrixParJour())
                .disponibilite(request.getDisponibilite())
                .countOfPlace(request.getCountOfPlace())
                .city(city)
                .build();
    }

    public HotelResponse toResponse(Hotel hotel) {
        return HotelResponse.builder()
                .id(hotel.getId())
                .nom(hotel.getNom())
                .adresse(hotel.getAdresse())
                .description(hotel.getDescription())
                .prixParJour(hotel.getPrixParJour())
                .disponibilite(hotel.getDisponibilite())
                .countOfPlace(hotel.getCountOfPlace())
                .city(cityMapper.toResponse(hotel.getCity()))
                .build();
    }

    public void updateEntityFromRequest(Hotel hotel, HotelRequest request) {
        hotel.setNom(request.getNom());
        hotel.setAdresse(request.getAdresse());
        hotel.setDescription(request.getDescription());
        hotel.setPrixParJour(request.getPrixParJour());
        hotel.setDisponibilite(request.getDisponibilite());
        hotel.setCountOfPlace(request.getCountOfPlace());

        if (!hotel.getCity().getIdCity().equals(request.getCityId())) {
            City city = cityRepository.findById(request.getCityId())
                    .orElseThrow(() -> new ResourceNotFoundException("City", "id", request.getCityId()));
            hotel.setCity(city);
        }
    }
}
