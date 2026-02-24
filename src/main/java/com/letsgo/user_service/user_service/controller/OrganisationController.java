package com.letsgo.user_service.user_service.controller;

import com.letsgo.user_service.user_service.Helper.JwtHelper;
import com.letsgo.user_service.user_service.controller.responses.DefaultResponse;
import com.letsgo.user_service.user_service.dto.CreateOrganisationRequestDto;
import com.letsgo.user_service.user_service.dto.LoginDto;
import com.letsgo.user_service.user_service.dto.OrganisationResponseDto;
import com.letsgo.user_service.user_service.dto.UserSummaryDto;
import com.letsgo.user_service.user_service.mapper.OrganisationMapper;
import com.letsgo.user_service.user_service.model.Organisation;
import com.letsgo.user_service.user_service.model.User;
import com.letsgo.user_service.user_service.model.enums.RoleEnum;
import com.letsgo.user_service.user_service.service.OrganisationService;
import exceptions.NotFoundException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/organisations")
public class OrganisationController {

        @Autowired
        private OrganisationService organisationService;

        @Autowired
        private OrganisationMapper organisationMapper;

        Logger logger = LoggerFactory.getLogger(OrganisationController.class);

        @PostMapping
        @Operation(summary = "Create a new organisation", description = "Create a new organisation in the system with the provided details and return a JWT token.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Organisation created successfully"),
                        @ApiResponse(responseCode = "400", description = "Invalid input data or organisation already exists"),
                        @ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<DefaultResponse<OrganisationResponseDto>> createOrganisation(
                        @RequestBody CreateOrganisationRequestDto requestDto) {
                try {
                        OrganisationResponseDto createdOrganisation = organisationService
                                        .createOrganisation(requestDto);

                        // Fetch the newly created organisation to generate token
                        Organisation organisation = organisationService.findByEmail(createdOrganisation.email())
                                        .orElseThrow(() -> new RuntimeException(
                                                        "Organisation not found after creation"));

                        // Generate JWT Token
                        String token = JwtHelper.generateToken(
                                        organisation.getEmail(),
                                        organisation.getName(),
                                        "", // Organisation has no lastName
                                        organisation.getId(),
                                        Set.of(organisation.getRole()));

                        // Create response with token
                        OrganisationResponseDto responseWithToken = OrganisationMapper.mapToResponseDTO(organisation,
                                        token);

                        return ResponseEntity
                                        .ok(new DefaultResponse<>(200, "Organisation created successfully",
                                                        responseWithToken));

                } catch (RuntimeException e) {
                        logger.error("Error creating organisation: {}", e.getMessage(), e);
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                        .body(new DefaultResponse<>(400,
                                                        "Organisation already exists: " + requestDto.email(), null));
                } catch (Exception e) {
                        logger.error("Internal server error creating organisation: {}", e.getMessage(), e);
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                        .body(new DefaultResponse<>(500, "Internal server error", null));
                }
        }

        @PostMapping("/login")
        @Operation(summary = "Authenticate organisation and return token")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Login successful"),
                        @ApiResponse(responseCode = "401", description = "Invalid credentials"),
                        @ApiResponse(responseCode = "404", description = "Organisation not found"),
                        @ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<DefaultResponse<OrganisationResponseDto>> login(@RequestBody LoginDto loginDto) {
                try {
                        logger.info("Attempting to authenticate organisation with email: {}", loginDto.email());

                        // Fetch organisation by email
                        Organisation organisation = organisationService.findByEmail(loginDto.email())
                                        .orElseThrow(() -> new NotFoundException(
                                                        "Organisation not found with email: " + loginDto.email()));

                        // Generate JWT Token
                        String token = JwtHelper.generateToken(
                                        organisation.getEmail(),
                                        organisation.getName(),
                                        "",
                                        organisation.getId(),
                                        Set.of(organisation.getRole()));

                        logger.info("JWT token generated successfully for organisation: {}", organisation.getEmail());

                        OrganisationResponseDto responseDto = OrganisationMapper.mapToResponseDTO(organisation, token);

                        return ResponseEntity.ok(new DefaultResponse<>(200, "Login successful", responseDto));

                } catch (NotFoundException e) {
                        logger.error("Organisation not found with email: {}", loginDto.email(), e);
                        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                        .body(new DefaultResponse<>(404, e.getMessage(), null));
                } catch (Exception e) {
                        logger.error("Internal server error during organisation login: {}", loginDto.email(), e);
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                        .body(new DefaultResponse<>(500, "Internal server error: " + e.getMessage(),
                                                        null));
                }
        }

