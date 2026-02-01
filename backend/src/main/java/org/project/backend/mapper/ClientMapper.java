package org.project.backend.mapper;

import org.project.backend.dto.clients.ClientRequest;
import org.project.backend.dto.clients.ClientResponse;
import org.project.backend.enums.Role;
import org.project.backend.model.Client;
import org.springframework.stereotype.Component;

@Component
public class ClientMapper {

    public Client toEntity(ClientRequest clientRequest) {
        if (clientRequest == null) {
            return null;
        }
        return Client.builder()
                .nom(clientRequest.getNom())
                .email(clientRequest.getEmail())
                .motDePasse(clientRequest.getMotDePasse())
                .role(Role.CLIENT)
                .phone(clientRequest.getPhone())
                .address(clientRequest.getAddress())
                .dateNaissance(clientRequest.getDateNaissance())
                .build();
    }

    public ClientResponse toResponse(Client client) {
        if (client == null) {
            return null;
        }

        return ClientResponse.builder()
                .idUser(client.getIdUser())
                .nom(client.getNom())
                .email(client.getEmail())
                .role(client.getRole())
                .dateCreation(client.getDateCreation())
                .phone(client.getPhone())
                .address(client.getAddress())
                .dateNaissance(client.getDateNaissance())
                .build();
    }

    public void updateEntityFromRequest(Client client, ClientRequest clientRequest) {
        if (client == null || clientRequest == null) {
            return;
        }
        client.setNom(clientRequest.getNom());
        client.setEmail(clientRequest.getEmail());

        if (clientRequest.getMotDePasse() != null && !clientRequest.getMotDePasse().isEmpty()) {
            client.setMotDePasse(clientRequest.getMotDePasse());
        }

        client.setPhone(clientRequest.getPhone());
        client.setAddress(clientRequest.getAddress());
        client.setDateNaissance(clientRequest.getDateNaissance());
    }
}
