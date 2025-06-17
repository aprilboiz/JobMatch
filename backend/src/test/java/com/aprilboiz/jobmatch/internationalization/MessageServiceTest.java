package com.aprilboiz.jobmatch.internationalization;

import com.aprilboiz.jobmatch.service.MessageService;
import com.aprilboiz.jobmatch.service.impl.MessageServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;

import java.util.Locale;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("MessageService Internationalization Tests")
class MessageServiceTest {

    @Mock
    private MessageSource messageSource;

    private MessageService messageService;

    @BeforeEach
    void setUp() {
        messageService = new MessageServiceImpl(messageSource);
    }

    @Test
    @DisplayName("Should get English message when locale is English")
    void shouldGetEnglishMessage() {
        // Given
        String messageKey = "api.success.login";
        String expectedMessage = "Login successful";
        Locale englishLocale = new Locale("en");
        
        when(messageSource.getMessage(messageKey, null, englishLocale))
                .thenReturn(expectedMessage);

        // When
        String actualMessage = messageService.getMessage(messageKey, englishLocale);

        // Then
        assertEquals(expectedMessage, actualMessage);
        verify(messageSource).getMessage(messageKey, null, englishLocale);
    }

    @Test
    @DisplayName("Should get Vietnamese message when locale is Vietnamese")
    void shouldGetVietnameseMessage() {
        // Given
        String messageKey = "api.success.login";
        String expectedMessage = "Đăng nhập thành công";
        Locale vietnameseLocale = new Locale("vi");
        
        when(messageSource.getMessage(messageKey, null, vietnameseLocale))
                .thenReturn(expectedMessage);

        // When
        String actualMessage = messageService.getMessage(messageKey, vietnameseLocale);

        // Then
        assertEquals(expectedMessage, actualMessage);
        verify(messageSource).getMessage(messageKey, null, vietnameseLocale);
    }

    @Test
    @DisplayName("Should get message with parameters")
    void shouldGetMessageWithParameters() {
        // Given
        String messageKey = "api.error.storage";
        Object[] args = {"file.txt"};
        String expectedMessage = "Storage error: file.txt";
        Locale englishLocale = new Locale("en");
        
        when(messageSource.getMessage(messageKey, args, englishLocale))
                .thenReturn(expectedMessage);

        // When
        String actualMessage = messageService.getMessage(messageKey, englishLocale, args);

        // Then
        assertEquals(expectedMessage, actualMessage);
        verify(messageSource).getMessage(messageKey, args, englishLocale);
    }

    @Test
    @DisplayName("Should return message key when message not found")
    void shouldReturnKeyWhenMessageNotFound() {
        // Given
        String messageKey = "nonexistent.key";
        Locale englishLocale = new Locale("en");
        
        when(messageSource.getMessage(messageKey, null, englishLocale))
                .thenThrow(new RuntimeException("Message not found"));

        // When
        String actualMessage = messageService.getMessage(messageKey, englishLocale);

        // Then
        assertEquals(messageKey, actualMessage);
        verify(messageSource).getMessage(messageKey, null, englishLocale);
    }

    @Test
    @DisplayName("Should get current locale from LocaleContextHolder")
    void shouldGetCurrentLocale() {
        // Given
        Locale expectedLocale = new Locale("vi");
        LocaleContextHolder.setLocale(expectedLocale);

        // When
        Locale actualLocale = messageService.getCurrentLocale();

        // Then
        assertEquals(expectedLocale, actualLocale);
        
        // Clean up
        LocaleContextHolder.resetLocaleContext();
    }

    @Test
    @DisplayName("Should get message using current locale")
    void shouldGetMessageUsingCurrentLocale() {
        // Given
        String messageKey = "api.success.register";
        String expectedMessage = "Đăng ký người dùng thành công";
        Locale vietnameseLocale = new Locale("vi");
        
        LocaleContextHolder.setLocale(vietnameseLocale);
        when(messageSource.getMessage(messageKey, null, vietnameseLocale))
                .thenReturn(expectedMessage);

        // When
        String actualMessage = messageService.getMessage(messageKey);

        // Then
        assertEquals(expectedMessage, actualMessage);
        verify(messageSource).getMessage(messageKey, null, vietnameseLocale);
        
        // Clean up
        LocaleContextHolder.resetLocaleContext();
    }

    @Test
    @DisplayName("Should get message with parameters using current locale")
    void shouldGetMessageWithParametersUsingCurrentLocale() {
        // Given
        String messageKey = "api.error.parameter.missing";
        Object[] args = {"userId"};
        String expectedMessage = "Thiếu tham số bắt buộc: userId";
        Locale vietnameseLocale = new Locale("vi");
        
        LocaleContextHolder.setLocale(vietnameseLocale);
        when(messageSource.getMessage(messageKey, args, vietnameseLocale))
                .thenReturn(expectedMessage);

        // When
        String actualMessage = messageService.getMessage(messageKey, args);

        // Then
        assertEquals(expectedMessage, actualMessage);
        verify(messageSource).getMessage(messageKey, args, vietnameseLocale);
        
        // Clean up
        LocaleContextHolder.resetLocaleContext();
    }
} 