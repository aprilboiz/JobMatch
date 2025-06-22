package com.aprilboiz.jobmatch.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.i18n.LocaleContext;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.core.task.TaskDecorator;
import org.springframework.lang.NonNull;


@Slf4j
public class LocaleContextTaskDecorator implements TaskDecorator {

    @Override
    @NonNull
    public Runnable decorate(@NonNull Runnable runnable) {
        // Capture the current locale context from the calling thread
        LocaleContext localeContext = LocaleContextHolder.getLocaleContext();
        
        return () -> {
            LocaleContext previousLocaleContext = LocaleContextHolder.getLocaleContext();
            try {
                // Set the captured locale context in the async thread
                LocaleContextHolder.setLocaleContext(localeContext);
                log.debug("Set locale context for async thread: {}", localeContext.getLocale());
                
                // Execute the original task
                runnable.run();
            } finally {
                // Restore the previous locale context
                LocaleContextHolder.setLocaleContext(previousLocaleContext);
                log.debug("Restored previous locale context: {}", 
                    previousLocaleContext != null ? previousLocaleContext.getLocale() : "null");
            }
        };
    }
} 