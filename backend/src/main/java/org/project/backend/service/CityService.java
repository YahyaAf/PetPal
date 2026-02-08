package org.project.backend.service;

import lombok.RequiredArgsConstructor;
import org.project.backend.dto.cities.CityRequest;
import org.project.backend.dto.cities.CityResponse;
import org.project.backend.exception.DuplicateResourceException;
import org.project.backend.exception.ResourceNotFoundException;
import org.project.backend.mapper.CityMapper;
import org.project.backend.model.City;
import org.project.backend.repository.CityRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CityService {

    private final CityRepository cityRepository;
    private final CityMapper cityMapper;

    @Transactional
    public CityResponse create(CityRequest cityRequest) {
        if (cityRepository.existsByNomVille(cityRequest.getNomVille())) {
            throw new DuplicateResourceException("City", "nomVille", cityRequest.getNomVille());
        }

        City city = cityMapper.toEntity(cityRequest);
        City savedCity = cityRepository.save(city);
        return cityMapper.toResponse(savedCity);
    }

    @Transactional
    public CityResponse update(Integer id, CityRequest cityRequest) {
        City city = cityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("City", "id", id));

        if (!city.getNomVille().equals(cityRequest.getNomVille()) &&
                cityRepository.existsByNomVille(cityRequest.getNomVille())) {
            throw new DuplicateResourceException("City", "nomVille", cityRequest.getNomVille());
        }

        cityMapper.updateEntityFromRequest(city, cityRequest);
        City updatedCity = cityRepository.save(city);
        return cityMapper.toResponse(updatedCity);
    }

    @Transactional(readOnly = true)
    public List<CityResponse> getAll() {
        return cityRepository.findAll()
                .stream()
                .map(cityMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CityResponse getById(Integer id) {
        City city = cityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("City", "id", id));
        return cityMapper.toResponse(city);
    }

    @Transactional
    public void delete(Integer id) {
        if (!cityRepository.existsById(id)) {
            throw new ResourceNotFoundException("City", "id", id);
        }
        cityRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public long count() {
        return cityRepository.count();
    }
}
