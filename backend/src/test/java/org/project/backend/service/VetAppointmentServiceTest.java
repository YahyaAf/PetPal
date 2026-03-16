package org.project.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.project.backend.dto.vetappointments.VetAppointmentRequest;
import org.project.backend.dto.vetappointments.VetAppointmentResponse;
import org.project.backend.enums.VetAppointmentStatus;
import org.project.backend.exception.DuplicateResourceException;
import org.project.backend.exception.InvalidRequestException;
import org.project.backend.exception.ResourceNotFoundException;
import org.project.backend.mapper.VetAppointmentMapper;
import org.project.backend.model.User;
import org.project.backend.model.VetAppointment;
import org.project.backend.repository.UserRepository;
import org.project.backend.repository.VetAppointmentRepository;
import org.springframework.security.core.Authentication;

import java.time.LocalDateTime;
import java.time.DayOfWeek;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Tests unitaires pour VetAppointmentService")
class VetAppointmentServiceTest {

    @Mock
    private VetAppointmentRepository vetAppointmentRepository;

    @Mock
    private VetAppointmentMapper vetAppointmentMapper;

    @Mock
    private UserRepository userRepository;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private VetAppointmentService vetAppointmentService;

    private User testUser;
    private VetAppointment testAppointment;
    private VetAppointmentResponse appointmentResponse;
    private LocalDateTime validDateTime;