        @GetMapping("/{id}")
        @Operation(summary = "Retrieve an organisation by ID", description = "Fetches an organisation by its unique ID.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Organisation found"),
                        @ApiResponse(responseCode = "404", description = "Organisation not found")
        })
        public ResponseEntity<DefaultResponse<OrganisationResponseDto>> getOrganisationById(@PathVariable UUID id) {
                Optional<Organisation> organisationOpt = organisationService.getOrganisationById(id);
                if (organisationOpt.isPresent()) {
                        OrganisationResponseDto responseDto = OrganisationMapper
                                        .mapToResponseDTO(organisationOpt.get());
                        return ResponseEntity.ok(new DefaultResponse<>(responseDto));
                } else {
                        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                        .body(new DefaultResponse<>(404, "Organisation not found", null));
                }
        }

        // ==================== GET ALL ====================

        @GetMapping
        @Operation(summary = "Retrieve all organisations", description = "Fetches a list of all organisations in the system.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Organisations found"),
                        @ApiResponse(responseCode = "404", description = "No organisations found")
        })
        public ResponseEntity<DefaultResponse<List<OrganisationResponseDto>>> getAllOrganisations() {
                List<Organisation> organisations = organisationService.getAllOrganisations();
                if (organisations.isEmpty()) {
                        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                        .body(new DefaultResponse<>(404, "No organisations found", null));
                }

                List<OrganisationResponseDto> responseDtos = organisations.stream()
                                .map(org -> OrganisationMapper.mapToResponseDTO(org))
                                .collect(Collectors.toList());

                return ResponseEntity.ok(new DefaultResponse<>(responseDtos));
        }

        // ==================== UPDATE ====================

        @PutMapping("/update/{id}")
        @Operation(summary = "Update organisation details", description = "Updates the organisation information.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Organisation updated successfully"),
                        @ApiResponse(responseCode = "404", description = "Organisation not found"),
                        @ApiResponse(responseCode = "500", description = "An error occurred")
        })
        public ResponseEntity<DefaultResponse<OrganisationResponseDto>> updateOrganisation(
                        @PathVariable UUID id,
                        @RequestBody CreateOrganisationRequestDto requestDto) {
                try {
                        OrganisationResponseDto updatedOrganisation = organisationService.updateOrganisation(id,
                                        requestDto);

                        // Fetch updated organisation to regenerate token
                        Organisation organisation = organisationService.getOrganisationById(updatedOrganisation.id())
                                        .orElseThrow(() -> new NotFoundException(
                                                        "Organisation not found after update"));

                        String token = JwtHelper.generateToken(
                                        organisation.getEmail(),
                                        organisation.getName(),
                                        "",
                                        organisation.getId(),
                                        Set.of(organisation.getRole()));

                        OrganisationResponseDto responseWithToken = OrganisationMapper.mapToResponseDTO(organisation,
                                        token);

                        return ResponseEntity
                                        .ok(new DefaultResponse<>(200, "Organisation updated successfully",
                                                        responseWithToken));

                } catch (NotFoundException e) {
                        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                        .body(new DefaultResponse<>(404, "Organisation not found", null));
                } catch (Exception e) {
                        logger.error("Error updating organisation: {}", e.getMessage(), e);
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                        .body(new DefaultResponse<>(500, "An error occurred", null));
                }
        }

        @DeleteMapping("/{id}")
        @Operation(summary = "Delete an organisation", description = "Deletes an existing organisation from the system based on the provided ID.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Organisation deleted successfully"),
                        @ApiResponse(responseCode = "404", description = "Organisation not found")
        })
        public ResponseEntity<DefaultResponse<Void>> deleteOrganisation(@PathVariable UUID id) {
                try {
                        organisationService.deleteOrganisation(id);
                        return ResponseEntity.ok(new DefaultResponse<>(200, "Organisation deleted successfully", null));
                } catch (NotFoundException e) {
                        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                        .body(new DefaultResponse<>(404, "Organisation not found", null));
                } catch (Exception e) {
                        logger.error("Error deleting organisation: {}", e.getMessage(), e);
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                        .body(new DefaultResponse<>(500, "An error occurred", null));
                }
        }

        // ==================== MEMBERSHIP MANAGEMENT ====================

        @PostMapping("/{orgId}/members/{userId}")
        @Operation(summary = "Add a user to an organisation", description = "Adds the specified user as a member of the specified organisation.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "User added to organisation successfully"),
                        @ApiResponse(responseCode = "404", description = "User or organisation not found"),
                        @ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<DefaultResponse<Void>> addMember(
                        @PathVariable UUID orgId,
                        @PathVariable UUID userId) {
                try {
                        organisationService.addUserToOrganisation(userId, orgId);
                        return ResponseEntity.ok(
                                        new DefaultResponse<>(200, "User added to organisation successfully", null));
                } catch (NotFoundException e) {
                        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                        .body(new DefaultResponse<>(404, e.getMessage(), null));
                } catch (Exception e) {
                        logger.error("Error adding user to organisation: {}", e.getMessage(), e);
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                        .body(new DefaultResponse<>(500, "An error occurred", null));
                }
        }

        @DeleteMapping("/{orgId}/members/{userId}")
        @Operation(summary = "Remove a user from an organisation", description = "Removes the specified user from the specified organisation.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "User removed from organisation successfully"),
                        @ApiResponse(responseCode = "404", description = "User or organisation not found"),
                        @ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<DefaultResponse<Void>> removeMember(
                        @PathVariable UUID orgId,
                        @PathVariable UUID userId) {
                try {
                        organisationService.removeUserFromOrganisation(userId, orgId);
                        return ResponseEntity.ok(new DefaultResponse<>(200,
                                        "User removed from organisation successfully", null));
                } catch (NotFoundException e) {
                        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                        .body(new DefaultResponse<>(404, e.getMessage(), null));
                } catch (Exception e) {
                        logger.error("Error removing user from organisation: {}", e.getMessage(), e);
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                        .body(new DefaultResponse<>(500, "An error occurred", null));
                }
        }

        @GetMapping("/{orgId}/members")
        @Operation(summary = "Get all members of an organisation", description = "Retrieves all users that belong to the specified organisation.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Members found"),
                        @ApiResponse(responseCode = "404", description = "Organisation not found")
        })
        public ResponseEntity<DefaultResponse<List<UserSummaryDto>>> getMembers(@PathVariable UUID orgId) {
                try {
                        List<User> members = organisationService.getMembersByOrganisationId(orgId);
                        List<UserSummaryDto> memberDtos = members.stream()
                                        .map(user -> new UserSummaryDto(user.getId(), user.getEmail(),
                                                        user.getFirstName(), user.getLastName()))
                                        .collect(Collectors.toList());
                        return ResponseEntity.ok(new DefaultResponse<>(memberDtos));
                } catch (NotFoundException e) {
                        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                        .body(new DefaultResponse<>(404, e.getMessage(), null));
                }
        }
}
