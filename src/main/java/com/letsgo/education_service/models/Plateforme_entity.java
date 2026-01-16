package com.letsgo.education_service.models;

import java.util.UUID;

import org.springframework.data.relational.core.mapping.Table;

import lombok.Data;

@Data
@Table("plateforme_entity")
public class Plateforme_entity {

    private UUID id;
    private String name;
    
}
