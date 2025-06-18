package com.aprilboiz.jobmatch.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.tags.Tag;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Value("${server.port:8080}")
    private String serverPort;

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("JobMatch API")
                        .description("""
                            ## JobMatch RESTful API Documentation
                            
                            I created this API for Chien Tran, a talented developer, to help him build a job matching platform. <3
                            
                            ### Features:
                            - **User Management**: Registration, authentication, and profile management
                            - **Job Management**: Create, search, and filter job postings
                            - **Application Tracking**: Apply to jobs and track application status
                            - **CV Management**: Upload, manage, and download CVs
                            - **Company Profiles**: Manage company information and branding
                            - **Multi-language Support**: English and Vietnamese localization
                            
                            ### Authentication:
                            Most endpoints require JWT authentication. Include the token in the Authorization header:
                            ```
                            Authorization: Bearer your_jwt_token_here
                            ```
                            
                            ### API Response Format:
                            All API responses follow a consistent format:
                            ```json
                            {
                              "success": true,
                              "message": "Operation completed successfully",
                              "data": { ... },
                              "timestamp": "2024-01-01T00:00:00.000Z"
                            }
                            ```
                            
                            ### User Roles: CANDIDATE, RECRUITER, ADMIN
                            """)
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("AprilBoiz Development Team")
                                .email("phantuananh0202@gmail.com")
                                .url("https://github.com/aprilboiz/jobmatch"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .servers(List.of(
                        new Server()
                                .url("http://localhost:" + serverPort)
                                .description("Development server"))
                )
                .addSecurityItem(new SecurityRequirement().addList("Bearer Authentication"))
                .components(new Components()
                        .addSecuritySchemes("Bearer Authentication",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("JWT token authentication. Format: Bearer {token}"))
                );
    }

    @Bean
    public GroupedOpenApi authenticationApi() {
        return GroupedOpenApi.builder()
                .group("01-authentication")
                .displayName("🔐 Authentication & Authorization")
                .pathsToMatch("/api/auth/**")
                .build();
    }

    @Bean
    public GroupedOpenApi userManagementApi() {
        return GroupedOpenApi.builder()
                .group("02-user-management")
                .displayName("👤 User Management")
                .pathsToMatch("/api/me/**")
                .pathsToExclude("/api/me/jobs/**")
                .build();
    }

    @Bean
    public GroupedOpenApi jobManagementApi() {
        return GroupedOpenApi.builder()
                .group("03-job-management")
                .displayName("💼 Job Management")
                .pathsToMatch("/api/jobs/**")
                .build();
    }

    @Bean
    public GroupedOpenApi applicationManagementApi() {
        return GroupedOpenApi.builder()
                .group("04-application-management")
                .displayName("📋 Application Management")
                .pathsToMatch("/api/applications/**")
                .build();
    }

    @Bean
    public GroupedOpenApi cvManagementApi() {
        return GroupedOpenApi.builder()
                .group("05-cv-management")
                .displayName("📄 CV Management")
                .pathsToMatch("/api/cvs/**")
                .build();
    }

    @Bean
    public GroupedOpenApi recruiterManagementApi() {
        return GroupedOpenApi.builder()
                .group("06-recruiter-management")
                .displayName("🏢 Recruiter Management")
                .pathsToMatch("/api/me/jobs/**", "/api/me/company/**")
                .build();
    }

    @Bean
    public GroupedOpenApi languageApi() {
        return GroupedOpenApi.builder()
                .group("07-language-management")
                .displayName("🌐 Language & Internationalization")
                .pathsToMatch("/api/language/**")
                .build();
    }

    @Bean
    public GroupedOpenApi testingApi() {
        return GroupedOpenApi.builder()
                .group("98-testing")
                .displayName("🧪 Testing & Development")
                .pathsToMatch("/api/test/**")
                .build();
    }

    @Bean
    public GroupedOpenApi allApis() {
        return GroupedOpenApi.builder()
                .group("00-all-apis")
                .displayName("📚 All APIs")
                .pathsToMatch("/api/**")
                .build();
    }
} 