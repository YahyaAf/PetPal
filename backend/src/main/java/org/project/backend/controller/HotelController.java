package org.project.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.project.backend.dto.hotels.HotelRequest;
import org.project.backend.dto.hotels.HotelResponse;
import org.project.backend.service.HotelService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/hotels")
@RequiredArgsConstructor
public class HotelController {

    private final HotelService hotelService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<HotelResponse> create(@Valid @RequestBody HotelRequest hotelRequest) {
        HotelResponse hotelResponse = hotelService.create(hotelRequest);
        return new ResponseEntity<>(hotelResponse, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<HotelResponse> update(@PathVariable Integer id,
                                                @Valid @RequestBody HotelRequest hotelRequest) {
        HotelResponse hotelResponse = hotelService.update(id, hotelRequest);
        return ResponseEntity.ok(hotelResponse);
    }

    @GetMapping("/count")
    @PreAuthorize("permitAll()")
    public ResponseEntity<Map<String, Long>> count() {
        long count = hotelService.count();
        Map<String, Long> response = new HashMap<>();
        response.put("count", count);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/city/{cityId}")
    @PreAuthorize("permitAll()")
    public ResponseEntity<List<HotelResponse>> getByCity(@PathVariable Integer cityId) {
        List<HotelResponse> hotels = hotelService.getByCity(cityId);
        return ResponseEntity.ok(hotels);
    }

    @GetMapping
    @PreAuthorize("permitAll()")
    public ResponseEntity<List<HotelResponse>> getAll() {
        List<HotelResponse> hotels = hotelService.getAll();
        return ResponseEntity.ok(hotels);
    }

    @GetMapping("/{id}")
    @PreAuthorize("permitAll()")
    public ResponseEntity<HotelResponse> getById(@PathVariable Integer id) {
        HotelResponse hotelResponse = hotelService.getById(id);
        return ResponseEntity.ok(hotelResponse);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Integer id) {
        hotelService.delete(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Hotel supprimé avec succès");
        return ResponseEntity.ok(response);
    }
}
