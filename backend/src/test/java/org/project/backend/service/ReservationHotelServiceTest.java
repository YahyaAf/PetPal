package org.project.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.project.backend.dto.reservations.ReservationHotelRequest;
import org.project.backend.dto.reservations.ReservationHotelResponse;
import org.project.backend.enums.ReservationHotelStatus;
import org.project.backend.exception.HotelCapacityExceededException;
import org.project.backend.exception.InvalidRequestException;
import org.project.backend.exception.ResourceNotFoundException;
import org.project.backend.mapper.ReservationHotelMapper;
import org.project.backend.model.Hotel;
import org.project.backend.model.ReservationHotel;
import org.project.backend.model.User;
import org.project.backend.repository.HotelRepository;
import org.project.backend.repository.ReservationHotelRepository;
import org.project.backend.repository.UserRepository;
import org.springframework.security.core.Authentication;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Tests unitaires pour ReservationHotelService")
class ReservationHotelServiceTest {

    @Mock
    private ReservationHotelRepository reservationRepository;

    @Mock
    private ReservationHotelMapper reservationMapper;

    @Mock
    private UserRepository userRepository;

    @Mock
    private HotelRepository hotelRepository;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private ReservationHotelService reservationService;

    private User testUser;
    private Hotel testHotel;
    private ReservationHotel testReservation;
    private ReservationHotelRequest reservationRequest;
    private ReservationHotelResponse reservationResponse;

    @BeforeEach
    void setUp() {
        // Setup test user
        testUser = User.builder()
                .idUser(1)
                .email("client@example.com")
                .nom("Test Client")
                .build();

        // Setup test hotel with capacity 2
        testHotel = Hotel.builder()
                .id(1)
                .nom("Hotel Luxe")
                .countOfPlace(2)
                .description("A luxury hotel")
                .build();

        // Setup test reservation
        testReservation = ReservationHotel.builder()
                .idReservation(1)
                .user(testUser)
                .hotel(testHotel)
                .dateDebut(LocalDate.of(2026, 4, 1))
                .dateFin(LocalDate.of(2026, 4, 5))
                .montantTotal(500.0f)
                .status(ReservationHotelStatus.PENDING)
                .build();

        // Setup reservation request
        reservationRequest = ReservationHotelRequest.builder()
                .dateDebut(LocalDate.of(2026, 4, 1))
                .days(4)
                .hotelId(1)
                .build();

        // Setup reservation response
        reservationResponse = ReservationHotelResponse.builder()
                .idReservation(1)
                .dateDebut(LocalDate.of(2026, 4, 1))
                .dateFin(LocalDate.of(2026, 4, 5))
                .montantTotal(500.0)
                .status(ReservationHotelStatus.PENDING.name())
                .build();
    }

    // ───────────────────────────────────────────────────
    //  CREATE RESERVATION TESTS
    // ───────────────────────────────────────────────────

    @Test
    @DisplayName("Should create reservation successfully with available capacity")
    void testCreateReservationSuccess() {
        // Arrange
        when(authentication.getName()).thenReturn("client@example.com");
        when(userRepository.findByEmail("client@example.com")).thenReturn(Optional.of(testUser));
        when(reservationMapper.toEntity(reservationRequest, testUser)).thenReturn(testReservation);
        when(hotelRepository.findById(1)).thenReturn(Optional.of(testHotel));
        when(reservationRepository.countOverlappingActiveReservations(1,
                LocalDate.of(2026, 4, 1),
                LocalDate.of(2026, 4, 5))).thenReturn(0L);
        when(reservationRepository.save(testReservation)).thenReturn(testReservation);
        when(reservationMapper.toResponse(testReservation)).thenReturn(reservationResponse);

        // Act
        ReservationHotelResponse response = reservationService.create(reservationRequest, authentication);

        // Assert
        assertNotNull(response);
        assertEquals(1, response.getIdReservation());
        assertEquals(ReservationHotelStatus.PENDING.name(), response.getStatus());

        verify(userRepository, times(1)).findByEmail("client@example.com");
        verify(hotelRepository, times(1)).findById(1);
        verify(reservationRepository, times(1)).save(testReservation);
    }

