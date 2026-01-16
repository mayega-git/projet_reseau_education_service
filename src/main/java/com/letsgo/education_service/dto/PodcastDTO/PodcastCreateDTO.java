package com.letsgo.education_service.dto.PodcastDTO;

import com.letsgo.education_service.enums.Domain;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.UUID;


@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
public class PodcastCreateDTO {


    @NotBlank(message = "L'identifiant de l'auteur est requis")
    private UUID authorId;

    @NotBlank(message = "Le titre ne peut pas être vide")
    private String title;

    @NotBlank(message = "S'il appartient à une organisation")
    private String OrganisationId;

    @NotBlank(message = "La description ne peut pas être vide")
    private String description;

    @NotBlank(message = "Les tags ne peuvent pas être nuls")
    private List<String> tags;

    @NotBlank(message = "L'identifiant de la catégorie est requis")
    private String categoryId;

    @NotBlank(message = "Le nom du domaine")
    private Domain domain;

    @NotBlank
    @Schema(description = "categorie", example = "Roman,Essai")
    private List<String> categories;


}
