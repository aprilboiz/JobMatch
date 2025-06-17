package com.aprilboiz.jobmatch.service;

import java.util.Locale;


public interface MessageService {
    String getMessage(String key);
    String getMessage(String key, Object... args);
    String getMessage(String key, Locale locale);
    String getMessage(String key, Locale locale, Object... args);
    Locale getCurrentLocale();
} 