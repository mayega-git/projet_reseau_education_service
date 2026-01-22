package com.education_service.apiKeygateway.models;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import com.education_service.apiKeygateway.enums.Status;

import lombok.Data;

@Data
@Table(name="api_key",schema = "api_key_gateway")
public class Apikey {

    @Id
    private UUID id;

    @Column("refresh_token")
    private String refreshToken;

    @Column("refresh_token_created_at")
    private LocalDateTime refreshTokenCreatedAt;

    @Column("refresh_token_expired_at")
    private LocalDateTime refreshTokenExpiredAt;

    @Column("hash_key")
    private String apiKey;
    
    @Column("status")
    private Status status;

    @Column("client_id")
    private UUID clientId;

    @Column("created_at")
    private LocalDateTime createdAt;

    @Column("request_token_id")
    private UUID requestTokenId;

    @Column("updated_at")
    private LocalDateTime updatedAt;

    @Column("validity_period")
    private Integer validityPeriod;

    


    
}
