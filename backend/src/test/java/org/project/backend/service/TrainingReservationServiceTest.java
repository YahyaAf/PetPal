package org.project.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Tests unitaires pour TrainingReservationService")
class TrainingReservationServiceTest {

    @Mock
    private TrainingReservationRepository trainingReservationRepository;

    @Mock
    private TrainingReservationMapper trainingReservationMapper;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TrainingTypeRepository trainingTypeRepository;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private TrainingReservationService trainingReservationService;

    private User testClient;
    private User testDresseur;
    private TrainingType testTrainingType;
    private TrainingReservation testReservation;
    private TrainingReservationRequest reservationRequest;
    private TrainingReservationResponse reservationResponse;

    @BeforeEach
    void setUp() {
        // Setup test client
        testClient = User.builder()
                .idUser(1)
                .email("client@example.com")
                .nom("Test Client")
                .build();

        // Setup test dresseur
        testDresseur = User.builder()
                .idUser(2)
                .email("dresseur@example.com")
                .nom("Test Dresseur")
                .build();

        // Setup test training type (5 days duration, 500 price)
        testTrainingType = TrainingType.builder()
                .idType(1)
                .nom("Obéissance Basic")
                .duree(5)
                .prix(500.0)
                .build();

        // Setup test reservation
        testReservation = TrainingReservation.builder()
                .idReservation(1)
                .client(testClient)
                .dresseur(testDresseur)
                .trainingType(testTrainingType)
                .dateDebut(LocalDate.of(2026, 4, 1))
                .dateFin(LocalDate.of(2026, 4, 5))
                .totalPrice(500.0)
                .status(TrainingReservationStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        // Setup reservation request
        reservationRequest = TrainingReservationRequest.builder()
                .dateDebut(LocalDate.of(2026, 4, 1))
                .trainingTypeId(1)
                .build();

        // Setup reservation response
        reservationResponse = TrainingReservationResponse.builder()
                .idReservation(1)
                .dateDebut(LocalDate.of(2026, 4, 1))
                .dateFin(LocalDate.of(2026, 4, 5))
                .totalPrice(500.0)
                .status(TrainingReservationStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();
    }

    // ───────────────────────────────────────────────────
    //  CREATE RESERVATION TESTS
    // ───────────────────────────────────────────────────

    @Test
    @DisplayName("Should create training reservation successfully")
    void testCreateReservationSuccess() {
        // Arrange
        when(authentication.getName()).thenReturn("client@example.com");
        when(userRepository.findByEmail("client@example.com")).thenReturn(Optional.of(testClient));
        when(trainingTypeRepository.findById(1)).thenReturn(Optional.of(testTrainingType));
        when(trainingReservationRepository.findAvailableDresseurs(
                LocalDate.of(2026, 4, 1),
                LocalDate.of(2026, 4, 5)))
                .thenReturn(Arrays.asList(testDresseur));
        when(trainingReservationRepository.save(any(TrainingReservation.class)))
                .thenReturn(testReservation);
        when(trainingReservationMapper.toResponse(testReservation))
                .thenReturn(reservationResponse);

        // Act
        TrainingReservationResponse response = trainingReservationService.create(reservationRequest, authentication);

        // Assert
        assertNotNull(response);
        assertEquals(1, response.getIdReservation());
        assertEquals(500.0, response.getTotalPrice());
        assertEquals(TrainingReservationStatus.PENDING, response.getStatus());

        verify(userRepository, times(1)).findByEmail("client@example.com");
        verify(trainingTypeRepository, times(1)).findById(1);
        verify(trainingReservationRepository, times(1)).save(any(TrainingReservation.class));
    }

    @Test
    @DisplayName("Should throw InvalidRequestException when date is in past")
    void testCreateReservationPastDate() {
        // Arrange
        when(authentication.getName()).thenReturn("client@example.com");
        when(userRepository.findByEmail("client@example.com")).thenReturn(Optional.of(testClient));

        TrainingReservationRequest pastRequest = TrainingReservationRequest.builder()
                .dateDebut(LocalDate.of(2020, 1, 1))
                .trainingTypeId(1)
                .build();

        // Act & Assert
        assertThrows(InvalidRequestException.class,
                () -> trainingReservationService.create(pastRequest, authentication));

        verify(userRepository, times(1)).findByEmail("client@example.com");
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when user not found")
    void testCreateReservationUserNotFound() {
        // Arrange
        when(authentication.getName()).thenReturn("nonexistent@example.com");
        when(userRepository.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class,
                () -> trainingReservationService.create(reservationRequest, authentication));

        verify(userRepository, times(1)).findByEmail("nonexistent@example.com");
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when training type not found")
    void testCreateReservationTrainingTypeNotFound() {
        // Arrange
        when(authentication.getName()).thenReturn("client@example.com");
        when(userRepository.findByEmail("client@example.com")).thenReturn(Optional.of(testClient));
        when(trainingTypeRepository.findById(999)).thenReturn(Optional.empty());

        TrainingReservationRequest invalidRequest = TrainingReservationRequest.builder()
                .dateDebut(LocalDate.of(2026, 4, 1))
                .trainingTypeId(999)
                .build();

        // Act & Assert
        assertThrows(ResourceNotFoundException.class,
                () -> trainingReservationService.create(invalidRequest, authentication));

        verify(trainingTypeRepository, times(1)).findById(999);
    }

    @Test
    @DisplayName("Should throw InvalidRequestException when no dresseur available")
    void testCreateReservationNoDresseurAvailable() {
        // Arrange
        when(authentication.getName()).thenReturn("client@example.com");
        when(userRepository.findByEmail("client@example.com")).thenReturn(Optional.of(testClient));
        when(trainingTypeRepository.findById(1)).thenReturn(Optional.of(testTrainingType));
        when(trainingReservationRepository.findAvailableDresseurs(
                LocalDate.of(2026, 4, 1),
                LocalDate.of(2026, 4, 5)))
                .thenReturn(Collections.emptyList());

        // Act & Assert
        assertThrows(InvalidRequestException.class,
                () -> trainingReservationService.create(reservationRequest, authentication));

        verify(trainingReservationRepository, times(1)).findAvailableDresseurs(any(), any());
    }

    @Test
    @DisplayName("Should calculate correct end date based on training duration")
    void testCreateReservationCalculatesCorrectDates() {
        // Arrange
        TrainingType longTraining = TrainingType.builder()
                .idType(2)
                .nom("Advanced Training")
                .duree(10) // 10 days
                .prix(1000.0)
                .build();

        when(authentication.getName()).thenReturn("client@example.com");
        when(userRepository.findByEmail("client@example.com")).thenReturn(Optional.of(testClient));
        when(trainingTypeRepository.findById(2)).thenReturn(Optional.of(longTraining));
        when(trainingReservationRepository.findAvailableDresseurs(
                LocalDate.of(2026, 4, 1),
                LocalDate.of(2026, 4, 10)))
                .thenReturn(Arrays.asList(testDresseur));
        when(trainingReservationRepository.save(any(TrainingReservation.class)))
                .thenAnswer(invocation -> {
                    TrainingReservation res = invocation.getArgument(0);
                    assertEquals(LocalDate.of(2026, 4, 10), res.getDateFin());
                    return res;
                });

        TrainingReservationRequest longRequest = TrainingReservationRequest.builder()
                .dateDebut(LocalDate.of(2026, 4, 1))
                .trainingTypeId(2)
                .build();

        // Act
        trainingReservationService.create(longRequest, authentication);

        // Assert
        verify(trainingReservationRepository, times(1)).findAvailableDresseurs(
                LocalDate.of(2026, 4, 1),
                LocalDate.of(2026, 4, 10));
    }

    // ───────────────────────────────────────────────────
    //  GET RESERVATION TESTS
    // ───────────────────────────────────────────────────

    @Test
    @DisplayName("Should get reservation by ID successfully")
    void testGetByIdSuccess() {
        // Arrange
        when(trainingReservationRepository.findById(1)).thenReturn(Optional.of(testReservation));
        when(trainingReservationMapper.toResponse(testReservation)).thenReturn(reservationResponse);

        // Act
        TrainingReservationResponse response = trainingReservationService.getById(1);

        // Assert
        assertNotNull(response);
        assertEquals(1, response.getIdReservation());

        verify(trainingReservationRepository, times(1)).findById(1);
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when reservation not found")
    void testGetByIdNotFound() {
        // Arrange
        when(trainingReservationRepository.findById(999)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class,
                () -> trainingReservationService.getById(999));

        verify(trainingReservationRepository, times(1)).findById(999);
    }

    @Test
    @DisplayName("Should get all reservations successfully")
    void testGetAllSuccess() {
        // Arrange
        TrainingReservation reservation2 = TrainingReservation.builder()
                .idReservation(2)
                .status(TrainingReservationStatus.CONFIRMEE)
                .build();

        List<TrainingReservation> reservations = Arrays.asList(testReservation, reservation2);
        when(trainingReservationRepository.findAll()).thenReturn(reservations);
        when(trainingReservationMapper.toResponse(testReservation)).thenReturn(reservationResponse);
        when(trainingReservationMapper.toResponse(reservation2))
                .thenReturn(TrainingReservationResponse.builder()
                        .idReservation(2)
                        .status(TrainingReservationStatus.CONFIRMEE)
                        .build());

        // Act
        List<TrainingReservationResponse> responses = trainingReservationService.getAll();

        // Assert
        assertNotNull(responses);
        assertEquals(2, responses.size());

        verify(trainingReservationRepository, times(1)).findAll();
        verify(trainingReservationMapper, times(2)).toResponse(any());
    }

    @Test
    @DisplayName("Should get my reservations successfully")
    void testGetMyReservationsSuccess() {
        // Arrange
        when(authentication.getName()).thenReturn("client@example.com");
        when(userRepository.findByEmail("client@example.com")).thenReturn(Optional.of(testClient));
        when(trainingReservationRepository.findByClient(testClient))
                .thenReturn(Arrays.asList(testReservation));
        when(trainingReservationMapper.toResponse(testReservation)).thenReturn(reservationResponse);

        // Act
        List<TrainingReservationResponse> responses = trainingReservationService.getMyReservations(authentication);

        // Assert
        assertNotNull(responses);
        assertEquals(1, responses.size());

        verify(userRepository, times(1)).findByEmail("client@example.com");
        verify(trainingReservationRepository, times(1)).findByClient(testClient);
    }

    @Test
    @DisplayName("Should get dresseur reservations successfully")
    void testGetMyDresseurReservationsSuccess() {
        // Arrange
        when(authentication.getName()).thenReturn("dresseur@example.com");
        when(userRepository.findByEmail("dresseur@example.com")).thenReturn(Optional.of(testDresseur));
        when(trainingReservationRepository.findByDresseur(testDresseur))
                .thenReturn(Arrays.asList(testReservation));
        when(trainingReservationMapper.toResponse(testReservation)).thenReturn(reservationResponse);

        // Act
        List<TrainingReservationResponse> responses = trainingReservationService.getMyDresseurReservations(authentication);

        // Assert
        assertNotNull(responses);
        assertEquals(1, responses.size());

        verify(userRepository, times(1)).findByEmail("dresseur@example.com");
        verify(trainingReservationRepository, times(1)).findByDresseur(testDresseur);
    }

    // ───────────────────────────────────────────────────
    //  DELETE RESERVATION TESTS
    // ───────────────────────────────────────────────────

    @Test
    @DisplayName("Should delete reservation successfully")
    void testDeleteReservationSuccess() {
        // Arrange
        when(trainingReservationRepository.existsById(1)).thenReturn(true);
        doNothing().when(trainingReservationRepository).deleteById(1);

        // Act
        trainingReservationService.delete(1);

        // Assert
        verify(trainingReservationRepository, times(1)).existsById(1);
        verify(trainingReservationRepository, times(1)).deleteById(1);
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when deleting non-existent reservation")
    void testDeleteReservationNotFound() {
        // Arrange
        when(trainingReservationRepository.existsById(999)).thenReturn(false);

        // Act & Assert
        assertThrows(ResourceNotFoundException.class,
                () -> trainingReservationService.delete(999));

        verify(trainingReservationRepository, times(1)).existsById(999);
    }

    // ───────────────────────────────────────────────────
    //  COUNT TESTS
    // ───────────────────────────────────────────────────

    @Test
    @DisplayName("Should count reservations successfully")
    void testCountSuccess() {
        // Arrange
        when(trainingReservationRepository.count()).thenReturn(5L);

        // Act
        long count = trainingReservationService.count();

        // Assert
        assertEquals(5L, count);
        verify(trainingReservationRepository, times(1)).count();
    }

    @Test
    @DisplayName("Should return zero when no reservations exist")
    void testCountEmpty() {
        // Arrange
        when(trainingReservationRepository.count()).thenReturn(0L);

        // Act
        long count = trainingReservationService.count();

        // Assert
        assertEquals(0L, count);
        verify(trainingReservationRepository, times(1)).count();
    }

    // ───────────────────────────────────────────────────
    //  UPDATE STATUS TESTS
    // ───────────────────────────────────────────────────

    @Test
    @DisplayName("Should update status to CONFIRMEE successfully")
    void testUpdateStatusSuccess() {
        // Arrange
        testReservation.setStatus(TrainingReservationStatus.PENDING);
        when(trainingReservationRepository.findById(1)).thenReturn(Optional.of(testReservation));
        when(trainingReservationRepository.save(testReservation)).thenReturn(testReservation);

        // Act
        trainingReservationService.updateStatus(1, TrainingReservationStatus.CONFIRMEE);

        // Assert
        assertEquals(TrainingReservationStatus.CONFIRMEE, testReservation.getStatus());
        verify(trainingReservationRepository, times(1)).findById(1);
        verify(trainingReservationRepository, times(1)).save(testReservation);
    }

    @Test
    @DisplayName("Should update status to CANCELLED successfully")
    void testUpdateStatusCancelled() {
        // Arrange
        testReservation.setStatus(TrainingReservationStatus.PENDING);
        when(trainingReservationRepository.findById(1)).thenReturn(Optional.of(testReservation));
        when(trainingReservationRepository.save(testReservation)).thenReturn(testReservation);

        // Act
        trainingReservationService.updateStatus(1, TrainingReservationStatus.ANNULEE);

        // Assert
        assertEquals(TrainingReservationStatus.ANNULEE, testReservation.getStatus());
        verify(trainingReservationRepository, times(1)).findById(1);
        verify(trainingReservationRepository, times(1)).save(testReservation);
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when updating non-existent reservation")
    void testUpdateStatusNotFound() {
        // Arrange
        when(trainingReservationRepository.findById(999)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class,
                () -> trainingReservationService.updateStatus(999, TrainingReservationStatus.CONFIRMEE));

        verify(trainingReservationRepository, times(1)).findById(999);
    }

    // ───────────────────────────────────────────────────
    //  BUSINESS LOGIC TESTS
    // ───────────────────────────────────────────────────

    @Test
    @DisplayName("Should assign first available dresseur")
    void testAssignsFirstAvailableDresseur() {
        // Arrange
        User dresseur2 = User.builder()
                .idUser(3)
                .email("dresseur2@example.com")
                .nom("Dresseur 2")
                .build();

        when(authentication.getName()).thenReturn("client@example.com");
        when(userRepository.findByEmail("client@example.com")).thenReturn(Optional.of(testClient));
        when(trainingTypeRepository.findById(1)).thenReturn(Optional.of(testTrainingType));
        when(trainingReservationRepository.findAvailableDresseurs(
                LocalDate.of(2026, 4, 1),
                LocalDate.of(2026, 4, 5)))
                .thenReturn(Arrays.asList(testDresseur, dresseur2)); // Multiple available
        when(trainingReservationRepository.save(any(TrainingReservation.class)))
                .thenAnswer(invocation -> {
                    TrainingReservation res = invocation.getArgument(0);
                    // Should assign first dresseur
                    assertEquals(testDresseur.getIdUser(), res.getDresseur().getIdUser());
                    return res;
                });

        // Act
        trainingReservationService.create(reservationRequest, authentication);

        // Assert
        verify(trainingReservationRepository, times(1)).save(any(TrainingReservation.class));
    }

    @Test
    @DisplayName("Should use training type price for total price")
    void testUseTrainingTypePriceForTotal() {
        // Arrange
        TrainingType expensiveTraining = TrainingType.builder()
                .idType(3)
                .nom("Elite Training")
                .duree(5)
                .prix(2000.0)
                .build();

        when(authentication.getName()).thenReturn("client@example.com");
        when(userRepository.findByEmail("client@example.com")).thenReturn(Optional.of(testClient));
        when(trainingTypeRepository.findById(3)).thenReturn(Optional.of(expensiveTraining));
        when(trainingReservationRepository.findAvailableDresseurs(any(), any()))
                .thenReturn(Arrays.asList(testDresseur));
        when(trainingReservationRepository.save(any(TrainingReservation.class)))
                .thenAnswer(invocation -> {
                    TrainingReservation res = invocation.getArgument(0);
                    assertEquals(2000.0, res.getTotalPrice());
                    return res;
                });

        TrainingReservationRequest expensiveRequest = TrainingReservationRequest.builder()
                .dateDebut(LocalDate.of(2026, 4, 1))
                .trainingTypeId(3)
                .build();

        // Act
        trainingReservationService.create(expensiveRequest, authentication);

        // Assert
        verify(trainingReservationRepository, times(1)).save(any(TrainingReservation.class));
    }

    @Test
    @DisplayName("Should initialize reservation with PENDING status")
    void testReservationInitialStatus() {
        // Arrange
        when(authentication.getName()).thenReturn("client@example.com");
        when(userRepository.findByEmail("client@example.com")).thenReturn(Optional.of(testClient));
        when(trainingTypeRepository.findById(1)).thenReturn(Optional.of(testTrainingType));
        when(trainingReservationRepository.findAvailableDresseurs(any(), any()))
                .thenReturn(Arrays.asList(testDresseur));
        when(trainingReservationRepository.save(any(TrainingReservation.class)))
                .thenAnswer(invocation -> {
                    TrainingReservation res = invocation.getArgument(0);
                    assertEquals(TrainingReservationStatus.PENDING, res.getStatus());
                    return res;
                });

        // Act
        trainingReservationService.create(reservationRequest, authentication);

        // Assert
        verify(trainingReservationRepository, times(1)).save(any(TrainingReservation.class));
    }
}





