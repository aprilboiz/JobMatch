package com.aprilboiz.jobmatch.service.impl;

import com.aprilboiz.jobmatch.service.MessageService;
import com.aprilboiz.jobmatch.service.TokenBlacklistService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Service
@ConditionalOnMissingBean(RedisTemplate.class)
@Slf4j
public class InMemoryTokenBlacklistServiceImpl implements TokenBlacklistService {
    
    private final Map<String, LocalDateTime> blacklistedTokens = new ConcurrentHashMap<>();
    private final ScheduledExecutorService cleanupScheduler = Executors.newSingleThreadScheduledExecutor();
    private final MessageService messageService;
    
    public InMemoryTokenBlacklistServiceImpl(MessageService messageService) {
        this.messageService = messageService;
        // Start cleanup task to remove expired tokens every 5 minutes
        cleanupScheduler.scheduleAtFixedRate(this::cleanupExpiredTokens, 5, 5, TimeUnit.MINUTES);
        log.warn("Using in-memory token blacklist service. Tokens will not persist across application restarts!");
    }
    
    @Override
    public void blacklistToken(String token, Duration timeToLive) {
        try {
            LocalDateTime expiration = LocalDateTime.now().plus(timeToLive);
            blacklistedTokens.put(token, expiration);
            log.debug("Token blacklisted in memory with TTL: {} seconds", timeToLive.getSeconds());
        } catch (Exception e) {
            log.error("Failed to blacklist token in memory", e);
            throw new RuntimeException(messageService.getMessage("token.blacklist.operation.failed", "blacklist"), e);
        }
    }
    
    @Override
    public boolean isTokenBlacklisted(String token) {
        try {
            LocalDateTime expiration = blacklistedTokens.get(token);
            if (expiration == null) {
                return false;
            }
            
            // Check if token has expired
            if (LocalDateTime.now().isAfter(expiration)) {
                blacklistedTokens.remove(token);
                return false;
            }
            
            return true;
        } catch (Exception e) {
            log.error("Failed to check token blacklist status in memory", e);
            return true;
        }
    }
    
    @Override
    public void removeTokenFromBlacklist(String token) {
        try {
            blacklistedTokens.remove(token);
            log.debug("Token removed from in-memory blacklist successfully");
        } catch (Exception e) {
            log.error("Failed to remove token from in-memory blacklist", e);
            throw new RuntimeException(messageService.getMessage("token.blacklist.operation.failed", "remove"), e);
        }
    }

    @Override
    public void clearAllBlacklistedTokens() {
        try {
            int count = blacklistedTokens.size();
            blacklistedTokens.clear();
            log.debug("Cleared {} blacklisted tokens from memory", count);
        } catch (Exception e) {
            log.error("Failed to clear all blacklisted tokens from memory", e);
            throw new RuntimeException(messageService.getMessage("token.blacklist.operation.failed", "clear all"), e);
        }
    }

    @Override
    public void blacklistAllUserTokens(String username, Duration timeToLive) {
        try {
            String userKey = "user_blacklisted:" + username;
            LocalDateTime expiration = LocalDateTime.now().plus(timeToLive);
            blacklistedTokens.put(userKey, expiration);
            log.info("Blacklisted all tokens for user: {} in memory", username);
        } catch (Exception e) {
            log.error("Failed to blacklist all tokens for user: {} in memory", username, e);
        }
    }
    
    private void cleanupExpiredTokens() {
        try {
            LocalDateTime now = LocalDateTime.now();
            blacklistedTokens.entrySet().removeIf(entry -> now.isAfter(entry.getValue()));
            log.debug("Cleaned up expired tokens from in-memory blacklist");
        } catch (Exception e) {
            log.error("Failed to cleanup expired tokens", e);
        }
    }
    
    public void shutdown() {
        cleanupScheduler.shutdown();
    }
} 