package com.aprilboiz.jobmatch.storage;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.Getter;
import lombok.Setter;

@ConfigurationProperties("storage")
@Getter
@Setter
@Component
public class StorageProperties {
    private String location = "uploads";
}
