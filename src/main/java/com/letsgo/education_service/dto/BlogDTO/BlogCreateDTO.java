package com.letsgo.education_service.dto.BlogDTO;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonProperty;

@Data
public class BlogCreateDTO {

    @NotBlank
    @Schema(description = "Titre du blog", example = "Les bases de Spring Boot")
    private String title;

    @NotBlank
    @Schema(description = "Description du blog", example = "Introduction à Spring Boot et ses fonctionnalités principales.")
    private String description;


    /*@Schema(description = "URL de l'image de couverture", example = "https://example.com/image.jpg")
    private String coverImg;*/

    @NotBlank
    @Schema(description = "ID de l'auteur du blog", example = "123456")
    private UUID authorId;

    @NotBlank(message = "S'il appartient à une organisation")
    private UUID OrganisationId;

    @NotBlank
    @Schema(description = "Domaine du blog", example = "Litterature")
    private String domain;

    @NotBlank
    @Schema(description = "Contenu du blog", example = "Spring Boot facilite le développement des applications Spring...")
    private String content;



    @Schema(description = "Liste des tags associés", example = "[\"Spring Boot\", \"Java\"]")
    private List<String> tags;
 
       
    /*@Schema(description = "URL de l'audio du blog (optionnel)", example = "https://example.com/audio.mp3")
    private String audioUrl;*/

    @NotNull
    @Schema(description = "Temps de lecture estimé en minutes", example = "10")
    private Integer readingTime;

    

    @NotBlank
    @Schema(description = "categorie", example = "Roman,Essai")
    private List<String> categories;

    @NotNull
    @Schema(description = "plateformeId" , example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID plateformeId;




}
