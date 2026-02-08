package org.project.backend.config;

import lombok.RequiredArgsConstructor;
import org.project.backend.service.TokenBlacklistService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ScheduledTasks {

    private final TokenBlacklistService tokenBlacklistService;

    // Nettoyer les tokens expirés chaque jour à 2h du matin
    @Scheduled(cron = "0 0 2 * * ?")
    public void cleanupExpiredTokens() {
        tokenBlacklistService.cleanupExpiredTokens();
    }
}
