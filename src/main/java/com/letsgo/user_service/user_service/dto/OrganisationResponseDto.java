package com.letsgo.user_service.user_service.dto;

import com.letsgo.user_service.user_service.model.enums.RoleEnum;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;
import java.util.UUID;

public record OrganisationResponseDto(

                @Schema(description = "Unique identifier of the organisation") UUID id,

                @Schema(description = "Email address of the organisation", example = "contact@myorg.com") String email,

                @Schema(description = "Name of the organisation", example = "LetsGo Education") String name,

                @Schema(description = "Domain of the organisation", example = "letsgo.com") String domain,

                @Schema(description = "Description of the organisation", example = "An education platform") String description,

                @Schema(description = "Bio of the organisation", example = "We provide quality education") String bio,

                @Schema(description = "Role of the organisation", example = "PENDING_ORGANISATION") RoleEnum role,

                @Schema(description = "JWT token for authentication", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...") String token,

                @Schema(description = "List of members in this organisation") List<UserSummaryDto> members) {
}
