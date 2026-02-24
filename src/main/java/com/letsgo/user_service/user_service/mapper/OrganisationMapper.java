package com.letsgo.user_service.user_service.mapper;

import com.letsgo.user_service.user_service.dto.OrganisationResponseDto;
import com.letsgo.user_service.user_service.dto.UserSummaryDto;
import com.letsgo.user_service.user_service.model.Organisation;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class OrganisationMapper {

    public static OrganisationResponseDto mapToResponseDTO(Organisation organisation, String token) {
        List<UserSummaryDto> members = organisation.getMembers() != null
                ? organisation.getMembers().stream()
                        .map(user -> new UserSummaryDto(
                                user.getId(),
                                user.getEmail(),
                                user.getFirstName(),
                                user.getLastName()))
                        .collect(Collectors.toList())
                : Collections.emptyList();

        return new OrganisationResponseDto(
                organisation.getId(),
                organisation.getEmail(),
                organisation.getName(),
                organisation.getDomain(),
                organisation.getDescription(),
                organisation.getBio(),
                organisation.getRole(),
                token,
                members);
    }

    public static OrganisationResponseDto mapToResponseDTO(Organisation organisation) {
        return mapToResponseDTO(organisation, null);
    }
}