    @Test
    @DisplayName("Should throw InvalidRequestException when date is in past")
    void testCreateReservationPastDate() {
        // Arrange
        when(authentication.getName()).thenReturn("client@example.com");
        when(userRepository.findByEmail("client@example.com")).thenReturn(Optional.of(testUser));

        ReservationHotelRequest pastRequest = ReservationHotelRequest.builder()
                .dateDebut(LocalDate.of(2020, 1, 1))
                .days(4)
                .hotelId(1)
                .build();

        // Act & Assert
        assertThrows(InvalidRequestException.class,
                () -> reservationService.create(pastRequest, authentication));

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
                () -> reservationService.create(reservationRequest, authentication));

        verify(userRepository, times(1)).findByEmail("nonexistent@example.com");
    }

    @Test
    @DisplayName("Should throw HotelCapacityExceededException when hotel is full")
    void testCreateReservationCapacityExceeded() {
        // Arrange
        when(authentication.getName()).thenReturn("client@example.com");
        when(userRepository.findByEmail("client@example.com")).thenReturn(Optional.of(testUser));
        when(reservationMapper.toEntity(reservationRequest, testUser)).thenReturn(testReservation);
        when(hotelRepository.findById(1)).thenReturn(Optional.of(testHotel));
        // 2 overlapping reservations, hotel capacity is 2 → full
        when(reservationRepository.countOverlappingActiveReservations(1,
                LocalDate.of(2026, 4, 1),
                LocalDate.of(2026, 4, 5))).thenReturn(2L);
        when(reservationRepository.findActiveReservationsEndingAfter(1, LocalDate.of(2026, 4, 1)))
                .thenReturn(new ArrayList<>());

        // Act & Assert
        assertThrows(HotelCapacityExceededException.class,
                () -> reservationService.create(reservationRequest, authentication));

        verify(hotelRepository, times(1)).findById(1);
    }

    // ───────────────────────────────────────────────────
    //  GET RESERVATION TESTS
    // ───────────────────────────────────────────────────

    @Test
    @DisplayName("Should get reservation by ID successfully")
    void testGetByIdSuccess() {
        // Arrange
        when(reservationRepository.findById(1)).thenReturn(Optional.of(testReservation));
        when(reservationMapper.toResponse(testReservation)).thenReturn(reservationResponse);

        // Act
        ReservationHotelResponse response = reservationService.getById(1);

        // Assert
        assertNotNull(response);
        assertEquals(1, response.getIdReservation());

        verify(reservationRepository, times(1)).findById(1);
        verify(reservationMapper, times(1)).toResponse(testReservation);
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when reservation not found")
    void testGetByIdNotFound() {
        // Arrange
        when(reservationRepository.findById(999)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class,
                () -> reservationService.getById(999));

        verify(reservationRepository, times(1)).findById(999);
    }

    @Test
    @DisplayName("Should get all reservations successfully")
    void testGetAllSuccess() {
        // Arrange
        ReservationHotel reservation2 = ReservationHotel.builder()
                .idReservation(2)
                .status(ReservationHotelStatus.CONFIRMEE)
                .build();

        List<ReservationHotel> reservations = Arrays.asList(testReservation, reservation2);
        when(reservationRepository.findAll()).thenReturn(reservations);
        when(reservationMapper.toResponse(testReservation)).thenReturn(reservationResponse);
        when(reservationMapper.toResponse(reservation2))
                .thenReturn(ReservationHotelResponse.builder()
                        .idReservation(2)
                        .status(ReservationHotelStatus.CONFIRMEE.name())
                        .build());

        // Act
        List<ReservationHotelResponse> responses = reservationService.getAll();

        // Assert
        assertNotNull(responses);
        assertEquals(2, responses.size());

        verify(reservationRepository, times(1)).findAll();
        verify(reservationMapper, times(2)).toResponse(any());
    }

    @Test
    @DisplayName("Should get my reservations successfully")
    void testGetMyReservationsSuccess() {
        // Arrange
        when(authentication.getName()).thenReturn("client@example.com");
        when(userRepository.findByEmail("client@example.com")).thenReturn(Optional.of(testUser));
        when(reservationRepository.findByUserIdUser(1)).thenReturn(Arrays.asList(testReservation));
        when(reservationMapper.toResponse(testReservation)).thenReturn(reservationResponse);

        // Act
        List<ReservationHotelResponse> responses = reservationService.getMyReservations(authentication);

        // Assert
        assertNotNull(responses);
        assertEquals(1, responses.size());

        verify(userRepository, times(1)).findByEmail("client@example.com");
        verify(reservationRepository, times(1)).findByUserIdUser(1);
    }

    @Test
    @DisplayName("Should get reservations by hotel successfully")
    void testGetByHotelSuccess() {
        // Arrange
        when(reservationRepository.findByHotelId(1)).thenReturn(Arrays.asList(testReservation));
        when(reservationMapper.toResponse(testReservation)).thenReturn(reservationResponse);

        // Act
        List<ReservationHotelResponse> responses = reservationService.getByHotel(1);

        // Assert
        assertNotNull(responses);
        assertEquals(1, responses.size());

        verify(reservationRepository, times(1)).findByHotelId(1);
    }

    // ───────────────────────────────────────────────────
    //  CONFIRM RESERVATION TESTS
    // ───────────────────────────────────────────────────

    @Test
    @DisplayName("Should confirm reservation successfully when pending")
    void testConfirmReservationSuccess() {
        // Arrange
        testReservation.setStatus(ReservationHotelStatus.PENDING);
        when(reservationRepository.findById(1)).thenReturn(Optional.of(testReservation));
        when(hotelRepository.findById(1)).thenReturn(Optional.of(testHotel));
        when(reservationRepository.countOverlappingConfirmedExcluding(1,
                LocalDate.of(2026, 4, 1),
                LocalDate.of(2026, 4, 5),
                1)).thenReturn(0L);
        when(reservationRepository.save(testReservation)).thenReturn(testReservation);

        // Act
        reservationService.confirmReservation(1);

        // Assert
        assertEquals(ReservationHotelStatus.CONFIRMEE, testReservation.getStatus());
        verify(reservationRepository, times(1)).findById(1);
        verify(reservationRepository, times(1)).save(testReservation);
    }

    @Test
    @DisplayName("Should not confirm already confirmed reservation")
    void testConfirmReservationAlreadyConfirmed() {
        // Arrange
        testReservation.setStatus(ReservationHotelStatus.CONFIRMEE);
        when(reservationRepository.findById(1)).thenReturn(Optional.of(testReservation));

        // Act
        reservationService.confirmReservation(1);

        // Assert
        assertEquals(ReservationHotelStatus.CONFIRMEE, testReservation.getStatus());
        verify(reservationRepository, times(1)).findById(1);
    }

    @Test
    @DisplayName("Should throw InvalidRequestException when confirming cancelled reservation")
    void testConfirmReservationCancelled() {
        // Arrange
        testReservation.setStatus(ReservationHotelStatus.ANNULEE);
        when(reservationRepository.findById(1)).thenReturn(Optional.of(testReservation));

        // Act & Assert
        assertThrows(InvalidRequestException.class,
                () -> reservationService.confirmReservation(1));

        verify(reservationRepository, times(1)).findById(1);
    }

    @Test
    @DisplayName("Should throw HotelCapacityExceededException when no capacity for confirmation")
    void testConfirmReservationCapacityExceeded() {
        // Arrange
        testReservation.setStatus(ReservationHotelStatus.PENDING);
        when(reservationRepository.findById(1)).thenReturn(Optional.of(testReservation));
        when(hotelRepository.findById(1)).thenReturn(Optional.of(testHotel));
        // 2 confirmed reservations, hotel capacity is 2 → no room
        when(reservationRepository.countOverlappingConfirmedExcluding(1,
                LocalDate.of(2026, 4, 1),
                LocalDate.of(2026, 4, 5),
                1)).thenReturn(2L);

        // Act & Assert
        assertThrows(HotelCapacityExceededException.class,
                () -> reservationService.confirmReservation(1));

        verify(hotelRepository, times(1)).findById(1);
    }

    // ───────────────────────────────────────────────────
    //  CANCEL RESERVATION TESTS
    // ───────────────────────────────────────────────────

    @Test
    @DisplayName("Should cancel pending reservation successfully")
    void testCancelReservationSuccess() {
        // Arrange
        testReservation.setStatus(ReservationHotelStatus.PENDING);
        when(reservationRepository.findById(1)).thenReturn(Optional.of(testReservation));
        when(reservationRepository.save(testReservation)).thenReturn(testReservation);

        // Act
        reservationService.cancelReservation(1);

        // Assert
        assertEquals(ReservationHotelStatus.ANNULEE, testReservation.getStatus());
        verify(reservationRepository, times(1)).findById(1);
        verify(reservationRepository, times(1)).save(testReservation);
    }

    @Test
    @DisplayName("Should throw InvalidRequestException when cancelling confirmed reservation")
    void testCancelConfirmedReservationFails() {
        // Arrange
        testReservation.setStatus(ReservationHotelStatus.CONFIRMEE);
        when(reservationRepository.findById(1)).thenReturn(Optional.of(testReservation));

        // Act & Assert
        assertThrows(InvalidRequestException.class,
                () -> reservationService.cancelReservation(1));

        verify(reservationRepository, times(1)).findById(1);
    }

    @Test
    @DisplayName("Should throw InvalidRequestException when cancelling already cancelled reservation")
    void testCancelAlreadyCancelledReservation() {
        // Arrange
        testReservation.setStatus(ReservationHotelStatus.ANNULEE);
        when(reservationRepository.findById(1)).thenReturn(Optional.of(testReservation));

        // Act & Assert
        assertThrows(InvalidRequestException.class,
                () -> reservationService.cancelReservation(1));

        verify(reservationRepository, times(1)).findById(1);
    }

    @Test
    @DisplayName("Should cancel reservation by system regardless of status")
    void testCancelReservationBySystemSuccess() {
        // Arrange
        testReservation.setStatus(ReservationHotelStatus.PENDING);
        when(reservationRepository.findById(1)).thenReturn(Optional.of(testReservation));
        when(reservationRepository.save(testReservation)).thenReturn(testReservation);

        // Act
        reservationService.cancelReservationBySystem(1);

        // Assert
        assertEquals(ReservationHotelStatus.ANNULEE, testReservation.getStatus());
        verify(reservationRepository, times(1)).findById(1);
        verify(reservationRepository, times(1)).save(testReservation);
    }

    @Test
    @DisplayName("Should not cancel already cancelled reservation by system")
    void testCancelReservationBySystemAlreadyCancelled() {
        // Arrange
        testReservation.setStatus(ReservationHotelStatus.ANNULEE);
        when(reservationRepository.findById(1)).thenReturn(Optional.of(testReservation));

        // Act
        reservationService.cancelReservationBySystem(1);

        // Assert
        assertEquals(ReservationHotelStatus.ANNULEE, testReservation.getStatus());
        verify(reservationRepository, times(1)).findById(1);
        verify(reservationRepository, never()).save(any());
    }

    // ───────────────────────────────────────────────────
    //  DELETE RESERVATION TESTS
    // ───────────────────────────────────────────────────

    @Test
    @DisplayName("Should delete reservation successfully")
    void testDeleteReservationSuccess() {
        // Arrange
        when(reservationRepository.existsById(1)).thenReturn(true);
        doNothing().when(reservationRepository).deleteById(1);

        // Act
        reservationService.delete(1);

        // Assert
        verify(reservationRepository, times(1)).existsById(1);
        verify(reservationRepository, times(1)).deleteById(1);
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when deleting non-existent reservation")
    void testDeleteReservationNotFound() {
        // Arrange
        when(reservationRepository.existsById(999)).thenReturn(false);

        // Act & Assert
        assertThrows(ResourceNotFoundException.class,
                () -> reservationService.delete(999));

        verify(reservationRepository, times(1)).existsById(999);
    }

    // ───────────────────────────────────────────────────
    //  COUNT TESTS
    // ───────────────────────────────────────────────────

    @Test
    @DisplayName("Should count reservations successfully")
    void testCountSuccess() {
        // Arrange
        when(reservationRepository.count()).thenReturn(5L);

        // Act
        long count = reservationService.count();

        // Assert
        assertEquals(5L, count);
        verify(reservationRepository, times(1)).count();
    }

    @Test
    @DisplayName("Should return zero when no reservations exist")
    void testCountEmpty() {
        // Arrange
        when(reservationRepository.count()).thenReturn(0L);

        // Act
        long count = reservationService.count();

        // Assert
        assertEquals(0L, count);
        verify(reservationRepository, times(1)).count();
    }

    // ───────────────────────────────────────────────────
    //  CAPACITY LOGIC TESTS
    // ───────────────────────────────────────────────────

    @Test
    @DisplayName("Should allow reservation when capacity has room")
    void testCapacityValidationWithRoom() {
        // Arrange - Hotel has 2 places, only 1 overlapping
        when(authentication.getName()).thenReturn("client@example.com");
        when(userRepository.findByEmail("client@example.com")).thenReturn(Optional.of(testUser));
        when(reservationMapper.toEntity(reservationRequest, testUser)).thenReturn(testReservation);
        when(hotelRepository.findById(1)).thenReturn(Optional.of(testHotel));
        when(reservationRepository.countOverlappingActiveReservations(1,
                LocalDate.of(2026, 4, 1),
                LocalDate.of(2026, 4, 5))).thenReturn(1L); // 1 overlapping < 2 capacity
        when(reservationRepository.save(testReservation)).thenReturn(testReservation);
        when(reservationMapper.toResponse(testReservation)).thenReturn(reservationResponse);

        // Act
        ReservationHotelResponse response = reservationService.create(reservationRequest, authentication);

        // Assert
        assertNotNull(response);
        verify(reservationRepository, times(1)).save(testReservation);
    }

    @Test
    @DisplayName("Should reject reservation when capacity is exactly full")
    void testCapacityValidationExactlyFull() {
        // Arrange - Hotel has 2 places, 2 overlapping = exactly full
        when(authentication.getName()).thenReturn("client@example.com");
        when(userRepository.findByEmail("client@example.com")).thenReturn(Optional.of(testUser));
        when(reservationMapper.toEntity(reservationRequest, testUser)).thenReturn(testReservation);
        when(hotelRepository.findById(1)).thenReturn(Optional.of(testHotel));
        when(reservationRepository.countOverlappingActiveReservations(1,
                LocalDate.of(2026, 4, 1),
                LocalDate.of(2026, 4, 5))).thenReturn(2L); // 2 overlapping >= 2 capacity
        when(reservationRepository.findActiveReservationsEndingAfter(1, LocalDate.of(2026, 4, 1)))
                .thenReturn(new ArrayList<>());

        // Act & Assert
        assertThrows(HotelCapacityExceededException.class,
                () -> reservationService.create(reservationRequest, authentication));
    }
}



