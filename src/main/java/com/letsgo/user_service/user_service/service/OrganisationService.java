package com.letsgo.user_service.user_service.service;

import com.letsgo.user_service.user_service.Repository.OrganisationRepository;
import com.letsgo.user_service.user_service.Repository.UserRepository;
import com.letsgo.user_service.user_service.dto.CreateOrganisationRequestDto;
import com.letsgo.user_service.user_service.dto.OrganisationResponseDto;
import com.letsgo.user_service.user_service.model.Organisation;
import com.letsgo.user_service.user_service.model.User;
import com.letsgo.user_service.user_service.model.enums.RoleEnum;
import exceptions.NotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static com.letsgo.user_service.user_service.mapper.OrganisationMapper.mapToResponseDTO;

@Service
public class OrganisationService {

    @Autowired
    private OrganisationRepository organisationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    Logger logger = LoggerFactory.getLogger(OrganisationService.class);

    // Create organisation with hashed password
    public OrganisationResponseDto createOrganisation(CreateOrganisationRequestDto requestDto) {
        logger.info("Creating organisation with email: {}", requestDto.email());

        Optional<Organisation> existingOrganisation = organisationRepository.findByEmail(requestDto.email());
        if (existingOrganisation.isPresent()) {
            throw new DuplicateKeyException("Organisation with the email address already exists");
        }

        String hashedPassword = passwordEncoder.encode(requestDto.password());

        Organisation organisation = new Organisation();
        organisation.setEmail(requestDto.email());
        organisation.setName(requestDto.name());
        organisation.setDomain(requestDto.domain());
        organisation.setDescription(requestDto.description());
        organisation.setPassword(hashedPassword);
        organisation.setBio(requestDto.bio());
        organisation.setRole(RoleEnum.PENDING_ORGANISATION);

        Organisation savedOrganisation = organisationRepository.save(organisation);
        logger.info("Organisation created successfully with id: {}", savedOrganisation.getId());

        return mapToResponseDTO(savedOrganisation);
    }

    // Find organisation by email
    public Optional<Organisation> findByEmail(String email) {
        return organisationRepository.findByEmail(email);
    }

    // Get organisation by ID
    public Optional<Organisation> getOrganisationById(UUID id) {
        return organisationRepository.findById(id);
    }

    // Get all organisations
    public List<Organisation> getAllOrganisations() {
        return organisationRepository.findAll();
    }

    // Update organisation
    public OrganisationResponseDto updateOrganisation(UUID id, CreateOrganisationRequestDto requestDto) {
        Organisation existingOrganisation = organisationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Organisation not found with id: " + id));

        existingOrganisation.setEmail(requestDto.email());
        existingOrganisation.setName(requestDto.name());
        existingOrganisation.setDomain(requestDto.domain());
        existingOrganisation.setDescription(requestDto.description());
        existingOrganisation.setBio(requestDto.bio());

        if (requestDto.password() != null && !requestDto.password().isEmpty()) {
            existingOrganisation.setPassword(passwordEncoder.encode(requestDto.password()));
        }

        existingOrganisation.setUpdatedAt(LocalDateTime.now());
        Organisation savedOrganisation = organisationRepository.save(existingOrganisation);

        return mapToResponseDTO(savedOrganisation);
    }

    // Delete organisation by ID
    public void deleteOrganisation(UUID id) {
        if (!organisationRepository.existsById(id)) {
            throw new NotFoundException("Organisation not found with id: " + id);
        }
        organisationRepository.deleteById(id);
    }

    // ==================== MEMBERSHIP MANAGEMENT ====================

    // Add a user to an organisation
    @Transactional
    public void addUserToOrganisation(UUID userId, UUID orgId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found with id: " + userId));
        Organisation organisation = organisationRepository.findById(orgId)
                .orElseThrow(() -> new NotFoundException("Organisation not found with id: " + orgId));

        user.getOrganisations().add(organisation);
        userRepository.save(user);
        logger.info("User {} added to organisation {}", userId, orgId);
    }

    // Remove a user from an organisation
    @Transactional
    public void removeUserFromOrganisation(UUID userId, UUID orgId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found with id: " + userId));
        Organisation organisation = organisationRepository.findById(orgId)
                .orElseThrow(() -> new NotFoundException("Organisation not found with id: " + orgId));

        user.getOrganisations().remove(organisation);
        userRepository.save(user);
        logger.info("User {} removed from organisation {}", userId, orgId);
    }

    // Get all members of an organisation
    public List<User> getMembersByOrganisationId(UUID orgId) {
        if (!organisationRepository.existsById(orgId)) {
            throw new NotFoundException("Organisation not found with id: " + orgId);
        }
        return userRepository.findByOrganisationsId(orgId);
    }

    // Get all organisations a user belongs to
    public List<Organisation> getOrganisationsByUserId(UUID userId) {
        if (!userRepository.existsById(userId)) {
            throw new NotFoundException("User not found with id: " + userId);
        }
        return organisationRepository.findByMembersId(userId);
    }
}
