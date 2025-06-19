package com.aprilboiz.jobmatch.dto.validation;

public final class ValidationMessages {

    // Generic validation message keys
    public static final String REQUIRED = "validation.required";
    public static final String INVALID_EMAIL = "validation.invalid.email";
    public static final String SIZE_RANGE = "validation.size.range";
    public static final String SIZE_MAX = "validation.size.max";
    public static final String SIZE_EXACT = "validation.size.exact";
    public static final String FUTURE = "validation.future";
    public static final String POSITIVE = "generic.positive";

    // Specific field validation keys
    public static final String EMAIL_REQUIRED = "validation.required.email";
    public static final String PASSWORD_REQUIRED = "validation.required.password";
    public static final String FULLNAME_REQUIRED = "validation.required.fullname";
    public static final String PHONE_REQUIRED = "validation.required.phone";
    public static final String ROLE_REQUIRED = "validation.required.role";

    public static final String EMAIL_INVALID = "validation.invalid.email";
    public static final String PHONE_INVALID = "validation.invalid.phone";
    public static final String ROLE_INVALID = "validation.invalid.role";

    public static final String FULLNAME_SIZE = "validation.size.fullname";
    public static final String PASSWORD_SIZE = "validation.size.password";
    public static final String PHONE_SIZE = "validation.size.phone";

    // File validation keys
    public static final String FILE_SIZE_EXCEEDED = "validation.file.size.exceeded";
    public static final String FILE_TYPE_INVALID = "validation.file.type.invalid";
    public static final String FILE_CONTENT_TYPE_INVALID = "validation.file.content.type.invalid";
    public static final String FILE_EXTENSION_INVALID = "validation.file.extension.invalid";

    // Job validation keys
    public static final String JOB_TITLE_REQUIRED = "validation.required";
    public static final String JOB_DESCRIPTION_REQUIRED = "validation.required";
    public static final String JOB_LOCATION_REQUIRED = "validation.required";
    public static final String JOB_TYPE_REQUIRED = "validation.required";
    public static final String JOB_SALARY_REQUIRED = "validation.required";
    public static final String JOB_OPENINGS_REQUIRED = "validation.required";
    public static final String JOB_DEADLINE_REQUIRED = "validation.required";
    public static final String JOB_TITLE_SIZE = "validation.size.max";
    public static final String JOB_DESCRIPTION_SIZE = "validation.size.max";
    public static final String JOB_LOCATION_SIZE = "validation.size.max";
    public static final String DEADLINE_FUTURE = "validation.future";

    // Company validation keys
    public static final String COMPANY_NAME_REQUIRED = "validation.required";
    public static final String COMPANY_ADDRESS_REQUIRED = "validation.required";
    public static final String COMPANY_SIZE_REQUIRED = "validation.required";
    public static final String COMPANY_INDUSTRY_REQUIRED = "validation.required";

    // Application validation keys
    public static final String JOB_ID_REQUIRED = "validation.required";
    public static final String CV_ID_REQUIRED = "validation.required";
    public static final String ID_POSITIVE = "generic.positive";

    // Token validation keys
    public static final String REFRESH_TOKEN_REQUIRED = "validation.required";
    public static final String ACCESS_TOKEN_REQUIRED = "validation.required";

    private ValidationMessages() {
        throw new UnsupportedOperationException(
                "Utility class cannot be instantiated - use messageService.getMessage(\"util.class.cannot.instantiate\") instead");
    }
}