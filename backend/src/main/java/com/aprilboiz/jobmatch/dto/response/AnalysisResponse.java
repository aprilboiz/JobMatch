package com.aprilboiz.jobmatch.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/*
 * This class is used to map the Analysis model to the response
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AnalysisResponse {
    private Double score;
    private String matchSkills;
    private String missingSkills;
}
