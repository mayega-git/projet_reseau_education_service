package com.education_service.apiKeygateway.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.education_service.apiKeygateway.config.HeaderExtract;
import com.education_service.apiKeygateway.config.JwtUtils;
import com.education_service.apiKeygateway.dto.RequestTokenDto;
import com.education_service.apiKeygateway.models.Apikey;
import com.education_service.apiKeygateway.models.RequestToken;
import com.education_service.apiKeygateway.service.ApiKeygatewayService;
import com.education_service.apiKeygateway.service.PermissionService;
import com.education_service.apiKeygateway.service.RequestTokenService;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.List;
import java.util.UUID;

import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

@RestController
@RequestMapping("/apikeygateway/apikey")
@RequiredArgsConstructor
public class ApiKeyRestController {

    private final RequestTokenService requestTokenService;

    private final ApiKeygatewayService apiKeyGatewayService;

    private final PermissionService permissionService;

    private final HeaderExtract headerExtract;

    private final JwtUtils jwtUtils;

    @GetMapping("/request/token/{status}")
    public Flux<RequestToken> adminPage(@PathVariable String status) {
        return requestTokenService.findByStatus(status);
    }

    @GetMapping("/allrequest/token")
    public Flux<RequestToken> getAllRequestToken(){
        return requestTokenService.findAllRequestToken();
    }

    @GetMapping
    public Flux<Apikey> getAllApiKey(){
        return apiKeyGatewayService.findAllApiKey();
    }
    

    @GetMapping("/request/token/submitted")
    public Flux<RequestToken> adminPage() {
        return requestTokenService.findAll();
    }

    @PatchMapping("/request/token/validate/{id}/{status}")
    public Mono<Boolean> updateRequestStatus(@PathVariable UUID id, @PathVariable String status) {
        return requestTokenService.updateRequestStatus(id, status)
                .doOnSuccess(ok -> System.out.println("✅ UPDATE confirmé en base pour l'id " + id))
                .doOnError(err -> System.err.println("❌ Échec UPDATE : " + err.getMessage()));
    }

    @Schema(description = "Requete pour obtenir une apiKey")
    @PostMapping("/request")
    public Mono<Boolean> requestApiKey(@RequestBody RequestTokenDto requestToken) {

        return requestTokenService.saveRequestToken(requestToken)

                .doOnSuccess(savedRequestToken -> {
                    System.out.println(
                            "✅ Requête enregistrée avec succès ! clientName: " + savedRequestToken.getClientName());
                })
                .doOnError(error -> {
                    System.out.println("❌ Erreur lors de l'enregistrement de la requête : " + error.getMessage());
                })
                .thenReturn(true)
                .onErrorReturn(false);
    }

    

    @PostMapping("/generate/token")
    public Mono<String> generateAccessToken(ServerHttpRequest request) {

        Mono<String> apiKeyMono =
            headerExtract.extractHeader(request, "X-Api-Key-Gateway", String.class);

        Mono<UUID> clientIdMono =
            headerExtract.extractHeader(request, "X-Api-Key-Gateway-Client", UUID.class);

        return apiKeyMono
            .zipWith(clientIdMono)
            .flatMap(tuple ->
                jwtUtils.generateTokensFirstConnection(
                    tuple.getT1(), // apiKey
                    tuple.getT2()  // clientId
                )
            );
    }


    @PostMapping("/authenticate/token")
        public Mono<?> authorizeAccessToken(@RequestBody RequestTokenDto requestToken) {
            return Mono.just(new String());
        }
}
