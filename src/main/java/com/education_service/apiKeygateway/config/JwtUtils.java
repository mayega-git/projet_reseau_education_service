package com.education_service.apiKeygateway.config;

import org.springframework.stereotype.Component;

import com.education_service.apiKeygateway.repository.ApikeyRepository;
import com.education_service.apiKeygateway.repository.PermissionRepository;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

import java.security.Key;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import javax.crypto.spec.SecretKeySpec;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.annotation.Value;

@Component
@Slf4j
@RequiredArgsConstructor
public class JwtUtils {

    @Value("${spring.app.secret-key-jwt}")
    private String jwtSecret;

    @Value("${spring.app.expiration-time}")
    private int jwtExpirationMs = 900000;

    private Key key;

    private final ApikeyRepository apikeyRepository;

    private final PermissionRepository permissionRepository;

    private final PasswordEncoder passwordEncoder;

    @PostConstruct
    public void init() {
        this.key = new SecretKeySpec(jwtSecret.getBytes(), "HmacSHA256");
    }

    private String extractClientId(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();
    }

    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

   

    public String generateAccessToken(UUID clientId,Map<String,String> permissions) {

        Map<String, Object> claims = new HashMap<>();
        
        // 🔐 identité technique
        claims.put("client_id", clientId.toString());

        // 🔐 permissions normalisées
        claims.put(
            "permissions",
            permissions.entrySet().stream() 
                .map(entry -> Map.of(
                    "service", entry.getKey(),
                    "scope", entry.getValue()
                ))
                .toList()
            );

        return createToken(claims, clientId.toString());
    }


    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
            .setClaims(claims)
            .setSubject(subject)        // sujet = client
            .setIssuedAt(new Date())
            .setExpiration(
                new Date(System.currentTimeMillis() + 1000 * 60 * 60) // 1h
            )
            .signWith(key, SignatureAlgorithm.HS256)
            .compact();
    }

    public String generateRefreshToken() {
        Map<String, Object> claims = new HashMap<>();
        return createToken(claims, UUID.randomUUID().toString());
    }

    public Boolean validateToken(String token, String clientId) {
        final String extractedClientId = extractClientId(token);
        return (extractedClientId.equals(clientId) && !isTokenExpired(token));
    }

    public Mono<String> generateTokensFirstConnection(String rawApiKey, UUID clientId) {

        log.info("🔐 Génération des tokens pour première connexion - clientId: {}", clientId);

        return apikeyRepository.findByClientId(clientId)
                .switchIfEmpty(Mono.error(new RuntimeException("Client ID introuvable")))
                .flatMap(apikey -> {

                    // 1️⃣ Vérification API key
                    if (!passwordEncoder.matches(rawApiKey, apikey.getApiKey())) {
                        System.out.println("RAWAPIKEY====="+rawApiKey);
                        System.out.println("APIKEY====="+apikey.getApiKey());
                        log.error("❌ API Key invalide pour clientId: {}", clientId);
                        return Mono.error(new RuntimeException("API Key invalide"));
                    }

                    // 2️⃣ Vérification statut
                    if (!"ACTIVE".equals(apikey.getStatus())) {
                        log.error("❌ API Key inactive pour clientId: {}", clientId);
                        return Mono.error(new RuntimeException("API Key inactive"));
                    }

                    // 3️⃣ Charger les permissions (scopes + services)
                    return permissionRepository
                            .findAllByRequestTokenId(apikey.getRequestTokenId())
                            .collectList()
                            .flatMap(permissions -> {

                                if (permissions.isEmpty()) {
                                    return Mono.error(
                                            new RuntimeException("Aucune permission associée à cette API key"));
                                }

                                // 4️⃣ Construire les scopes JWT

                                Map<String, String> scopesMap = permissions.stream()
                                    .collect(Collectors.toMap(
                                        p -> p.getServiceName().name(), 
                                        p -> p.getScope().name(),      
                                        (existing, replacement) -> existing 
                                    ));

                                /*List<String> scopes = permissions.stream()
                                        .map(p -> p.getServiceName().name() + ":" + p.getScope().name())
                                        .toList();*/

                                // 5️⃣ Génération access token avec scopes
                                String accessToken = generateAccessToken(clientId, scopesMap);

                                // 6️⃣ Génération refresh token
                                String refreshToken = generateRefreshToken();

                                // 7️⃣ Sauvegarde refresh token
                                apikey.setRefreshToken(passwordEncoder.encode(refreshToken));
                                apikey.setRefreshTokenCreatedAt(LocalDateTime.now());
                                apikey.setRefreshTokenExpiredAt(LocalDateTime.now().plusDays(3));
                                log.info("✅ Tokens générés avec succès pour clientId: {}", clientId);

                                return apikeyRepository.save(apikey)
                                        .thenReturn(accessToken);
                            });
                })
                .doOnError(e -> log.error("❌ Erreur génération tokens: {}", e.getMessage()));
    }

}