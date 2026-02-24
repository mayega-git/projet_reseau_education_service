package com.letsgo.user_service.user_service.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

public record UserSummaryDto(
        @Schema(description = "Unique identifier of the user") UUID id,
        @Schema(description = "Email address of the user") String email,
        @Schema(description = "First name of the user") String firstName,
        @Schema(description = "Last name of the user") String lastName) {
}
