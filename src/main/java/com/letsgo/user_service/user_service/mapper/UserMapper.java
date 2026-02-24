package com.letsgo.user_service.user_service.mapper;

import com.letsgo.user_service.user_service.dto.CreateUserResponseDto;
import com.letsgo.user_service.user_service.dto.OrganisationSummaryDto;
import com.letsgo.user_service.user_service.model.User;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class UserMapper {

    public static CreateUserResponseDto mapToResponseDTO(User user, String token) {
        List<OrganisationSummaryDto> organisations = user.getOrganisations() != null
                ? user.getOrganisations().stream()
                        .map(org -> new OrganisationSummaryDto(
                                org.getId(),
                                org.getName(),
                                org.getDomain()))
                        .collect(Collectors.toList())
                : Collections.emptyList();

        return new CreateUserResponseDto(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRoles().stream()
                        .map(role -> role.getName())
                        .collect(Collectors.toSet()),
                token,
                organisations);
    }

    public static CreateUserResponseDto mapToResponseDTO(User user) {
        return mapToResponseDTO(user, null);
    }
}
