package org.project.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.project.backend.dto.auth.AuthResponse;
import org.project.backend.dto.auth.LoginRequest;
import org.project.backend.dto.auth.RegisterRequest;
import org.project.backend.dto.auth.RefreshTokenRequest;
import org.project.backend.enums.Role;
import org.project.backend.exception.DuplicateResourceException;
import org.project.backend.model.Client;
import org.project.backend.model.RefreshToken;
import org.project.backend.repository.ClientRepository;
import org.project.backend.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Date;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Tests unitaires pour AuthService")
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ClientRepository clientRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private RefreshTokenService refreshTokenService;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private TokenBlacklistService tokenBlacklistService;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private Client testClient;
    private RefreshToken refreshToken;

    @BeforeEach
    void setUp() {
        // Setup RegisterRequest
        registerRequest = RegisterRequest.builder()
                .nom("Test User")
                .email("test@example.com")
                .motDePasse("password123")
                .phone("1234567890")
                .address("123 Test Street")
                .dateNaissance(new Date())
                .build();

        // Setup LoginRequest
        loginRequest = LoginRequest.builder()
                .email("test@example.com")
                .motDePasse("password123")
                .build();

        // Setup test client
        testClient = Client.builder()
                .idUser(1)
                .nom("Test User")
                .email("test@example.com")
                .motDePasse("encodedPassword123")
                .phone("1234567890")
                .address("123 Test Street")
                .role(Role.CLIENT)
                .dateNaissance(new Date())
                .build();

        // Setup refresh token
        refreshToken = RefreshToken.builder()
                .id(1)
                .token("refreshToken123")
                .user(testClient)
                .expiryDate(java.time.LocalDateTime.now().plusDays(7))
                .revoked(false)
                .build();
    }

    @Test
    @DisplayName("Should register user successfully with valid data")
    void testRegisterSuccess() {
        // Arrange
        when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(registerRequest.getMotDePasse()))
                .thenReturn("encodedPassword123");
        when(clientRepository.save(any(Client.class))).thenReturn(testClient);
        when(jwtService.generateToken(testClient)).thenReturn("accessToken123");
        when(refreshTokenService.createRefreshToken(testClient)).thenReturn(refreshToken);

        // Act
        AuthResponse response = authService.register(registerRequest);

        // Assert
        assertNotNull(response);
        assertEquals("test@example.com", response.getEmail());
        assertEquals("Test User", response.getNom());
        assertEquals("accessToken123", response.getAccessToken());
        assertEquals("refreshToken123", response.getRefreshToken());
        assertEquals("Bearer", response.getTokenType());
        assertEquals(1, response.getUserId());
        assertEquals(Role.CLIENT.name(), response.getRole());

        verify(userRepository, times(1)).existsByEmail(registerRequest.getEmail());
        verify(passwordEncoder, times(1)).encode(registerRequest.getMotDePasse());
        verify(clientRepository, times(1)).save(any(Client.class));
        verify(jwtService, times(1)).generateToken(testClient);
        verify(refreshTokenService, times(1)).createRefreshToken(testClient);
    }

    @Test
    @DisplayName("Should throw DuplicateResourceException when email already exists")
    void testRegisterWithDuplicateEmail() {
        // Arrange
        when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(true);

        // Act & Assert
        assertThrows(DuplicateResourceException.class, () -> authService.register(registerRequest));

        verify(userRepository, times(1)).existsByEmail(registerRequest.getEmail());
        verify(clientRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should login user successfully with valid credentials")
    void testLoginSuccess() {
        // Arrange
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getMotDePasse()
                ));
        when(userRepository.findByEmail(loginRequest.getEmail()))
                .thenReturn(Optional.of(testClient));
        when(jwtService.generateToken(testClient)).thenReturn("accessToken123");
        when(refreshTokenService.createRefreshToken(testClient)).thenReturn(refreshToken);

        // Act
        AuthResponse response = authService.login(loginRequest);

        // Assert
        assertNotNull(response);
        assertEquals("test@example.com", response.getEmail());
        assertEquals("Test User", response.getNom());
        assertEquals("accessToken123", response.getAccessToken());
        assertEquals("refreshToken123", response.getRefreshToken());
        assertEquals(1, response.getUserId());

        verify(authenticationManager, times(1))
                .authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(userRepository, times(1)).findByEmail(loginRequest.getEmail());
        verify(jwtService, times(1)).generateToken(testClient);
    }

    @Test
    @DisplayName("Should throw UsernameNotFoundException when user not found on login")
    void testLoginUserNotFound() {
        // Arrange
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getMotDePasse()
                ));
        when(userRepository.findByEmail(loginRequest.getEmail()))
                .thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(UsernameNotFoundException.class, () -> authService.login(loginRequest));

        verify(authenticationManager, times(1))
                .authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(userRepository, times(1)).findByEmail(loginRequest.getEmail());
    }

    @Test
    @DisplayName("Should throw BadCredentialsException when authentication fails")
    void testLoginInvalidCredentials() {
        // Arrange
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Identifiants invalides"));

        // Act & Assert
        assertThrows(BadCredentialsException.class, () -> authService.login(loginRequest));

        verify(authenticationManager, times(1))
                .authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    @DisplayName("Should refresh token successfully with valid refresh token")
    void testRefreshTokenSuccess() {
        // Arrange
        RefreshTokenRequest refreshTokenRequest = RefreshTokenRequest.builder()
                .refreshToken("refreshToken123")
                .build();

        when(refreshTokenService.findByToken("refreshToken123"))
                .thenReturn(Optional.of(refreshToken));
        when(refreshTokenService.verifyExpiration(refreshToken))
                .thenReturn(refreshToken);
        when(jwtService.generateToken(testClient))
                .thenReturn("newAccessToken456");

        // Act
        AuthResponse response = authService.refreshToken(refreshTokenRequest);

        // Assert
        assertNotNull(response);
        assertEquals("newAccessToken456", response.getAccessToken());
        assertEquals("refreshToken123", response.getRefreshToken());
        assertEquals("test@example.com", response.getEmail());

        verify(refreshTokenService, times(1)).findByToken("refreshToken123");
        verify(refreshTokenService, times(1)).verifyExpiration(refreshToken);
        verify(jwtService, times(1)).generateToken(testClient);
    }

    @Test
    @DisplayName("Should throw RuntimeException when refresh token is invalid")
    void testRefreshTokenInvalid() {
        // Arrange
        RefreshTokenRequest refreshTokenRequest = RefreshTokenRequest.builder()
                .refreshToken("invalidRefreshToken")
                .build();

        when(refreshTokenService.findByToken("invalidRefreshToken"))
                .thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> authService.refreshToken(refreshTokenRequest));
        assertEquals("Refresh token invalide", exception.getMessage());

        verify(refreshTokenService, times(1)).findByToken("invalidRefreshToken");
    }

    @Test
    @DisplayName("Should logout user successfully")
    void testLogoutSuccess() {
        // Arrange
        String token = "accessToken123";
        when(userRepository.findByEmail("test@example.com"))
                .thenReturn(Optional.of(testClient));

        // Act
        authService.logout("test@example.com", token);

        // Assert
        verify(userRepository, times(1)).findByEmail("test@example.com");
        verify(tokenBlacklistService, times(1)).blacklistToken(token);
        verify(refreshTokenService, times(1)).deleteByUser(testClient);
    }

    @Test
    @DisplayName("Should throw UsernameNotFoundException when logout user not found")
    void testLogoutUserNotFound() {
        // Arrange
        when(userRepository.findByEmail("nonexistent@example.com"))
                .thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(UsernameNotFoundException.class,
                () -> authService.logout("nonexistent@example.com", "token123"));

        verify(userRepository, times(1)).findByEmail("nonexistent@example.com");
    }
}


