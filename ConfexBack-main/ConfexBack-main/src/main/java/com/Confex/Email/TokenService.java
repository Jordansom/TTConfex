package com.Confex.Email;

import com.Confex.Excepciones.TokenExpiredException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.cache.annotation.CacheConfig;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
@CacheConfig(cacheNames = "tokensCache")
public class TokenService {
    
    private static final String DIGITS = "0123456789";
    private static final SecureRandom RANDOM = new SecureRandom();
    
    private final Map<String, TokenInfo> emailToTokenCache = new ConcurrentHashMap<>();
    
    private static class TokenInfo {
        String token;
        LocalDateTime createdAt;
        TokenInfo(String token) {
            this.token = token;
            this.createdAt = LocalDateTime.now();
        }
        boolean isExpired() {
            return LocalDateTime.now().isAfter(createdAt.plusMinutes(5));
        }
    }
    
    public String generateToken() {
        StringBuilder sb = new StringBuilder(6);
        for (int i = 0; i < 6; i++) {
            sb.append(DIGITS.charAt(RANDOM.nextInt(DIGITS.length())));
        }
        return sb.toString();
    }
    
    @CachePut(key = "#email")
    public String storeToken(String email, String token) {
        emailToTokenCache.put(email, new TokenInfo(token));
        return token;
    }
    
    public String getToken(String email) {
    TokenInfo tokenInfo = emailToTokenCache.get(email);

    if (tokenInfo != null) {
        if (tokenInfo.isExpired()) {
            removeToken(email);
            throw new TokenExpiredException("El token ha expirado para el correo: " + email);
        }
        return tokenInfo.token;
    }
    return null;
}
    
    @CacheEvict(key = "#email")
    public void removeToken(String email) {
        emailToTokenCache.remove(email);
    }
    
    public boolean validateToken(String email, String token) {
        TokenInfo tokenInfo = emailToTokenCache.get(email);
        if (tokenInfo == null) {
            throw new TokenExpiredException("El token ha expirado o no existe para el correo: " + email);
        }
        if (tokenInfo.isExpired()) {
            removeToken(email);
            throw new TokenExpiredException("El token ha expirado para el correo: " + email);
        }
        return tokenInfo.token.equals(token);
    }
    
    @Scheduled(fixedRate = 600000)
    public void cleanupExpiredTokens() {
        emailToTokenCache.entrySet().removeIf(entry -> entry.getValue().isExpired());
    }
}
