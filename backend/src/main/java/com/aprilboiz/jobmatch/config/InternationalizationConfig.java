package com.aprilboiz.jobmatch.config;

import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.support.ReloadableResourceBundleMessageSource;
import org.springframework.web.servlet.LocaleResolver;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.i18n.AcceptHeaderLocaleResolver;
import org.springframework.web.servlet.i18n.LocaleChangeInterceptor;
import org.springframework.web.servlet.i18n.SessionLocaleResolver;

import java.util.Arrays;
import java.util.Locale;

@Configuration
public class InternationalizationConfig implements WebMvcConfigurer {

    @Bean
    public MessageSource messageSource() {
        ReloadableResourceBundleMessageSource messageSource = new ReloadableResourceBundleMessageSource();
        messageSource.setBasename("classpath:messages");
        messageSource.setDefaultEncoding("UTF-8");
        messageSource.setCacheSeconds(3600);
        messageSource.setUseCodeAsDefaultMessage(true);
        return messageSource;
    }

    /**
     * Primary LocaleResolver that stores locale preference in session.
     * This supports both Accept-Language header detection and programmatic language switching.
     */
    @Bean(name = "localeResolver")
    public LocaleResolver sessionLocaleResolver() {
        SessionLocaleResolver localeResolver = new SessionLocaleResolver();
        localeResolver.setDefaultLocale(Locale.forLanguageTag("en"));
        return localeResolver;
    }

    /**
     * Alternative AcceptHeaderLocaleResolver for read-only Accept-Language header detection.
     * This is read-only and cannot be changed programmatically.
     */
    @Bean(name = "acceptHeaderLocaleResolver")
    public LocaleResolver acceptHeaderLocaleResolver() {
        AcceptHeaderLocaleResolver localeResolver = new AcceptHeaderLocaleResolver();
        localeResolver.setSupportedLocales(Arrays.asList(
                Locale.forLanguageTag("en"),
                Locale.forLanguageTag("vi")
        ));
        localeResolver.setDefaultLocale(Locale.forLanguageTag("en"));
        return localeResolver;
    }

    /**
     * LocaleChangeInterceptor to allow locale switching via URL parameter.
     * Enables language switching through ?lang=en or ?lang=vi parameters.
     */
    @Bean
    public LocaleChangeInterceptor localeChangeInterceptor() {
        LocaleChangeInterceptor interceptor = new LocaleChangeInterceptor();
        interceptor.setParamName("lang");
        return interceptor;
    }

    /**
     * Register the LocaleChangeInterceptor to handle locale switching requests.
     */
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(localeChangeInterceptor());
    }
} 