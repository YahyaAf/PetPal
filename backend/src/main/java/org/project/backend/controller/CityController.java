package org.project.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.project.backend.dto.cities.CityRequest;
import org.project.backend.dto.cities.CityResponse;
import org.project.backend.service.CityService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cities")
@RequiredArgsConstructor
public class CityController {

    private final CityService cityService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CityResponse> create(@Valid @RequestBody CityRequest cityRequest) {
        CityResponse cityResponse = cityService.create(cityRequest);
        return new ResponseEntity<>(cityResponse, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CityResponse> update(@PathVariable Integer id,
                                               @Valid @RequestBody CityRequest cityRequest) {
        CityResponse cityResponse = cityService.update(id, cityRequest);
        return ResponseEntity.ok(cityResponse);
    }

    @GetMapping
    @PreAuthorize("permitAll()")
    public ResponseEntity<List<CityResponse>> getAll() {
        List<CityResponse> cities = cityService.getAll();
        return ResponseEntity.ok(cities);
    }

    @GetMapping("/{id}")
    @PreAuthorize("permitAll()")
    public ResponseEntity<CityResponse> getById(@PathVariable Integer id) {
        CityResponse cityResponse = cityService.getById(id);
        return ResponseEntity.ok(cityResponse);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Integer id) {
        cityService.delete(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "City supprimée avec succès");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/count")
    @PreAuthorize("permitAll()")
    public ResponseEntity<Map<String, Long>> count() {
        long count = cityService.count();
        Map<String, Long> response = new HashMap<>();
        response.put("count", count);
        return ResponseEntity.ok(response);
    }
}
