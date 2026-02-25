package org.project.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.project.backend.dto.trainings.TrainingTypeRequest;
import org.project.backend.dto.trainings.TrainingTypeResponse;
import org.project.backend.service.TrainingTypeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/training-types")
@RequiredArgsConstructor
public class TrainingTypeController {

    private final TrainingTypeService trainingTypeService;

    @PostMapping
    public ResponseEntity<TrainingTypeResponse> create(@Valid @RequestBody TrainingTypeRequest request) {
        TrainingTypeResponse response = trainingTypeService.create(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TrainingTypeResponse> update(@PathVariable Integer id,
                                                       @Valid @RequestBody TrainingTypeRequest request) {
        TrainingTypeResponse response = trainingTypeService.update(id, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<TrainingTypeResponse>> getAll() {
        List<TrainingTypeResponse> trainingTypes = trainingTypeService.getAll();
        return ResponseEntity.ok(trainingTypes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TrainingTypeResponse> getById(@PathVariable Integer id) {
        TrainingTypeResponse response = trainingTypeService.getById(id);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Integer id) {
        trainingTypeService.delete(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Type de formation supprimé avec succès");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> count() {
        long count = trainingTypeService.count();
        Map<String, Long> response = new HashMap<>();
        response.put("count", count);
        return ResponseEntity.ok(response);
    }
}

