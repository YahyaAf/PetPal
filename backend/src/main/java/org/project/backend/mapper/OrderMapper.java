package org.project.backend.mapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.project.backend.dto.orders.OrderItemResponseDto;
import org.project.backend.dto.orders.OrderResponseDto;
import org.project.backend.model.Client;
import org.project.backend.model.Order;
import org.project.backend.model.OrderItem;
import org.project.backend.model.User;
import org.project.backend.repository.ClientRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderMapper {

    private final ClientRepository clientRepository;

    public OrderItemResponseDto toItemResponseDto(OrderItem item) {
        return OrderItemResponseDto.builder()
                .idOrderItem(item.getIdOrderItem())
                .productId(item.getProduct().getId())
                .productNom(item.getProduct().getNom())
                .quantite(item.getQuantite())
                .prixUnitaire(item.getPrixUnitaire())
                .sousTotal(item.getPrixUnitaire() * item.getQuantite())
                .build();
    }

    public OrderResponseDto toResponseDto(Order order) {
        List<OrderItemResponseDto> items = order.getOrderItems().stream()
                .map(this::toItemResponseDto)
                .collect(Collectors.toList());

        User user = order.getUser();

        // findClientById utilise une JPQL explicite "SELECT c FROM Client c WHERE c.idUser = :id"
        // ce qui force JPA à chercher dans la table clients, évitant le problème de proxy
        Optional<Client> clientOpt = clientRepository.findClientById(user.getIdUser());
        if (clientOpt.isEmpty()) {
            log.warn("User #{} ({}) n'est pas trouvé dans la table clients — phone/address seront null",
                    user.getIdUser(), user.getEmail());
        }
        String phone   = clientOpt.map(Client::getPhone).orElse(null);
        String address = clientOpt.map(Client::getAddress).orElse(null);

        return OrderResponseDto.builder()
                .idOrder(order.getIdOrder())
                .total(order.getTotal())
                .dateOrder(order.getDateOrder())
                .status(order.getStatus())
                .userId(user.getIdUser())
                .userNom(user.getNom())
                .userEmail(user.getEmail())
                .userPhone(phone)
                .userAddress(address)
                .items(items)
                .build();
    }
}





