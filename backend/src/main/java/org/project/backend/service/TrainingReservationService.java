package org.project.backend.service;

import lombok.RequiredArgsConstructor;
import org.project.backend.dto.trainingreservations.TrainingReservationRequest;
import org.project.backend.dto.trainingreservations.TrainingReservationResponse;
import org.project.backend.enums.TrainingReservationStatus;
import org.project.backend.exception.InvalidRequestException;
import org.project.backend.exception.ResourceNotFoundException;
import org.project.backend.mapper.TrainingReservationMapper;
import org.project.backend.model.TrainingReservation;
import org.project.backend.model.TrainingType;
import org.project.backend.model.User;
import org.project.backend.repository.TrainingReservationRepository;
import org.project.backend.repository.TrainingTypeRepository;
import org.project.backend.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrainingReservationService {

    private final TrainingReservationRepository trainingReservationRepository;
    private final TrainingReservationMapper trainingReservationMapper;
    private final UserRepository userRepository;
    private final TrainingTypeRepository trainingTypeRepository;

    @Transactional
    public TrainingReservationResponse create(TrainingReservationRequest request, Authentication authentication) {
        String userEmail = authentication.getName();
        User client = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        if (request.getDateDebut().isBefore(LocalDate.now())) {
            throw new InvalidRequestException("La date de début ne peut pas être dans le passé");
        }

        TrainingType trainingType = trainingTypeRepository.findById(request.getTrainingTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("TrainingType", "id", request.getTrainingTypeId()));

        LocalDate dateFin = request.getDateDebut().plusDays(trainingType.getDuree() - 1);

        List<User> availableDresseurs = trainingReservationRepository.findAvailableDresseurs(
                request.getDateDebut(),
                dateFin
        );

        if (availableDresseurs.isEmpty()) {
            throw new InvalidRequestException("Aucun dresseur disponible pour cette période");
        }

        User dresseur = availableDresseurs.get(0);

        Double totalPrice = trainingType.getPrix();

        TrainingReservation trainingReservation = TrainingReservation.builder()
                .client(client)
                .dresseur(dresseur)
                .trainingType(trainingType)
                .dateDebut(request.getDateDebut())
                .dateFin(dateFin)
                .totalPrice(totalPrice)
                .status(TrainingReservationStatus.PENDING)
                .build();

        TrainingReservation savedReservation = trainingReservationRepository.save(trainingReservation);
        return trainingReservationMapper.toResponse(savedReservation);
    }

    @Transactional(readOnly = true)
    public List<TrainingReservationResponse> getAll() {
        return trainingReservationRepository.findAll()
                .stream()
                .map(trainingReservationMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TrainingReservationResponse getById(Integer id) {
        TrainingReservation reservation = trainingReservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TrainingReservation", "id", id));
        return trainingReservationMapper.toResponse(reservation);
    }

    @Transactional(readOnly = true)
    public List<TrainingReservationResponse> getMyReservations(Authentication authentication) {
        String userEmail = authentication.getName();
        User client = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        return trainingReservationRepository.findByClient(client)
                .stream()
                .map(trainingReservationMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TrainingReservationResponse> getMyDresseurReservations(Authentication authentication) {
        String userEmail = authentication.getName();
        User dresseur = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        return trainingReservationRepository.findByDresseur(dresseur)
                .stream()
                .map(trainingReservationMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void delete(Integer id) {
        if (!trainingReservationRepository.existsById(id)) {
            throw new ResourceNotFoundException("TrainingReservation", "id", id);
        }
        trainingReservationRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public long count() {
        return trainingReservationRepository.count();
    }

    @Transactional
    public void updateStatus(Integer id, TrainingReservationStatus status) {
        TrainingReservation reservation = trainingReservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TrainingReservation", "id", id));
        reservation.setStatus(status);
        trainingReservationRepository.save(reservation);
    }
}

