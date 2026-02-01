package org.project.backend.service;

import lombok.RequiredArgsConstructor;
import org.project.backend.dto.clients.ClientRequest;
import org.project.backend.dto.clients.ClientResponse;
import org.project.backend.exception.DuplicateResourceException;
import org.project.backend.exception.ResourceNotFoundException;
import org.project.backend.mapper.ClientMapper;
import org.project.backend.model.Client;
import org.project.backend.repository.ClientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClientService {

    private final ClientRepository clientRepository;
    private final ClientMapper clientMapper;

    @Transactional
    public ClientResponse create(ClientRequest clientRequest) {
        if (clientRepository.existsByEmail(clientRequest.getEmail())) {
            throw new DuplicateResourceException("Client", "email", clientRequest.getEmail());
        }

        Client client = clientMapper.toEntity(clientRequest);
        Client savedClient = clientRepository.save(client);
        return clientMapper.toResponse(savedClient);
    }

    @Transactional
    public ClientResponse update(Integer id, ClientRequest clientRequest) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Client", "id", id));

        if (!client.getEmail().equals(clientRequest.getEmail()) &&
                clientRepository.existsByEmail(clientRequest.getEmail())) {
            throw new DuplicateResourceException("Client", "email", clientRequest.getEmail());
        }

        clientMapper.updateEntityFromRequest(client, clientRequest);
        Client updatedClient = clientRepository.save(client);
        return clientMapper.toResponse(updatedClient);
    }

    @Transactional(readOnly = true)
    public List<ClientResponse> getAll() {
        return clientRepository.findAll()
                .stream()
                .map(clientMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ClientResponse getById(Integer id) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Client", "id", id));
        return clientMapper.toResponse(client);
    }

    @Transactional
    public void delete(Integer id) {
        if (!clientRepository.existsById(id)) {
            throw new ResourceNotFoundException("Client", "id", id);
        }
        clientRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public long count() {
        return clientRepository.count();
    }
}
