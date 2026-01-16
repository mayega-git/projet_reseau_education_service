package com.letsgo.education_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.r2dbc.repository.config.EnableR2dbcRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.reactive.function.client.WebClient;

import com.letsgo.education_service.dto.apiDto.MediaUploadResponse;
import com.letsgo.education_service.service.apiService.MediaStorageService;



@SpringBootApplication
@ComponentScan(basePackages = {
		"com.letsgo.education_service", 
})
@EnableR2dbcRepositories(basePackages = "com.letsgo.education_service.repository")  
@EnableScheduling
public class EducationServiceApplication {
	public static void main(String[] args) {

		SpringApplication.run(EducationServiceApplication.class, args);

		System.out.println("✅ Application Spring Boot démarrée avec succès !");
		//SpringApplication.run(EducationServiceApplication.class, args);
		//System.out.println("✅ Test communication API!");

		//MediaStorageService mediaStorageService = context.getBean(MediaStorageService.class);
		//MediaUploadResponse file = mediaStorageService.uploadBlogFile.block();

		//System.out.println("=======RESULTAT TEST========="+file.getTest());

	}
}
