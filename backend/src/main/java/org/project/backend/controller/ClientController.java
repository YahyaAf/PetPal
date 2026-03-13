package org.project.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.project.backend.dto.clients.ClientRequest;
import org.project.backend.dto.clients.ClientResponse;
import org.project.backend.service.ClientService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/clients")
@RequiredArgsConstructor
public class ClientController {

    private final ClientService clientService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ClientResponse> create(@Valid @RequestBody ClientRequest clientRequest) {
        ClientResponse clientResponse = clientService.create(clientRequest);
        return new ResponseEntity<>(clientResponse, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ClientResponse> update(@PathVariable Integer id,
                                                 @Valid @RequestBody ClientRequest clientRequest) {
        ClientResponse clientResponse = clientService.update(id, clientRequest);
        return ResponseEntity.ok(clientResponse);
    }

    @GetMapping("/count")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Long>> count() {
        long count = clientService.count();
        Map<String, Long> response = new HashMap<>();
        response.put("count", count);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ClientResponse>> getAll() {
        List<ClientResponse> clients = clientService.getAll();
        return ResponseEntity.ok(clients);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ClientResponse> getById(@PathVariable Integer id) {
        ClientResponse clientResponse = clientService.getById(id);
        return ResponseEntity.ok(clientResponse);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Integer id) {
        clientService.delete(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Client supprimé avec succès");
        return ResponseEntity.ok(response);
    }
}
