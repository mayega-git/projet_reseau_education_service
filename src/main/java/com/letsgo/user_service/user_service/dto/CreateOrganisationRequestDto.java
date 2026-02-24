package com.letsgo.user_service.user_service.dto;

import io.swagger.v3.oas.annotations.media.Schema;

public record CreateOrganisationRequestDto(

        @Schema(description = "Email address of the organisation", example = "contact@myorg.com") String email,

        @Schema(description = "Name of the organisation", example = "LetsGo Education") String name,

        @Schema(description = "Domain of the organisation", example = "letsgo.com") String domain,

        @Schema(description = "Description of the organisation", example = "An education platform") String description,

        @Schema(description = "Password for the organisation account", example = "securePass123") String password,

        @Schema(description = "Bio of the organisation", example = "We provide quality education") String bio) {
}
