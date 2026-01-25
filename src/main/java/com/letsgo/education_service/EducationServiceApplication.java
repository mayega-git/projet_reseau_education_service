package com.letsgo.education_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.r2dbc.repository.config.EnableR2dbcRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;





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

		
		

	}
}
