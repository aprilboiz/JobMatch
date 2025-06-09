package com.aprilboiz.jobmatch.exception;

import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@SuperBuilder
public class ValidationErrorResponse extends ApiResponse<Void> {
    @Builder.Default
    private Map<String, String> errors = new HashMap<>();

    public void addError(String field, String message) {
        errors.put(field, message);
    }

    public ValidationErrorResponse create(String message) {
        return ValidationErrorResponse.builder()
                .success(false)
                .message(message)
                .timestamp(LocalDateTime.now())
                .errors(errors)
                .build();
    }
}

