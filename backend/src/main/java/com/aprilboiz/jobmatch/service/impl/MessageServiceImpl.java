package com.aprilboiz.jobmatch.service.impl;

import com.aprilboiz.jobmatch.service.MessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
public class MessageServiceImpl implements MessageService {

    private final MessageSource messageSource;

    @Override
    public String getMessage(String key) {
        return getMessage(key, getCurrentLocale());
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
        // Try to get locale from LocaleContextHolder
        Locale locale = LocaleContextHolder.getLocale();

        // If the session doesn't have a locale set, try to get it from Accept-Language
        if (locale.equals(Locale.getDefault())) {
            locale = getLocaleFromRequest();

            // If we found a valid locale from Accept-Language, set it in the session
            if (isValidLocale(locale)) {
                setLocaleInSession(locale);
                LocaleContextHolder.setLocale(locale);
            }
        }

        // Default to English if no locale is found
        return locale != null ? locale : new Locale.Builder().setLanguage("en").build();
    }

    private Locale getLocaleFromRequest() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder
                    .getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                String acceptLanguage = request.getHeader("Accept-Language");

                if (acceptLanguage != null && !acceptLanguage.isEmpty()) {
                    // Parse the Accept-Language header
                    String[] languages = acceptLanguage.split(",");
                    if (languages.length > 0) {
                        String primaryLanguage = languages[0].trim();
                        // Handle cases like "en-US" or "vi-VN"
                        String languageCode = primaryLanguage.split("-")[0].split(";")[0];
                        return Locale.forLanguageTag(languageCode);
                    }
                }
            }
        } catch (Exception e) {
            log.debug("Could not extract locale from request: {}", e.getMessage());
        }
        return null;
    }

    private boolean isValidLocale(Locale locale) {
        return locale != null && ("en".equals(locale.getLanguage()) || "vi".equals(locale.getLanguage()));
    }

    private void setLocaleInSession(Locale locale) {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder
                    .getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                request.getSession().setAttribute("lang", locale.getLanguage());
            }
        } catch (Exception e) {
            log.debug("Could not set locale in session: {}", e.getMessage());
        }
    }
}