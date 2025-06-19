package com.aprilboiz.jobmatch.service.impl;

import com.aprilboiz.jobmatch.service.MessageService;
import com.aprilboiz.jobmatch.service.TokenBlacklistService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Set;

@Service
@Slf4j
public class TokenBlacklistServiceImpl implements TokenBlacklistService {
    
    private static final String BLACKLIST_PREFIX = "blacklisted_token:";
    
    private final RedisTemplate<String, Object> redisTemplate;
    private final MessageService messageService;
    
    public TokenBlacklistServiceImpl(RedisTemplate<String, Object> redisTemplate, MessageService messageService) {
        this.redisTemplate = redisTemplate;
        this.messageService = messageService;
    }
    
    @Override
    public void blacklistToken(String token, Duration timeToLive) {
        try {
            String key = BLACKLIST_PREFIX + token;
            redisTemplate.opsForValue().set(key, "blacklisted", timeToLive);
            log.debug("Token blacklisted successfully with TTL: {} seconds", timeToLive.getSeconds());
        } catch (Exception e) {
            log.error("Failed to blacklist token", e);
            throw new RuntimeException(messageService.getMessage("token.blacklist.operation.failed", "blacklist"), e);
        }
    }
    
    @Override
    public boolean isTokenBlacklisted(String token) {
        try {
            // Check if a specific token is blacklisted
            String key = BLACKLIST_PREFIX + token;

            return redisTemplate.hasKey(key);
            
            // TODO: Extract username from token and check user-level blacklist

        } catch (Exception e) {
            log.error("Failed to check token blacklist status", e);
            return true;
        }
    }
    
    @Override
    public void removeTokenFromBlacklist(String token) {
        try {
            String key = BLACKLIST_PREFIX + token;
            redisTemplate.delete(key);
            log.debug("Token removed from blacklist successfully");
        } catch (Exception e) {
            log.error("Failed to remove token from blacklist", e);
            throw new RuntimeException(messageService.getMessage("token.blacklist.operation.failed", "remove"), e);
        }
    }

    @Override
    public void clearAllBlacklistedTokens() {
        try {
            Set<String> keys = redisTemplate.keys(BLACKLIST_PREFIX + "*");
            if (!keys.isEmpty()) {
                redisTemplate.delete(keys);
                log.debug("Cleared {} blacklisted tokens", keys.size());
            }
        } catch (Exception e) {
            log.error("Failed to clear all blacklisted tokens", e);
            throw new RuntimeException(messageService.getMessage("token.blacklist.operation.failed", "clear all"), e);
        }
    }

    @Override
    public void blacklistAllUserTokens(String username, Duration timeToLive) {
        try {
            String userBlacklistKey = "user_blacklisted:" + username;
            redisTemplate.opsForValue().set(userBlacklistKey, "blacklisted", timeToLive);
            log.info("Blacklisted all tokens for user: {}", username);
        } catch (Exception e) {
            log.error("Failed to blacklist all tokens for user: {}", username, e);
        }
    }
} 