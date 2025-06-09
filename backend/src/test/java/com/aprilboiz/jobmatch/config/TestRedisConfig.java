package com.aprilboiz.jobmatch.config;

import com.aprilboiz.jobmatch.service.TokenBlacklistService;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;

import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;

@TestConfiguration
public class TestRedisConfig {

    @Bean
    @Primary
    public TokenBlacklistService testTokenBlacklistService() {
        return new InMemoryTokenBlacklistService();
    }

    private static class InMemoryTokenBlacklistService implements TokenBlacklistService {
        private final ConcurrentHashMap<String, Long> blacklistedTokens = new ConcurrentHashMap<>();

        @Override
        public void blacklistToken(String token, Duration timeToLive) {
            long expirationTime = System.currentTimeMillis() + timeToLive.toMillis();
            blacklistedTokens.put(token, expirationTime);
        }

        @Override
        public boolean isTokenBlacklisted(String token) {
            Long expirationTime = blacklistedTokens.get(token);
            if (expirationTime == null) {
                return false;
            }
            
            if (System.currentTimeMillis() > expirationTime) {
                blacklistedTokens.remove(token);
                return false;
            }
            
            return true;
        }

        @Override
        public void removeTokenFromBlacklist(String token) {
            blacklistedTokens.remove(token);
        }

        @Override
        public void clearAllBlacklistedTokens() {
            blacklistedTokens.clear();
        }

        @Override
        public void blacklistAllUserTokens(String username, Duration timeToLive) {
            // For test implementation, store user-level blacklist
            String userKey = "user_blacklisted:" + username;
            blacklistedTokens.put(userKey, System.currentTimeMillis() + timeToLive.toMillis());
        }
    }
} 