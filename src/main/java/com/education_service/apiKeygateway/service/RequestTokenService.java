package com.education_service.apiKeygateway.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.time.LocalDate;

import org.springframework.stereotype.Service;

import com.education_service.apiKeygateway.dto.RequestTokenDto;
import com.education_service.apiKeygateway.models.Permission;
import com.education_service.apiKeygateway.models.RequestToken;
import com.education_service.apiKeygateway.repository.PermissionRepository;
import com.education_service.apiKeygateway.repository.RequestTokenRepository;

import lombok.RequiredArgsConstructor;

import com.education_service.apiKeygateway.enums.Module;
import com.education_service.apiKeygateway.enums.Scope;
import com.education_service.apiKeygateway.enums.Status;

import java.util.Map;
import java.util.UUID;
import java.time.LocalDateTime;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@Service
@RequiredArgsConstructor
public class RequestTokenService {

    private final PermissionService permissionService;

    private final RequestTokenRepository requestTokenRepository;

    private final ApiKeygatewayService apiKeygatewayService;

    private final int requestLimit = 0;

    public Mono<RequestToken> saveRequestToken(RequestTokenDto requestTokenDto) {
        RequestToken requestToken = new RequestToken();
        requestToken.setClientName(requestTokenDto.getClientName());
        requestToken.setEmail(requestTokenDto.getEmail());
        requestToken.setStatusRequestToken(Status.PENDING);

            return requestTokenRepository.save(requestToken)
                .flatMap(savedRequestToken -> {
                    System.out.println("✅ Requête enregistrée avec succès ! " + savedRequestToken);

                    // Transformer la map en flux de Monos
                    return Flux.fromIterable(requestTokenDto.getServiceNames().entrySet())
                        .flatMap(entry -> {
                            Permission permission = new Permission();
                            permission.setServiceName(entry.getKey());
                            permission.setScope(entry.getValue());
                            permission.setRequestTokenId(savedRequestToken.getId());
                            permission.setRequestLimit(requestLimit);

                            // Retourner le Mono et chaîner correctement
                            return permissionService.savePermission(permission)
                                .doOnSuccess(savedPermission -> 
                                    System.out.println("✅ Permission enregistrée avec succès ! " + savedPermission))
                                .doOnError(error -> 
                                    System.err.println("❌ Erreur permission : " + error.getMessage()));
                        })
                        .then(Mono.just(savedRequestToken)); // attendre que toutes les permissions soient enregistrées
                });
        }


    public Flux<RequestToken> findByStatus(String status) {
        return requestTokenRepository.findByStatus(status);
    }

    public Flux<RequestToken> findAll() {
        return requestTokenRepository.findAll();
    }

    public Mono<Boolean> updateRequestStatus(UUID id, String status) {
        

        return requestTokenRepository
            .updateStatus(id, status, LocalDateTime.now())
            .doOnSubscribe(s -> System.out.println("➡️ Appel repository.updateStatus"))
            .then(
                requestTokenRepository.findById(id)
                    .switchIfEmpty(Mono.error(
                        new IllegalStateException("RequestToken introuvable après UPDATE")
                    ))
                    .doOnNext(rt -> System.out.println("📦 RequestToken récupéré: " + rt.getId()))
                    .flatMap(rt ->
                        apiKeygatewayService.createApiKey(rt)
                            .doOnSuccess(apiKey ->
                                System.out.println("🔑 API Key créée: " + apiKey)
                            )
                    )
                    .thenReturn(true)
            )
        .doOnError(e -> {
            System.err.println("🔥 ERREUR DANS LE FLUX");
            e.printStackTrace();
        });
    }

    public Flux<RequestToken> findAllRequestToken(){
        return requestTokenRepository.findAll();
    }

}
