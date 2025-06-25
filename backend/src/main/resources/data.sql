-- JobMatch Application Seed Data

-- Clear existing data
TRUNCATE TABLE roles, users, company, candidate, recruiter, jobs, cv, application, analysis CASCADE;

-- Reset sequences
-- ALTER SEQUENCE hibernate_sequence RESTART WITH 1;

-- Roles
INSERT INTO roles (id, name) VALUES 
(1, 'ADMIN'),
(2, 'CANDIDATE'),
(3, 'RECRUITER');

-- Companies
INSERT INTO company (id, name, website, phone_number, email, address, company_size, industry, description, logo_url, created_at, updated_at) VALUES
(1, 'TechNova Solutions', 'https://www.technova.com', '+1-555-123-4567', 'hr@technova.com', '123 Innovation Drive, San Francisco, CA 94105', '501-1000', 'Software Development', 'TechNova is a leading innovator in cloud-based enterprise solutions, helping businesses transform their digital infrastructure.', 'https://res.cloudinary.com/jobmatch/image/upload/logos/technova.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'Quantum Financial', 'https://www.quantumfinancial.com', '+1-555-876-5432', 'careers@quantumfinancial.com', '789 Wall Street, New York, NY 10005', '1001-5000', 'Financial Services', 'Quantum Financial specializes in investment banking and wealth management services for high-net-worth individuals and institutions.', 'https://res.cloudinary.com/jobmatch/image/upload/logos/quantum.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'GreenEarth Sustainability', 'https://www.greenearth.org', '+1-555-789-0123', 'jobs@greenearth.org', '456 Eco Way, Portland, OR 97204', '101-500', 'Environmental Services', 'GreenEarth is dedicated to developing sustainable solutions for businesses and communities worldwide.', 'https://res.cloudinary.com/jobmatch/image/upload/logos/greenearth.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'MediLife Sciences', 'https://www.medilife.com', '+1-555-321-7890', 'recruiting@medilife.com', '321 Health Avenue, Boston, MA 02115', '1001-5000', 'Healthcare & Pharmaceuticals', 'MediLife Sciences is revolutionizing healthcare through innovative therapies and medical technologies.', 'https://res.cloudinary.com/jobmatch/image/upload/logos/medilife.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 'Global Logistics Inc.', 'https://www.globallogistics.com', '+1-555-456-7890', 'staffing@globallogistics.com', '987 Transport Boulevard, Chicago, IL 60607', '5001-10000', 'Transportation & Logistics', 'Global Logistics specializes in supply chain solutions and worldwide distribution services.', 'https://res.cloudinary.com/jobmatch/image/upload/logos/globallogistics.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Users - Candidates (using BCrypt encrypted 'password123')
INSERT INTO users (id, email, password, full_name, phone_number, avatar_url, is_active, role_id, user_type, created_at, updated_at) VALUES
(1, 'john.developer@gmail.com', '$2a$10$yLtHHc.MlzLx25XHRApNV.u6UQ0hbUUHQP5n5WzkHU9fWGZU5beWC', 'John Developer', '+1-555-111-2222', 'https://res.cloudinary.com/jobmatch/image/upload/avatars/john.jpg', TRUE, 2, 'CANDIDATE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'amy.designer@gmail.com', '$2a$10$yLtHHc.MlzLx25XHRApNV.u6UQ0hbUUHQP5n5WzkHU9fWGZU5beWC', 'Amy Designer', '+1-555-222-3333', 'https://res.cloudinary.com/jobmatch/image/upload/avatars/amy.jpg', TRUE, 2, 'CANDIDATE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'michael.analyst@gmail.com', '$2a$10$yLtHHc.MlzLx25XHRApNV.u6UQ0hbUUHQP5n5WzkHU9fWGZU5beWC', 'Michael Analyst', '+1-555-333-4444', 'https://res.cloudinary.com/jobmatch/image/upload/avatars/michael.jpg', TRUE, 2, 'CANDIDATE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'sarah.engineer@gmail.com', '$2a$10$yLtHHc.MlzLx25XHRApNV.u6UQ0hbUUHQP5n5WzkHU9fWGZU5beWC', 'Sarah Engineer', '+1-555-444-5555', 'https://res.cloudinary.com/jobmatch/image/upload/avatars/sarah.jpg', TRUE, 2, 'CANDIDATE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 'david.manager@gmail.com', '$2a$10$yLtHHc.MlzLx25XHRApNV.u6UQ0hbUUHQP5n5WzkHU9fWGZU5beWC', 'David Manager', '+1-555-555-6666', 'https://res.cloudinary.com/jobmatch/image/upload/avatars/david.jpg', TRUE, 2, 'CANDIDATE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- Users - Recruiters (using BCrypt encrypted 'password123')
(6, 'jennifer.hr@technova.com', '$2a$10$yLtHHc.MlzLx25XHRApNV.u6UQ0hbUUHQP5n5WzkHU9fWGZU5beWC', 'Jennifer Thompson', '+1-555-666-7777', 'https://res.cloudinary.com/jobmatch/image/upload/avatars/jennifer.jpg', TRUE, 3, 'RECRUITER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(7, 'robert.talent@quantumfinancial.com', '$2a$10$yLtHHc.MlzLx25XHRApNV.u6UQ0hbUUHQP5n5WzkHU9fWGZU5beWC', 'Robert Wilson', '+1-555-777-8888', 'https://res.cloudinary.com/jobmatch/image/upload/avatars/robert.jpg', TRUE, 3, 'RECRUITER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(8, 'patricia.recruiter@greenearth.org', '$2a$10$yLtHHc.MlzLx25XHRApNV.u6UQ0hbUUHQP5n5WzkHU9fWGZU5beWC', 'Patricia Green', '+1-555-888-9999', 'https://res.cloudinary.com/jobmatch/image/upload/avatars/patricia.jpg', TRUE, 3, 'RECRUITER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(9, 'james.hiring@medilife.com', '$2a$10$yLtHHc.MlzLx25XHRApNV.u6UQ0hbUUHQP5n5WzkHU9fWGZU5beWC', 'James Johnson', '+1-555-999-0000', 'https://res.cloudinary.com/jobmatch/image/upload/avatars/james.jpg', TRUE, 3, 'RECRUITER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(10, 'elizabeth.staffing@globallogistics.com', '$2a$10$yLtHHc.MlzLx25XHRApNV.u6UQ0hbUUHQP5n5WzkHU9fWGZU5beWC', 'Elizabeth Brown', '+1-555-000-1111', 'https://res.cloudinary.com/jobmatch/image/upload/avatars/elizabeth.jpg', TRUE, 3, 'RECRUITER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Candidate profiles
INSERT INTO candidate (id) VALUES (1), (2), (3), (4), (5);

-- Recruiter profiles
INSERT INTO recruiter (id, company_id) VALUES 
(6, 1), -- Jennifer at TechNova
(7, 2), -- Robert at Quantum Financial
(8, 3), -- Patricia at GreenEarth
(9, 4), -- James at MediLife
(10, 5); -- Elizabeth at Global Logistics

-- Jobs (5 per recruiter)
-- TechNova Jobs
INSERT INTO jobs (id, title, job_type, salary_type, min_salary, max_salary, currency, salary_period, number_of_openings, application_deadline, status, description, location, company_id, recruiter_id, created_at, updated_at) VALUES 
(1, 'Senior Java Developer', 'FULL_TIME', 'RANGE', 90000, 120000, 'USD', 'ANNUAL', 2, '2024-03-31', 'OPEN', 'We are looking for an experienced Java Developer to join our team. The ideal candidate should have extensive experience with Spring Boot, Hibernate, and RESTful APIs. You will be responsible for designing and implementing new features, as well as maintaining existing applications.', 'San Francisco, CA (Hybrid)', 1, 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO jobs (id, title, job_type, salary_type, min_salary, max_salary, currency, salary_period, number_of_openings, application_deadline, status, description, location, company_id, recruiter_id, created_at, updated_at) VALUES 
(2, 'UI/UX Designer', 'FULL_TIME', 'FIXED', 85000, NULL, 'USD', 'ANNUAL', 1, '2024-03-25', 'OPEN', 'Join our design team to create intuitive and engaging user experiences for our cloud-based products. You should have a strong portfolio demonstrating your design thinking and execution across web and mobile platforms.', 'San Francisco, CA (Hybrid)', 1, 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO jobs (id, title, job_type, salary_type, min_salary, max_salary, currency, salary_period, number_of_openings, application_deadline, status, description, location, company_id, recruiter_id, created_at, updated_at) VALUES 
(3, 'DevOps Engineer', 'FULL_TIME', 'RANGE', 95000, 130000, 'USD', 'ANNUAL', 2, '2024-04-05', 'OPEN', 'We are seeking a DevOps Engineer to help streamline our development and deployment processes. Experience with AWS, Docker, Kubernetes, and CI/CD pipelines is required.', 'Remote', 1, 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO jobs (id, title, job_type, salary_type, min_salary, max_salary, currency, salary_period, number_of_openings, application_deadline, status, description, location, company_id, recruiter_id, created_at, updated_at) VALUES 
(4, 'Product Manager', 'FULL_TIME', 'NEGOTIABLE', NULL, NULL, 'USD', 'ANNUAL', 1, '2024-03-28', 'OPEN', 'Looking for an experienced Product Manager to lead our enterprise product line. You will work closely with engineering, design, and marketing teams to define product strategy and roadmap.', 'San Francisco, CA (Onsite)', 1, 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO jobs (id, title, job_type, salary_type, min_salary, max_salary, currency, salary_period, number_of_openings, application_deadline, status, description, location, company_id, recruiter_id, created_at, updated_at) VALUES 
(5, 'QA Automation Engineer', 'FULL_TIME', 'RANGE', 80000, 105000, 'USD', 'ANNUAL', 2, '2024-04-10', 'OPEN', 'Join our QA team to develop and maintain our automated testing frameworks. Experience with Selenium, JUnit, and continuous integration tools is required.', 'San Francisco, CA (Hybrid)', 1, 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Quantum Financial Jobs
INSERT INTO jobs (id, title, job_type, salary_type, min_salary, max_salary, currency, salary_period, number_of_openings, application_deadline, status, description, location, company_id, recruiter_id, created_at, updated_at) VALUES 
(6, 'Financial Software Developer', 'FULL_TIME', 'RANGE', 100000, 140000, 'USD', 'ANNUAL', 3, '2024-04-15', 'OPEN', 'Seeking a developer with experience in financial systems to work on our trading platform. Strong knowledge of Java, SQL, and financial algorithms is required.', 'New York, NY (Hybrid)', 2, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO jobs (id, title, job_type, salary_type, min_salary, max_salary, currency, salary_period, number_of_openings, application_deadline, status, description, location, company_id, recruiter_id, created_at, updated_at) VALUES 
(7, 'Data Scientist - Finance', 'FULL_TIME', 'RANGE', 115000, 150000, 'USD', 'ANNUAL', 2, '2024-03-30', 'OPEN', 'Join our data science team to develop predictive models for financial markets. Experience with Python, R, and machine learning algorithms in a financial context is required.', 'New York, NY (Hybrid)', 2, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO jobs (id, title, job_type, salary_type, min_salary, max_salary, currency, salary_period, number_of_openings, application_deadline, status, description, location, company_id, recruiter_id, created_at, updated_at) VALUES 
(8, 'Cybersecurity Analyst', 'FULL_TIME', 'FIXED', 95000, NULL, 'USD', 'ANNUAL', 1, '2024-04-08', 'OPEN', 'We are looking for a Cybersecurity Analyst to protect our digital assets and client information. Experience with security frameworks, threat detection, and incident response is necessary.', 'New York, NY (Onsite)', 2, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO jobs (id, title, job_type, salary_type, min_salary, max_salary, currency, salary_period, number_of_openings, application_deadline, status, description, location, company_id, recruiter_id, created_at, updated_at) VALUES 
(9, 'Investment Banking Analyst', 'FULL_TIME', 'COMPETITIVE', NULL, NULL, 'USD', 'ANNUAL', 4, '2024-03-22', 'OPEN', 'Entry-level position for recent finance graduates. You will support senior bankers in financial modeling, market research, and deal execution.', 'New York, NY (Onsite)', 2, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO jobs (id, title, job_type, salary_type, min_salary, max_salary, currency, salary_period, number_of_openings, application_deadline, status, description, location, company_id, recruiter_id, created_at, updated_at) VALUES 
(10, 'Full Stack Developer - Trading Systems', 'FULL_TIME', 'RANGE', 90000, 130000, 'USD', 'ANNUAL', 2, '2024-04-12', 'OPEN', 'Develop and maintain front-end and back-end components of our trading systems. Experience with React, Node.js, and relational databases is required.', 'New York, NY (Hybrid)', 2, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- GreenEarth Jobs
INSERT INTO jobs (id, title, job_type, salary_type, min_salary, max_salary, currency, salary_period, number_of_openings, application_deadline, status, description, location, company_id, recruiter_id, created_at, updated_at) VALUES 
(11, 'Environmental Data Analyst', 'FULL_TIME', 'FIXED', 75000, NULL, 'USD', 'ANNUAL', 2, '2024-04-18', 'OPEN', 'Analyze environmental data to support our sustainability initiatives. Experience with data analysis tools, GIS systems, and environmental science is required.', 'Portland, OR (Hybrid)', 3, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO jobs (id, title, job_type, salary_type, min_salary, max_salary, currency, salary_period, number_of_openings, application_deadline, status, description, location, company_id, recruiter_id, created_at, updated_at) VALUES 
(12, 'Sustainability Consultant', 'FULL_TIME', 'RANGE', 65000, 90000, 'USD', 'ANNUAL', 3, '2024-03-25', 'OPEN', 'Work with clients to develop and implement sustainability strategies. Background in environmental science or sustainability management is required.', 'Remote', 3, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO jobs (id, title, job_type, salary_type, min_salary, max_salary, currency, salary_period, number_of_openings, application_deadline, status, description, location, company_id, recruiter_id, created_at, updated_at) VALUES 
(13, 'Renewable Energy Engineer', 'FULL_TIME', 'RANGE', 80000, 110000, 'USD', 'ANNUAL', 1, '2024-04-05', 'OPEN', 'Design and implement renewable energy solutions for our clients. Experience with solar, wind, or other renewable technologies is required.', 'Portland, OR (Hybrid)', 3, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO jobs (id, title, job_type, salary_type, min_salary, max_salary, currency, salary_period, number_of_openings, application_deadline, status, description, location, company_id, recruiter_id, created_at, updated_at) VALUES 
(14, 'Sustainable Supply Chain Manager', 'FULL_TIME', 'NEGOTIABLE', NULL, NULL, 'USD', 'ANNUAL', 1, '2024-03-30', 'OPEN', 'Oversee the development of sustainable supply chain practices for our organization and clients. Experience in supply chain management and sustainability initiatives is required.', 'Portland, OR (Onsite)', 3, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO jobs (id, title, job_type, salary_type, min_salary, max_salary, currency, salary_period, number_of_openings, application_deadline, status, description, location, company_id, recruiter_id, created_at, updated_at) VALUES 
(15, 'Environmental Education Coordinator', 'PART_TIME', 'FIXED', 45000, NULL, 'USD', 'ANNUAL', 2, '2024-04-10', 'OPEN', 'Develop and deliver environmental education programs for schools and community organizations. Background in education and environmental science is required.', 'Portland, OR (Hybrid)', 3, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- MediLife Jobs
INSERT INTO jobs (id, title, job_type, salary_type, min_salary, max_salary, currency, salary_period, number_of_openings, application_deadline, status, description, location, company_id, recruiter_id, created_at, updated_at) VALUES 
(16, 'Biomedical Engineer', 'FULL_TIME', 'RANGE', 85000, 115000, 'USD', 'ANNUAL', 2, '2024-04-15', 'OPEN', 'Design and develop medical devices and equipment. Experience with medical technology design and regulatory requirements is necessary.', 'Boston, MA (Onsite)', 4, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO jobs (id, title, job_type, salary_type, min_salary, max_salary, currency, salary_period, number_of_openings, application_deadline, status, description, location, company_id, recruiter_id, created_at, updated_at) VALUES 
(17, 'Clinical Research Coordinator', 'FULL_TIME', 'FIXED', 70000, NULL, 'USD', 'ANNUAL', 3, '2024-03-28', 'OPEN', 'Coordinate and manage clinical trials for new therapies. Experience in clinical research and knowledge of regulatory requirements is required.', 'Boston, MA (Hybrid)', 4, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO jobs (id, title, job_type, salary_type, min_salary, max_salary, currency, salary_period, number_of_openings, application_deadline, status, description, location, company_id, recruiter_id, created_at, updated_at) VALUES 
(18, 'Healthcare Data Scientist', 'FULL_TIME', 'RANGE', 95000, 130000, 'USD', 'ANNUAL', 1, '2024-04-08', 'OPEN', 'Analyze healthcare data to improve patient outcomes and operational efficiency. Experience with healthcare databases, statistical analysis, and machine learning is required.', 'Remote', 4, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO jobs (id, title, job_type, salary_type, min_salary, max_salary, currency, salary_period, number_of_openings, application_deadline, status, description, location, company_id, recruiter_id, created_at, updated_at) VALUES 
(19, 'Pharmaceutical Sales Representative', 'FULL_TIME', 'RANGE', 60000, 90000, 'USD', 'ANNUAL', 4, '2024-03-22', 'OPEN', 'Promote and sell our pharmaceutical products to healthcare providers. Sales experience and knowledge of the healthcare industry is required.', 'Various Locations (Field-Based)', 4, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO jobs (id, title, job_type, salary_type, min_salary, max_salary, currency, salary_period, number_of_openings, application_deadline, status, description, location, company_id, recruiter_id, created_at, updated_at) VALUES 
(20, 'Medical Device Quality Engineer', 'FULL_TIME', 'FIXED', 80000, NULL, 'USD', 'ANNUAL', 2, '2024-04-12', 'OPEN', 'Ensure our medical devices meet quality standards and regulatory requirements. Experience with quality management systems and medical device regulations is necessary.', 'Boston, MA (Onsite)', 4, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Global Logistics Jobs
INSERT INTO jobs (id, title, job_type, salary_type, min_salary, max_salary, currency, salary_period, number_of_openings, application_deadline, status, description, location, company_id, recruiter_id, created_at, updated_at) VALUES 
(21, 'Supply Chain Analyst', 'FULL_TIME', 'RANGE', 65000, 85000, 'USD', 'ANNUAL', 3, '2024-04-20', 'OPEN', 'Analyze supply chain data to identify optimization opportunities. Experience with supply chain analytics and inventory management systems is required.', 'Chicago, IL (Hybrid)', 5, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO jobs (id, title, job_type, salary_type, min_salary, max_salary, currency, salary_period, number_of_openings, application_deadline, status, description, location, company_id, recruiter_id, created_at, updated_at) VALUES 
(22, 'Logistics Coordinator', 'FULL_TIME', 'FIXED', 55000, NULL, 'USD', 'ANNUAL', 4, '2024-03-25', 'OPEN', 'Coordinate shipping, transportation, and delivery operations. Experience with logistics software and freight operations is necessary.', 'Chicago, IL (Onsite)', 5, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO jobs (id, title, job_type, salary_type, min_salary, max_salary, currency, salary_period, number_of_openings, application_deadline, status, description, location, company_id, recruiter_id, created_at, updated_at) VALUES 
(23, 'Transportation Manager', 'FULL_TIME', 'RANGE', 75000, 100000, 'USD', 'ANNUAL', 1, '2024-04-05', 'OPEN', 'Oversee transportation operations and carrier relationships. Experience managing transportation networks and carrier contracts is required.', 'Chicago, IL (Hybrid)', 5, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO jobs (id, title, job_type, salary_type, min_salary, max_salary, currency, salary_period, number_of_openings, application_deadline, status, description, location, company_id, recruiter_id, created_at, updated_at) VALUES 
(24, 'International Trade Specialist', 'FULL_TIME', 'NEGOTIABLE', NULL, NULL, 'USD', 'ANNUAL', 2, '2024-03-30', 'OPEN', 'Manage international shipping and customs compliance. Knowledge of international trade regulations and customs procedures is required.', 'Chicago, IL (Hybrid)', 5, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO jobs (id, title, job_type, salary_type, min_salary, max_salary, currency, salary_period, number_of_openings, application_deadline, status, description, location, company_id, recruiter_id, created_at, updated_at) VALUES 
(25, 'Warehouse Operations Supervisor', 'FULL_TIME', 'FIXED', 60000, NULL, 'USD', 'ANNUAL', 3, '2024-04-10', 'OPEN', 'Supervise warehouse operations, including receiving, storage, and shipping activities. Experience in warehouse management and team leadership is necessary.', 'Multiple Locations', 5, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

ALTER SEQUENCE users_seq RESTART WITH 11;
ALTER SEQUENCE jobs_seq RESTART WITH 26;
ALTER SEQUENCE company_seq RESTART WITH 6;
ALTER SEQUENCE roles_seq RESTART WITH 4;