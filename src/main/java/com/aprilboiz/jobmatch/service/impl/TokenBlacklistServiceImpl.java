package com.aprilboiz.jobmatch.service.impl;

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
    
    public TokenBlacklistServiceImpl(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }
    
    @Override
    public void blacklistToken(String token, Duration timeToLive) {
        try {
            String key = BLACKLIST_PREFIX + token;
            redisTemplate.opsForValue().set(key, "blacklisted", timeToLive);
            log.debug("Token blacklisted successfully with TTL: {} seconds", timeToLive.getSeconds());
        } catch (Exception e) {
            log.error("Failed to blacklist token", e);
            throw new RuntimeException("Failed to blacklist token", e);
        }
    }
    
    @Override
    public boolean isTokenBlacklisted(String token) {
        try {
            // Check if specific token is blacklisted
            String key = BLACKLIST_PREFIX + token;
            Boolean tokenBlacklisted = redisTemplate.hasKey(key);
            
            if (Boolean.TRUE.equals(tokenBlacklisted)) {
                return true;
            }
            
            // TODO: Extract username from token and check user-level blacklist
            return false;
            
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
            throw new RuntimeException("Failed to remove token from blacklist", e);
        }
    }

    @Override
    public void clearAllBlacklistedTokens() {
        try {
            Set<String> keys = redisTemplate.keys(BLACKLIST_PREFIX + "*");
            if (keys != null && !keys.isEmpty()) {
                redisTemplate.delete(keys);
                log.debug("Cleared {} blacklisted tokens", keys.size());
            }
        } catch (Exception e) {
            log.error("Failed to clear all blacklisted tokens", e);
            throw new RuntimeException("Failed to clear all blacklisted tokens", e);
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