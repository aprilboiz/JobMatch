package com.aprilboiz.jobmatch.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class CvResponse {
    private Long id;
    private String fileName;
    private String fileType;
    private String updatedAt;
    private String fileUri;
}
