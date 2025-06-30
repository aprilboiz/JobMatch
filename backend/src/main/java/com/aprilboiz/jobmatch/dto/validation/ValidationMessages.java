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

    public static final String FULLNAME_SIZE = "validation.size.fullname.3to50";
    public static final String PASSWORD_SIZE = "validation.size.password.6to20";
    public static final String PHONE_SIZE = "validation.size.phone.10digits";

    // Salary validation keys
    public static final String SALARY_INVALID = "validation.salary.invalid";
    public static final String SALARY_FIXED_MISSING = "validation.salary.fixed.missing";
    public static final String SALARY_RANGE_MISSING = "validation.salary.range.missing";
    public static final String SALARY_RANGE_INVALID = "validation.salary.range.invalid";
    public static final String SALARY_NEGOTIABLE_AMOUNTS = "validation.salary.negotiable.amounts";

    // File validation keys
    public static final String FILE_SIZE_EXCEEDED = "validation.file.size.exceeded";
    public static final String FILE_TYPE_INVALID = "validation.file.type.invalid";
    public static final String FILE_CONTENT_TYPE_INVALID = "validation.file.content.type.invalid";
    public static final String FILE_EXTENSION_INVALID = "validation.file.extension.invalid";

    // Job validation keys
    public static final String JOB_TITLE_REQUIRED = "validation.required.job.title";
    public static final String JOB_DESCRIPTION_REQUIRED = "validation.required.job.description";
    public static final String JOB_LOCATION_REQUIRED = "validation.required.job.location";
    public static final String JOB_TYPE_REQUIRED = "validation.required.job.type";
    public static final String JOB_CATEGORY_REQUIRED = "validation.required.job.category";
    public static final String JOB_SALARY_REQUIRED = "validation.required";
    public static final String JOB_OPENINGS_REQUIRED = "validation.required.job.openings";
    public static final String JOB_DEADLINE_REQUIRED = "validation.required.job.deadline";
    public static final String JOB_TITLE_SIZE = "validation.size.job.title.max100";
    public static final String JOB_DESCRIPTION_SIZE = "validation.size.job.description.max5000";
    public static final String JOB_LOCATION_SIZE = "validation.size.job.location.max100";
    public static final String DEADLINE_FUTURE = "validation.future.deadline";

    // Company validation keys
    public static final String COMPANY_NAME_REQUIRED = "validation.required.company.name";
    public static final String COMPANY_ADDRESS_REQUIRED = "validation.required.company.address";
    public static final String COMPANY_SIZE_REQUIRED = "validation.required.company.size";
    public static final String COMPANY_INDUSTRY_REQUIRED = "validation.required.company.industry";

    // Application validation keys
    public static final String JOB_ID_REQUIRED = "validation.required.job.id";
    public static final String CV_ID_REQUIRED = "validation.required.cv.id";
    public static final String ID_POSITIVE = "validation.positive.job.id";
    public static final String CV_ID_POSITIVE = "validation.positive.cv.id";

    // Token validation keys
    public static final String REFRESH_TOKEN_REQUIRED = "validation.required.refresh.token";
    public static final String ACCESS_TOKEN_REQUIRED = "validation.required.access.token";

    // Number validation keys
    public static final String OPENINGS_POSITIVE = "validation.positive.openings";

    private ValidationMessages() {
        throw new UnsupportedOperationException(
                "Utility class cannot be instantiated - use messageService.getMessage(\"util.class.cannot.instantiate\") instead");
    }
}