package org.project.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.project.backend.dto.vetappointments.VetAppointmentRequest;
import org.project.backend.dto.vetappointments.VetAppointmentResponse;
import org.project.backend.dto.vetappointments.VetAppointmentStatusRequest;
import org.project.backend.service.VetAppointmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vet-appointments")
@RequiredArgsConstructor
public class VetAppointmentController {

    private final VetAppointmentService vetAppointmentService;

    @PostMapping
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<VetAppointmentResponse> create(
            @Valid @RequestBody VetAppointmentRequest request,
            Authentication authentication) {
        VetAppointmentResponse response = vetAppointmentService.create(request, authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'VET')")
    public ResponseEntity<List<VetAppointmentResponse>> getAll() {
        return ResponseEntity.ok(vetAppointmentService.getAll());
    }

    @GetMapping("/count")
    @PreAuthorize("hasAnyRole('ADMIN', 'VET')")
    public ResponseEntity<Map<String, Long>> count() {
        Map<String, Long> response = new HashMap<>();
        response.put("count", vetAppointmentService.count());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my-appointments")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<List<VetAppointmentResponse>> getMyAppointments(Authentication authentication) {
        return ResponseEntity.ok(vetAppointmentService.getMyAppointments(authentication));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'VET')")
    public ResponseEntity<VetAppointmentResponse> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(vetAppointmentService.getById(id));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'VET')")
    public ResponseEntity<VetAppointmentResponse> updateStatus(
            @PathVariable Integer id,
            @Valid @RequestBody VetAppointmentStatusRequest statusRequest) {
        VetAppointmentResponse response = vetAppointmentService.updateStatus(id, statusRequest.getStatus());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'VET')")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Integer id) {
        vetAppointmentService.delete(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Rendez-vous vétérinaire supprimé avec succès");
        return ResponseEntity.ok(response);
    }
}

