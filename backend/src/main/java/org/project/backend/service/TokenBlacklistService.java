package org.project.backend.service;

import lombok.RequiredArgsConstructor;
import org.project.backend.model.TokenBlacklist;
import org.project.backend.repository.TokenBlacklistRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;

@Service
@RequiredArgsConstructor
public class TokenBlacklistService {

    private final TokenBlacklistRepository blacklistRepository;
    private final JwtService jwtService;

    @Transactional
    public void blacklistToken(String token) {
        LocalDateTime expiresAt = jwtService.extractExpiration(token)
                .toInstant()
                .atZone(ZoneId.systemDefault())
                .toLocalDateTime();

        TokenBlacklist blacklistedToken = TokenBlacklist.builder()
                .token(token)
                .blacklistedAt(LocalDateTime.now())
                .expiresAt(expiresAt)
                .build();

        blacklistRepository.save(blacklistedToken);
    }

    public boolean isTokenBlacklisted(String token) {
        return blacklistRepository.existsByToken(token);
    }

    @Transactional
    public void cleanupExpiredTokens() {
        blacklistRepository.deleteByExpiresAtBefore(LocalDateTime.now());
    }
}
