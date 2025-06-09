package com.aprilboiz.jobmatch.repository;

import com.aprilboiz.jobmatch.model.Application;
import org.springframework.data.jpa.repository.JpaRepository;



public interface ApplicationRepository extends JpaRepository<Application, Long> {
}
