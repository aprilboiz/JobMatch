package com.aprilboiz.jobmatch.service;

import java.time.Duration;

public interface TokenBlacklistService {
    void blacklistToken(String token, Duration timeToLive);
    boolean isTokenBlacklisted(String token);
    void removeTokenFromBlacklist(String token);
    void clearAllBlacklistedTokens();
    void blacklistAllUserTokens(String username, Duration timeToLive);
} 