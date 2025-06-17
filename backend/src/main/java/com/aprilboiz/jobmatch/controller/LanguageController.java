package com.aprilboiz.jobmatch.controller;

import com.aprilboiz.jobmatch.exception.ApiResponse;
import com.aprilboiz.jobmatch.service.MessageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.LocaleResolver;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.*;

@RestController
@RequestMapping("/api/language")
@RequiredArgsConstructor
@Tag(name = "Language Management", description = "Operations for managing language preferences and internationalization")
public class LanguageController {

    private final MessageService messageService;
    private final LocaleResolver localeResolver;

    @Operation(
            summary = "Get Supported Languages",
            description = "Retrieve a list of all supported languages in the application."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Supported languages retrieved successfully")
    })
    @GetMapping("/supported")
    public ResponseEntity<ApiResponse<Map<String, String>>> getSupportedLanguages() {
        Map<String, String> supportedLanguages = new LinkedHashMap<>();
        supportedLanguages.put("en", "English");
        supportedLanguages.put("vi", "Tiếng Việt");
        
        String successMessage = messageService.getMessage("operation.completed");
        return ResponseEntity.ok(ApiResponse.success(successMessage, supportedLanguages));
    }


    @Operation(
            summary = "Get Current Language",
            description = "Get the current language setting based on the request context."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Current language retrieved successfully")
    })
    @GetMapping("/current")
    public ResponseEntity<ApiResponse<Map<String, String>>> getCurrentLanguage() {
        Locale currentLocale = messageService.getCurrentLocale();
        Map<String, String> currentLanguageInfo = new HashMap<>();
        currentLanguageInfo.put("code", currentLocale.getLanguage());
        currentLanguageInfo.put("name", currentLocale.getDisplayLanguage(currentLocale));
        
        String successMessage = messageService.getMessage("operation.completed");
        return ResponseEntity.ok(ApiResponse.success(successMessage, currentLanguageInfo));
    }


    @Operation(
            summary = "Switch Language",
            description = "Switch the application language. This sets the language preference in the session."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Language switched successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid language code")
    })
    @PostMapping("/switch")
    public ResponseEntity<ApiResponse<Map<String, String>>> switchLanguage(
            @Parameter(description = "Language code (en, vi)", required = true)
            @RequestParam("lang") String languageCode,
            HttpServletRequest request,
            HttpServletResponse response) {
        
        // Validate language code
        Set<String> supportedLanguages = Set.of("en", "vi");
        if (!supportedLanguages.contains(languageCode)) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Invalid language code. Supported languages: " + supportedLanguages));
        }

        String previousLanguage = messageService.getCurrentLocale().getLanguage();
        
        Locale newLocale = Locale.forLanguageTag(languageCode);
        localeResolver.setLocale(request, response, newLocale);
        
        // Set it in LocaleContextHolder for immediate effect
        LocaleContextHolder.setLocale(newLocale);
        
        Map<String, String> result = new HashMap<>();
        result.put("previousLanguage", previousLanguage);
        result.put("newLanguage", languageCode);
        result.put("message", "Language switched to " + languageCode);
        
        String successMessage = messageService.getMessage("operation.completed");
        return ResponseEntity.ok(ApiResponse.success(successMessage, result));
    }
} 