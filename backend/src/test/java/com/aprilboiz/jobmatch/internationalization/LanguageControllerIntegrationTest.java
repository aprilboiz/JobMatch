package com.aprilboiz.jobmatch.internationalization;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureWebMvc
@ActiveProfiles("test")
@DisplayName("Language Controller Integration Tests")
class LanguageControllerIntegrationTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private ObjectMapper objectMapper;

    private MockMvc mockMvc;

    @Test
    @DisplayName("Should get supported languages successfully")
    void shouldGetSupportedLanguages() throws Exception {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();

        mockMvc.perform(get("/api/language/supported")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.en").value("English"))
                .andExpect(jsonPath("$.data.vi").value("Tiếng Việt"));
    }

    @Test
    @DisplayName("Should get current language with English Accept-Language header")
    void shouldGetCurrentLanguageEnglish() throws Exception {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();

        mockMvc.perform(get("/api/language/current")
                        .header("Accept-Language", "en")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.code").value("en"));
    }

    @Test
    @DisplayName("Should get current language with Vietnamese Accept-Language header")
    void shouldGetCurrentLanguageVietnamese() throws Exception {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();

        mockMvc.perform(get("/api/language/current")
                        .header("Accept-Language", "vi")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.code").value("vi"));
    }

    @Test
    @DisplayName("Should switch language successfully")
    void shouldSwitchLanguageSuccessfully() throws Exception {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();

        mockMvc.perform(post("/api/language/switch")
                        .param("lang", "vi")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.newLanguage").value("vi"));
    }

    @Test
    @DisplayName("Should return error for invalid language code")
    void shouldReturnErrorForInvalidLanguageCode() throws Exception {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();

        mockMvc.perform(post("/api/language/switch")
                        .param("lang", "fr")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("Invalid language code")));
    }

    @Test
    @DisplayName("Should test internationalization with English locale")
    void shouldTestInternationalizationEnglish() throws Exception {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();

        mockMvc.perform(get("/api/language/test")
                        .header("Accept-Language", "en")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.login_success").value("Login successful"))
                .andExpect(jsonPath("$.data.register_success").value("User registered successfully"))
                .andExpect(jsonPath("$.data.validation_email_required").value("Email is required!"));
    }

    @Test
    @DisplayName("Should test internationalization with Vietnamese locale")
    void shouldTestInternationalizationVietnamese() throws Exception {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();

        mockMvc.perform(get("/api/language/test")
                        .header("Accept-Language", "vi")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.login_success").value("Đăng nhập thành công"))
                .andExpect(jsonPath("$.data.register_success").value("Đăng ký người dùng thành công"))
                .andExpect(jsonPath("$.data.validation_email_required").value("Email là bắt buộc!"));
    }

    @Test
    @DisplayName("Should handle locale switching via URL parameter")
    void shouldHandleLocaleSwitchingViaUrlParameter() throws Exception {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();

        // Test with URL parameter
        mockMvc.perform(get("/api/language/test")
                        .param("lang", "vi")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.login_success").value("Đăng nhập thành công"));
    }
} 