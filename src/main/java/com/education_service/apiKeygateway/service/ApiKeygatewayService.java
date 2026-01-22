package com.education_service.apiKeygateway.service;

import org.springframework.stereotype.Service;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.UUID;

import com.education_service.apiKeygateway.enums.Status;
import com.education_service.apiKeygateway.models.Apikey;
import com.education_service.apiKeygateway.models.RequestToken;
import com.education_service.apiKeygateway.repository.ApikeyRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@Service
@Slf4j
@RequiredArgsConstructor
public class ApiKeygatewayService {

    private final ApikeyRepository apikeyRepository;

    private final PasswordEncoder passwordEncoder;

    Mono<Apikey> createApiKey(RequestToken requestToken) {

        String rawApiKey = generateSecureKey();


        return Mono.fromCallable(() -> buildApikey(requestToken,rawApiKey))
        .flatMap(apikeyRepository::save) 
        .subscribeOn(Schedulers.boundedElastic())
        .doOnSuccess(a -> {log.info("API key créée, client={}", requestToken.getClientName());})
        .doOnError(e -> log.error("Erreur création API key", e));
        
    }

    public String generateSecureKey() {
        SecureRandom secureRandom = new SecureRandom();
        byte[] keyBytes = new byte[32]; // 256 bits
        secureRandom.nextBytes(keyBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(keyBytes);
    }

    public String hash(String rawKey) {
        return passwordEncoder.encode(rawKey);
    }

    private Apikey buildApikey(RequestToken requestToken,String rawApiKey) {
        String hashedApiKey = hash(rawApiKey);
        
        Apikey apikey = new Apikey();
        apikey.setApiKey(hashedApiKey);
        apikey.setStatus(Status.ACTIVE);
        apikey.setValidityPeriod(30);
        apikey.setRequestTokenId(requestToken.getId());
        
        return apikey;
    }

    public Mono<Void> fowardToNewsLetterService(){
        return Mono.empty();
    }

    public Mono<Apikey> validateApiKey(String rawApiKey,UUID clientId) {
        return apikeyRepository.findByClientId(clientId)
            .filter(apiKey -> passwordEncoder.matches(rawApiKey, apiKey.getApiKey()))
            .switchIfEmpty(Mono.error(new IllegalArgumentException("API key invalide")));
    }

    public Flux<Apikey> findAllApiKey() {
        return apikeyRepository.findAll();
    }

    
}
