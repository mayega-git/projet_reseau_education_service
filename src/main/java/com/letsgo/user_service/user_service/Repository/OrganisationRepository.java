package com.letsgo.user_service.user_service.Repository;

import com.letsgo.user_service.user_service.model.Organisation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrganisationRepository extends JpaRepository<Organisation, UUID> {
    Optional<Organisation> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<Organisation> findByDomain(String domain);

    List<Organisation> findByMembersId(UUID userId);
}
