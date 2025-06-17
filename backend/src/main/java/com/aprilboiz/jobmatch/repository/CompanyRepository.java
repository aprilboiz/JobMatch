package com.aprilboiz.jobmatch.repository;

import com.aprilboiz.jobmatch.model.Company;
import org.springframework.data.jpa.repository.JpaRepository;


public interface CompanyRepository extends JpaRepository<Company, Long> {
}