    @BeforeEach
    void setUp() {
        // Setup test user
        testUser = User.builder()
                .idUser(1)
                .email("client@example.com")
                .nom("Test Client")
                .build();

        // Setup valid datetime - tomorrow at 10:00 (weekday)
        validDateTime = LocalDateTime.now().plusDays(1).withHour(10).withMinute(0).withSecond(0).withNano(0);
        // Make sure it's a weekday
        while (validDateTime.getDayOfWeek() == DayOfWeek.SATURDAY ||
               validDateTime.getDayOfWeek() == DayOfWeek.SUNDAY) {
            validDateTime = validDateTime.plusDays(1);
        }

        // Setup test appointment
        testAppointment = VetAppointment.builder()
                .id(1)
                .user(testUser)
                .service("Vaccination")
                .dateHeure(validDateTime)
                .dateHeureFin(validDateTime.plusHours(1))
                .status(VetAppointmentStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        // Setup appointment response
        appointmentResponse = VetAppointmentResponse.builder()
                .id(1)
                .service("Vaccination")
                .dateHeure(validDateTime)
                .dateHeureFin(validDateTime.plusHours(1))
                .status(VetAppointmentStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();
    }

    // ───────────────────────────────────────────────────
    //  CREATE APPOINTMENT TESTS
    // ───────────────────────────────────────────────────

    @Test
    @DisplayName("Should create vet appointment successfully")
    void testCreateAppointmentSuccess() {
        // Arrange
        VetAppointmentRequest request = VetAppointmentRequest.builder()
                .dateHeure(validDateTime.toString())
                .service("Vaccination")
                .build();

        when(authentication.getName()).thenReturn("client@example.com");
        when(userRepository.findByEmail("client@example.com")).thenReturn(Optional.of(testUser));
        when(vetAppointmentRepository.countOverlapping(any(), any())).thenReturn(0L);
        when(vetAppointmentRepository.save(any(VetAppointment.class))).thenReturn(testAppointment);
        when(vetAppointmentMapper.toResponse(testAppointment)).thenReturn(appointmentResponse);

        // Act
        VetAppointmentResponse response = vetAppointmentService.create(request, authentication);

        // Assert
        assertNotNull(response);
        assertEquals(1, response.getId());
        assertEquals("Vaccination", response.getService());
        assertEquals(VetAppointmentStatus.PENDING, response.getStatus());

        verify(userRepository, times(1)).findByEmail("client@example.com");
        verify(vetAppointmentRepository, times(1)).countOverlapping(any(), any());
        verify(vetAppointmentRepository, times(1)).save(any(VetAppointment.class));
    }

    @Test
    @DisplayName("Should throw InvalidRequestException when date is in past")
    void testCreateAppointmentPastDate() {
        // Arrange
        LocalDateTime pastDate = LocalDateTime.now().minusDays(1);
        VetAppointmentRequest request = VetAppointmentRequest.builder()
                .dateHeure(pastDate.toString())
                .service("Vaccination")
                .build();

        when(authentication.getName()).thenReturn("client@example.com");
        when(userRepository.findByEmail("client@example.com")).thenReturn(Optional.of(testUser));

        // Act & Assert
        assertThrows(InvalidRequestException.class,
                () -> vetAppointmentService.create(request, authentication));

        verify(userRepository, times(1)).findByEmail("client@example.com");
    }

    @Test
    @DisplayName("Should throw InvalidRequestException when date has non-zero minutes")
    void testCreateAppointmentNonZeroMinutes() {
        // Arrange
        LocalDateTime dateWithMinutes = validDateTime.withMinute(30);
        VetAppointmentRequest request = VetAppointmentRequest.builder()
                .dateHeure(dateWithMinutes.toString())
                .service("Vaccination")
                .build();

        when(authentication.getName()).thenReturn("client@example.com");
        when(userRepository.findByEmail("client@example.com")).thenReturn(Optional.of(testUser));

        // Act & Assert
        assertThrows(InvalidRequestException.class,
                () -> vetAppointmentService.create(request, authentication));
    }

    @Test
    @DisplayName("Should throw InvalidRequestException when date is weekend")
    void testCreateAppointmentWeekend() {
        // Arrange
        LocalDateTime saturdayDate = LocalDateTime.now().with(DayOfWeek.SATURDAY).withHour(10).withMinute(0).withSecond(0);
        VetAppointmentRequest request = VetAppointmentRequest.builder()
                .dateHeure(saturdayDate.toString())
                .service("Vaccination")
                .build();

        when(authentication.getName()).thenReturn("client@example.com");
        when(userRepository.findByEmail("client@example.com")).thenReturn(Optional.of(testUser));

        // Act & Assert
        assertThrows(InvalidRequestException.class,
                () -> vetAppointmentService.create(request, authentication));
    }

    @Test
    @DisplayName("Should throw InvalidRequestException when invalid date format")
    void testCreateAppointmentInvalidFormat() {
        // Arrange
        VetAppointmentRequest request = VetAppointmentRequest.builder()
                .dateHeure("invalid-date")
                .service("Vaccination")
                .build();

        when(authentication.getName()).thenReturn("client@example.com");
        when(userRepository.findByEmail("client@example.com")).thenReturn(Optional.of(testUser));

        // Act & Assert
        assertThrows(InvalidRequestException.class,
                () -> vetAppointmentService.create(request, authentication));
    }

    @Test
    @DisplayName("Should throw DuplicateResourceException when time slot taken")
    void testCreateAppointmentSlotTaken() {
        // Arrange
        VetAppointmentRequest request = VetAppointmentRequest.builder()
                .dateHeure(validDateTime.toString())
                .service("Vaccination")
                .build();

        when(authentication.getName()).thenReturn("client@example.com");
        when(userRepository.findByEmail("client@example.com")).thenReturn(Optional.of(testUser));
        when(vetAppointmentRepository.countOverlapping(any(), any())).thenReturn(1L); // Slot taken

        // Act & Assert
        assertThrows(DuplicateResourceException.class,
                () -> vetAppointmentService.create(request, authentication));

        verify(vetAppointmentRepository, times(1)).countOverlapping(any(), any());
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when user not found")
    void testCreateAppointmentUserNotFound() {
        // Arrange
        VetAppointmentRequest request = VetAppointmentRequest.builder()
                .dateHeure(validDateTime.toString())
                .service("Vaccination")
                .build();

        when(authentication.getName()).thenReturn("nonexistent@example.com");
        when(userRepository.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class,
                () -> vetAppointmentService.create(request, authentication));

        verify(userRepository, times(1)).findByEmail("nonexistent@example.com");
    }

    // ───────────────────────────────────────────────────
    //  GET APPOINTMENT TESTS
    // ───────────────────────────────────────────────────

    @Test
    @DisplayName("Should get appointment by ID successfully")
    void testGetByIdSuccess() {
        // Arrange
        when(vetAppointmentRepository.findById(1)).thenReturn(Optional.of(testAppointment));
        when(vetAppointmentMapper.toResponse(testAppointment)).thenReturn(appointmentResponse);

        // Act
        VetAppointmentResponse response = vetAppointmentService.getById(1);

        // Assert
        assertNotNull(response);
        assertEquals(1, response.getId());

        verify(vetAppointmentRepository, times(1)).findById(1);
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when appointment not found")
    void testGetByIdNotFound() {
        // Arrange
        when(vetAppointmentRepository.findById(999)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class,
                () -> vetAppointmentService.getById(999));

        verify(vetAppointmentRepository, times(1)).findById(999);
    }

    @Test
    @DisplayName("Should get all appointments successfully")
    void testGetAllSuccess() {
        // Arrange
        when(vetAppointmentRepository.findAll()).thenReturn(Arrays.asList(testAppointment));
        when(vetAppointmentMapper.toResponse(testAppointment)).thenReturn(appointmentResponse);

        // Act
        List<VetAppointmentResponse> responses = vetAppointmentService.getAll();

        // Assert
        assertNotNull(responses);
        assertEquals(1, responses.size());

        verify(vetAppointmentRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Should get my appointments successfully")
    void testGetMyAppointmentsSuccess() {
        // Arrange
        when(authentication.getName()).thenReturn("client@example.com");
        when(userRepository.findByEmail("client@example.com")).thenReturn(Optional.of(testUser));
        when(vetAppointmentRepository.findByUser(testUser)).thenReturn(Arrays.asList(testAppointment));
        when(vetAppointmentMapper.toResponse(testAppointment)).thenReturn(appointmentResponse);

        // Act
        List<VetAppointmentResponse> responses = vetAppointmentService.getMyAppointments(authentication);

        // Assert
        assertNotNull(responses);
        assertEquals(1, responses.size());

        verify(userRepository, times(1)).findByEmail("client@example.com");
        verify(vetAppointmentRepository, times(1)).findByUser(testUser);
    }

    // ───────────────────────────────────────────────────
    //  UPDATE STATUS TESTS
    // ───────────────────────────────────────────────────

    @Test
    @DisplayName("Should update status to CONFIRMED successfully")
    void testUpdateStatusSuccess() {
        // Arrange
        testAppointment.setStatus(VetAppointmentStatus.PENDING);
        when(vetAppointmentRepository.findById(1)).thenReturn(Optional.of(testAppointment));
        when(vetAppointmentRepository.save(testAppointment)).thenReturn(testAppointment);
        when(vetAppointmentMapper.toResponse(testAppointment)).thenReturn(appointmentResponse);

        // Act
        VetAppointmentResponse response = vetAppointmentService.updateStatus(1, VetAppointmentStatus.CONFIRMED);

        // Assert
        assertEquals(VetAppointmentStatus.CONFIRMED, testAppointment.getStatus());
        verify(vetAppointmentRepository, times(1)).findById(1);
        verify(vetAppointmentRepository, times(1)).save(testAppointment);
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when updating non-existent appointment")
    void testUpdateStatusNotFound() {
        // Arrange
        when(vetAppointmentRepository.findById(999)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class,
                () -> vetAppointmentService.updateStatus(999, VetAppointmentStatus.CONFIRMED));

        verify(vetAppointmentRepository, times(1)).findById(999);
    }

    // ───────────────────────────────────────────────────
    //  DELETE TESTS
    // ───────────────────────────────────────────────────

    @Test
    @DisplayName("Should delete appointment successfully")
    void testDeleteSuccess() {
        // Arrange
        when(vetAppointmentRepository.existsById(1)).thenReturn(true);
        doNothing().when(vetAppointmentRepository).deleteById(1);

        // Act
        vetAppointmentService.delete(1);

        // Assert
        verify(vetAppointmentRepository, times(1)).existsById(1);
        verify(vetAppointmentRepository, times(1)).deleteById(1);
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when deleting non-existent appointment")
    void testDeleteNotFound() {
        // Arrange
        when(vetAppointmentRepository.existsById(999)).thenReturn(false);

        // Act & Assert
        assertThrows(ResourceNotFoundException.class,
                () -> vetAppointmentService.delete(999));

        verify(vetAppointmentRepository, times(1)).existsById(999);
    }

    // ───────────────────────────────────────────────────
    //  COUNT TESTS
    // ───────────────────────────────────────────────────

    @Test
    @DisplayName("Should count appointments successfully")
    void testCountSuccess() {
        // Arrange
        when(vetAppointmentRepository.count()).thenReturn(5L);

        // Act
        long count = vetAppointmentService.count();

        // Assert
        assertEquals(5L, count);
        verify(vetAppointmentRepository, times(1)).count();
    }

    @Test
    @DisplayName("Should return zero when no appointments exist")
    void testCountEmpty() {
        // Arrange
        when(vetAppointmentRepository.count()).thenReturn(0L);

        // Act
        long count = vetAppointmentService.count();

        // Assert
        assertEquals(0L, count);
        verify(vetAppointmentRepository, times(1)).count();
    }

    // ───────────────────────────────────────────────────
    //  BUSINESS LOGIC TESTS
    // ───────────────────────────────────────────────────

    @Test
    @DisplayName("Should set appointment duration to 1 hour")
    void testAppointmentDurationOneHour() {
        // Arrange
        VetAppointmentRequest request = VetAppointmentRequest.builder()
                .dateHeure(validDateTime.toString())
                .service("Vaccination")
                .build();

        when(authentication.getName()).thenReturn("client@example.com");
        when(userRepository.findByEmail("client@example.com")).thenReturn(Optional.of(testUser));
        when(vetAppointmentRepository.countOverlapping(any(), any())).thenReturn(0L);
        when(vetAppointmentRepository.save(any(VetAppointment.class)))
                .thenAnswer(invocation -> {
                    VetAppointment app = invocation.getArgument(0);
                    assertEquals(app.getDateHeureFin(), app.getDateHeure().plusHours(1));
                    return app;
                });

        // Act
        vetAppointmentService.create(request, authentication);

        // Assert
        verify(vetAppointmentRepository, times(1)).save(any(VetAppointment.class));
    }

    @Test
    @DisplayName("Should initialize appointment with PENDING status")
    void testAppointmentInitialStatus() {
        // Arrange
        VetAppointmentRequest request = VetAppointmentRequest.builder()
                .dateHeure(validDateTime.toString())
                .service("Vaccination")
                .build();

        when(authentication.getName()).thenReturn("client@example.com");
        when(userRepository.findByEmail("client@example.com")).thenReturn(Optional.of(testUser));
        when(vetAppointmentRepository.countOverlapping(any(), any())).thenReturn(0L);
        when(vetAppointmentRepository.save(any(VetAppointment.class)))
                .thenAnswer(invocation -> {
                    VetAppointment app = invocation.getArgument(0);
                    assertEquals(VetAppointmentStatus.PENDING, app.getStatus());
                    return app;
                });

        // Act
        vetAppointmentService.create(request, authentication);

        // Assert
        verify(vetAppointmentRepository, times(1)).save(any(VetAppointment.class));
    }
}







