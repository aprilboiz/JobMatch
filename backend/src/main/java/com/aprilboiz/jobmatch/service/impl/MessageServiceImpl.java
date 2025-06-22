package com.aprilboiz.jobmatch.service.impl;

import com.aprilboiz.jobmatch.service.MessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.servlet.LocaleResolver;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
public class MessageServiceImpl implements MessageService {

    private final MessageSource messageSource;
    private final LocaleResolver localeResolver;

    @Override
    public String getMessage(String key) {
        Locale locale = getCurrentLocale();
        log.debug("Getting message for key: {} with locale: {}", key, locale);
        return getMessage(key, locale);
    }

    @Override
    public String getMessage(String key, Object... args) {
        return getMessage(key, getCurrentLocale(), args);
    }

    @Override
    public String getMessage(String key, Locale locale) {
        try {
            return messageSource.getMessage(key, null, locale);
        } catch (Exception e) {
            log.warn("Message not found for key: {} and locale: {}", key, locale);
            // Return key as fallback
            return key;
        }
    }

    @Override
    public String getMessage(String key, Locale locale, Object... args) {
        try {
            return messageSource.getMessage(key, args, locale);
        } catch (Exception e) {
            log.warn("Message not found for key: {} and locale: {} with args: {}", key, locale, args);
            // Return key as fallback
            return key;
        }
    }

    @Override
    public Locale getCurrentLocale() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                
                // 1. Check if there's a ?lang= parameter (handled by LocaleChangeInterceptor + SessionLocaleResolver)
                Locale sessionLocale = localeResolver.resolveLocale(request);
                log.debug("SessionLocaleResolver locale: {}", sessionLocale);
                
                // 2. If session locale is default, check Accept-Language header as fallback
                if (sessionLocale.equals(Locale.forLanguageTag("en"))) {
                    String acceptLanguage = request.getHeader("Accept-Language");
                    log.debug("Accept-Language header: {}", acceptLanguage);
                    
                    if (acceptLanguage != null && acceptLanguage.startsWith("vi")) {
                        sessionLocale = Locale.forLanguageTag("vi");
                        log.debug("Using Accept-Language fallback: {}", sessionLocale);
                    }
                }
                
                // Set in context and return
                LocaleContextHolder.setLocale(sessionLocale);
                log.debug("Final resolved locale: {}", sessionLocale);
                return sessionLocale;
            }
            
            // Fallback if no request context
            Locale contextLocale = LocaleContextHolder.getLocale();
            log.debug("Using LocaleContextHolder fallback: {}", contextLocale);
            return contextLocale;
            
        } catch (Exception e) {
            log.warn("Error resolving locale, falling back to English", e);
            return Locale.ENGLISH;
        }
    }


}