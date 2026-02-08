package org.project.backend.service;

import lombok.RequiredArgsConstructor;
import org.project.backend.dto.hotels.HotelRequest;
import org.project.backend.dto.hotels.HotelResponse;
import org.project.backend.exception.DuplicateResourceException;
import org.project.backend.exception.ResourceNotFoundException;
import org.project.backend.mapper.HotelMapper;
import org.project.backend.model.Hotel;
import org.project.backend.repository.HotelRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HotelService {

    private final HotelRepository hotelRepository;
    private final HotelMapper hotelMapper;

    @Transactional
    public HotelResponse create(HotelRequest hotelRequest) {
        if (hotelRepository.existsByNomAndCityIdCity(hotelRequest.getNom(), hotelRequest.getCityId())) {
            throw new DuplicateResourceException("Hotel", "nom", hotelRequest.getNom() + " dans cette ville");
        }

        Hotel hotel = hotelMapper.toEntity(hotelRequest);
        Hotel savedHotel = hotelRepository.save(hotel);
        return hotelMapper.toResponse(savedHotel);
    }

    @Transactional
    public HotelResponse update(Integer id, HotelRequest hotelRequest) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel", "id", id));

        if (!hotel.getNom().equals(hotelRequest.getNom()) &&
                hotelRepository.existsByNomAndCityIdCity(hotelRequest.getNom(), hotelRequest.getCityId())) {
            throw new DuplicateResourceException("Hotel", "nom", hotelRequest.getNom() + " dans cette ville");
        }

        hotelMapper.updateEntityFromRequest(hotel, hotelRequest);
        Hotel updatedHotel = hotelRepository.save(hotel);
        return hotelMapper.toResponse(updatedHotel);
    }

    @Transactional(readOnly = true)
    public List<HotelResponse> getAll() {
        return hotelRepository.findAll()
                .stream()
                .map(hotelMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public HotelResponse getById(Integer id) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel", "id", id));
        return hotelMapper.toResponse(hotel);
    }

    @Transactional(readOnly = true)
    public List<HotelResponse> getByCity(Integer cityId) {
        return hotelRepository.findByCityIdCity(cityId)
                .stream()
                .map(hotelMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void delete(Integer id) {
        if (!hotelRepository.existsById(id)) {
            throw new ResourceNotFoundException("Hotel", "id", id);
        }
        hotelRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public long count() {
        return hotelRepository.count();
    }
}
