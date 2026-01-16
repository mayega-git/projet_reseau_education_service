/*package com.letsgo.education_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.data.r2dbc.config.AbstractR2dbcConfiguration;

import io.r2dbc.postgresql.PostgresqlConnectionConfiguration;
import io.r2dbc.postgresql.PostgresqlConnectionFactory;
import io.r2dbc.postgresql.codec.EnumCodec;
import io.r2dbc.spi.ConnectionFactory;

import com.letsgo.education_service.enums.ContentStatus;
import com.letsgo.education_service.enums.ContentType;

@Configuration
public class R2dbcConfig extends AbstractR2dbcConfiguration {

    private final Environment environment;

    public R2dbcConfig(Environment environment) {
        this.environment = environment;
    }

    @Override
    @Bean
    public ConnectionFactory connectionFactory() {
        String url = environment.getProperty("spring.r2dbc.url");
        String username = environment.getProperty("spring.r2dbc.username");
        String password = environment.getProperty("spring.r2dbc.password");
        
        // Parser l'URL : r2dbc:postgresql://localhost:5432/education_db
        String cleanUrl = url.replace("r2dbc:postgresql://", "");
        String[] parts = cleanUrl.split("[:/]");
        
        return new PostgresqlConnectionFactory(
            PostgresqlConnectionConfiguration.builder()
                .host(parts[0])
                .port(Integer.parseInt(parts[1]))
                .database(parts[2])
                .username(username)
                .password(password)
                .codecRegistrar(
                    EnumCodec.builder()
                        .withEnum("content_status_enum", ContentStatus.class)
                        .withEnum("content_type_enum", ContentType.class)
                        .build()
                )
                .build()
        );
    }
}*/