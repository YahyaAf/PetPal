package org.project.backend.service;

import lombok.RequiredArgsConstructor;
import org.project.backend.dto.auth.AuthResponse;
import org.project.backend.dto.auth.LoginRequest;
import org.project.backend.dto.auth.RefreshTokenRequest;
import org.project.backend.dto.auth.RegisterRequest;
import org.project.backend.enums.Role;
import org.project.backend.exception.DuplicateResourceException;
import org.project.backend.model.Client;
import org.project.backend.model.RefreshToken;
import org.project.backend.model.User;
import org.project.backend.repository.ClientRepository;
import org.project.backend.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final ClientRepository clientRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final AuthenticationManager authenticationManager;
    private final TokenBlacklistService tokenBlacklistService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Vérifier si l'email existe déjà
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Client", "email", request.getEmail());
        }

        // Créer un nouveau client
        Client client = Client.builder()
                .nom(request.getNom())
                .email(request.getEmail())
                .motDePasse(passwordEncoder.encode(request.getMotDePasse()))
                .role(Role.CLIENT)
                .phone(request.getPhone())
                .address(request.getAddress())
                .dateNaissance(request.getDateNaissance())
                .build();

        Client savedClient = clientRepository.save(client);

        // Générer les tokens
        String accessToken = jwtService.generateToken(savedClient);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(savedClient);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .tokenType("Bearer")
                .userId(savedClient.getIdUser())
                .email(savedClient.getEmail())
                .nom(savedClient.getNom())
                .role(savedClient.getRole().name())
                .build();
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        // Authentifier l'utilisateur
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getMotDePasse()
                )
        );

        // Récupérer l'utilisateur
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé"));

        // Générer les tokens
        String accessToken = jwtService.generateToken(user);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .tokenType("Bearer")
                .userId(user.getIdUser())
                .email(user.getEmail())
                .nom(user.getNom())
                .role(user.getRole().name())
                .build();
    }

    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        return refreshTokenService.findByToken(request.getRefreshToken())
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    String accessToken = jwtService.generateToken(user);
                    return AuthResponse.builder()
                            .accessToken(accessToken)
                            .refreshToken(request.getRefreshToken())
                            .tokenType("Bearer")
                            .userId(user.getIdUser())
                            .email(user.getEmail())
                            .nom(user.getNom())
                            .role(user.getRole().name())
                            .build();
                })
                .orElseThrow(() -> new RuntimeException("Refresh token invalide"));
    }

    @Transactional
    public void logout(String email, String token) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé"));

        // Ajouter le token à la blacklist
        tokenBlacklistService.blacklistToken(token);

        // Supprimer les refresh tokens
        refreshTokenService.deleteByUser(user);
    }
}
