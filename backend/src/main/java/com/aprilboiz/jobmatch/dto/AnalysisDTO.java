package com.aprilboiz.jobmatch.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

/*
 * This class is used to map the response from the AI service
 * 
 */

@AllArgsConstructor
@NoArgsConstructor
@Data
public class AnalysisDTO {
    @JsonProperty("similarity_score")
    private Double similarityScore;

    @JsonProperty("match_score")
    private Double matchScore;

    @JsonProperty("doc2vec_similarity")
    private Double doc2vecSimilarity;

    @JsonProperty("sbert_similarity")
    private Double sbertSimilarity;

    @JsonProperty("recommendation")
    private String recommendation;

    @JsonProperty("method_used")
    private String methodUsed;

    @JsonProperty("confidence_level")
    private String confidenceLevel; // "high", "medium", "low"

    @JsonProperty("method_reliability")
    private String methodReliability; // Thông tin về độ tin cậy

    @JsonProperty("match_skills")
    private String matchSkills; // Skills that match between CV and JD

    @JsonProperty("missing_skills")
    private String missingSkills; // Skills missing from CV that are required for JD
}
