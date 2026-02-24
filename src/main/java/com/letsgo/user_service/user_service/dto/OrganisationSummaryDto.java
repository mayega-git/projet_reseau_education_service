package com.letsgo.user_service.user_service.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

public record OrganisationSummaryDto(
        @Schema(description = "Unique identifier of the organisation") UUID id,
        @Schema(description = "Name of the organisation") String name,
        @Schema(description = "Domain of the organisation") String domain) {
}
