--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5 (Debian 17.5-1.pgdg120+1)
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: analysis; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.analysis (
    score real NOT NULL,
    created_at timestamp(6) without time zone,
    id bigint NOT NULL,
    match_skills character varying(255),
    missing_skills character varying(255)
);


ALTER TABLE public.analysis OWNER TO postgres;

--
-- Name: analysis_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.analysis_seq
    START WITH 1
    INCREMENT BY 50
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.analysis_seq OWNER TO postgres;

--
-- Name: application; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.application (
    analysis_id bigint,
    candidate_id bigint,
    created_at timestamp(6) without time zone,
    cv_id bigint,
    id bigint NOT NULL,
    job_id bigint
);


ALTER TABLE public.application OWNER TO postgres;

--
-- Name: application_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.application_seq
    START WITH 1
    INCREMENT BY 50
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.application_seq OWNER TO postgres;

--
-- Name: candidate; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.candidate (
    created_at timestamp(6) without time zone,
    deleted_at timestamp(6) without time zone,
    id bigint NOT NULL,
    updated_at timestamp(6) without time zone,
    user_id bigint,
    created_by character varying(255),
    full_name character varying(255) NOT NULL,
    phone_number character varying(255),
    updated_by character varying(255)
);


ALTER TABLE public.candidate OWNER TO postgres;

--
-- Name: candidate_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.candidate_seq
    START WITH 1
    INCREMENT BY 50
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.candidate_seq OWNER TO postgres;

--
-- Name: company; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.company (
    created_at timestamp(6) without time zone,
    deleted_at timestamp(6) without time zone,
    id bigint NOT NULL,
    updated_at timestamp(6) without time zone,
    address character varying(255) NOT NULL,
    company_size character varying(255) NOT NULL,
    created_by character varying(255),
    email character varying(255),
    industry character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    phone_number character varying(255),
    updated_by character varying(255),
    website character varying(255)
);


ALTER TABLE public.company OWNER TO postgres;

--
-- Name: company_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.company_seq
    START WITH 1
    INCREMENT BY 50
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.company_seq OWNER TO postgres;

--
-- Name: cv; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cv (
    created_at timestamp(6) without time zone,
    deleted_at timestamp(6) without time zone,
    id bigint NOT NULL,
    updated_at timestamp(6) without time zone,
    created_by character varying(255),
    file_path character varying(255),
    updated_by character varying(255),
    content oid
);


ALTER TABLE public.cv OWNER TO postgres;

--
-- Name: cv_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cv_seq
    START WITH 1
    INCREMENT BY 50
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cv_seq OWNER TO postgres;

--
-- Name: job; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job (
    is_active boolean,
    number_of_openings integer NOT NULL,
    salary double precision NOT NULL,
    created_at timestamp(6) without time zone,
    deleted_at timestamp(6) without time zone,
    recruiter_id bigint,
    updated_at timestamp(6) without time zone,
    company_id uuid,
    id uuid NOT NULL,
    created_by character varying(255),
    "position" character varying(255) NOT NULL,
    title character varying(255) NOT NULL,
    updated_by character varying(255),
    description oid
);


ALTER TABLE public.job OWNER TO postgres;

--
-- Name: jobs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jobs (
    is_active boolean,
    number_of_openings integer NOT NULL,
    salary double precision NOT NULL,
    company_id bigint,
    created_at timestamp(6) without time zone,
    deleted_at timestamp(6) without time zone,
    id bigint NOT NULL,
    recruiter_id bigint,
    updated_at timestamp(6) without time zone,
    created_by character varying(255),
    "position" character varying(255) NOT NULL,
    title character varying(255) NOT NULL,
    updated_by character varying(255),
    description oid
);


ALTER TABLE public.jobs OWNER TO postgres;

--
-- Name: jobs_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.jobs_seq
    START WITH 1
    INCREMENT BY 50
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.jobs_seq OWNER TO postgres;

--
-- Name: recruiter; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.recruiter (
    company_id bigint,
    created_at timestamp(6) without time zone,
    deleted_at timestamp(6) without time zone,
    id bigint NOT NULL,
    updated_at timestamp(6) without time zone,
    user_id bigint,
    created_by character varying(255),
    full_name character varying(255) NOT NULL,
    phone_number character varying(255),
    updated_by character varying(255)
);


ALTER TABLE public.recruiter OWNER TO postgres;

--
-- Name: recruiter_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.recruiter_seq
    START WITH 1
    INCREMENT BY 50
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.recruiter_seq OWNER TO postgres;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id bigint NOT NULL,
    name character varying(255),
    CONSTRAINT roles_name_check CHECK (((name)::text = ANY ((ARRAY['ROLE_CANDIDATE'::character varying, 'ROLE_RECRUITER'::character varying, 'ROLE_ADMIN'::character varying])::text[])))
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: roles_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_seq
    START WITH 1
    INCREMENT BY 50
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_seq OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    is_active boolean,
    created_at timestamp(6) without time zone,
    deleted_at timestamp(6) without time zone,
    id bigint NOT NULL,
    role_id bigint,
    updated_at timestamp(6) without time zone,
    created_by character varying(255),
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    updated_by character varying(255)
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_seq
    START WITH 1
    INCREMENT BY 50
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_seq OWNER TO postgres;

--
-- Data for Name: analysis; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: application; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: candidate; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.candidate (created_at, deleted_at, id, updated_at, user_id, created_by, full_name, phone_number, updated_by) VALUES ('2025-06-05 13:04:23.464139', NULL, 1, '2025-06-05 13:04:23.464139', 3, 'anonymous', 'Candidate', '1234567890', 'anonymous');


--
-- Data for Name: company; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: cv; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: job; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: recruiter; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.recruiter (company_id, created_at, deleted_at, id, updated_at, user_id, created_by, full_name, phone_number, updated_by) VALUES (NULL, '2025-06-05 13:04:23.33425', NULL, 1, '2025-06-05 13:04:23.33425', 2, 'anonymous', 'Recruiter', '1234567890', 'anonymous');


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.roles (id, name) VALUES (1, 'ROLE_CANDIDATE');
INSERT INTO public.roles (id, name) VALUES (2, 'ROLE_RECRUITER');
INSERT INTO public.roles (id, name) VALUES (3, 'ROLE_ADMIN');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.users (is_active, created_at, deleted_at, id, role_id, updated_at, created_by, email, password, updated_by) VALUES (true, '2025-06-05 13:04:23.216025', NULL, 1, 3, '2025-06-05 13:04:23.216025', 'anonymous', 'admin@gmail.com', '$2a$10$4M3JIPKqrTBZYkhCVgCiL.06eN3YEvYDJO7RUYNmO.d0jb9CHacaO', 'anonymous');
INSERT INTO public.users (is_active, created_at, deleted_at, id, role_id, updated_at, created_by, email, password, updated_by) VALUES (true, '2025-06-05 13:04:23.317889', NULL, 2, 2, '2025-06-05 13:04:23.317889', 'anonymous', 'recruiter@gmail.com', '$2a$10$73gGyJs0znUqHeQj0RH.xOxCNjVj9nSrmzlgNlqf6trZ6KMAVPt.q', 'anonymous');
INSERT INTO public.users (is_active, created_at, deleted_at, id, role_id, updated_at, created_by, email, password, updated_by) VALUES (true, '2025-06-05 13:04:23.449691', NULL, 3, 1, '2025-06-05 13:04:23.449691', 'anonymous', 'candidate@gmail.com', '$2a$10$LOMxl9bwwjGy08QLLjt4T.4PMSZbKFzubLENAAvo6BES1HOfpnq6e', 'anonymous');


--
-- Name: analysis_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.analysis_seq', 1, false);


--
-- Name: application_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.application_seq', 1, false);


--
-- Name: candidate_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.candidate_seq', 1, true);


--
-- Name: company_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.company_seq', 1, false);


--
-- Name: cv_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cv_seq', 1, false);


--
-- Name: jobs_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.jobs_seq', 1, false);


--
-- Name: recruiter_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.recruiter_seq', 1, true);


--
-- Name: roles_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_seq', 51, true);


--
-- Name: users_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_seq', 51, true);


--
-- Name: analysis analysis_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analysis
    ADD CONSTRAINT analysis_pkey PRIMARY KEY (id);


--
-- Name: application application_analysis_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application
    ADD CONSTRAINT application_analysis_id_key UNIQUE (analysis_id);


--
-- Name: application application_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application
    ADD CONSTRAINT application_pkey PRIMARY KEY (id);


--
-- Name: candidate candidate_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidate
    ADD CONSTRAINT candidate_pkey PRIMARY KEY (id);


--
-- Name: candidate candidate_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidate
    ADD CONSTRAINT candidate_user_id_key UNIQUE (user_id);


--
-- Name: company company_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company
    ADD CONSTRAINT company_pkey PRIMARY KEY (id);


--
-- Name: cv cv_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cv
    ADD CONSTRAINT cv_pkey PRIMARY KEY (id);


--
-- Name: job job_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job
    ADD CONSTRAINT job_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: recruiter recruiter_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recruiter
    ADD CONSTRAINT recruiter_pkey PRIMARY KEY (id);


--
-- Name: recruiter recruiter_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recruiter
    ADD CONSTRAINT recruiter_user_id_key UNIQUE (user_id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: jobs fk8iswonhqfsk0uppjop11y0004; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT fk8iswonhqfsk0uppjop11y0004 FOREIGN KEY (recruiter_id) REFERENCES public.recruiter(id);


--
-- Name: recruiter fk9rnqhy06sgckkvbqukip27b81; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recruiter
    ADD CONSTRAINT fk9rnqhy06sgckkvbqukip27b81 FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: application fkblh7clgv7im3poxncotven9ue; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application
    ADD CONSTRAINT fkblh7clgv7im3poxncotven9ue FOREIGN KEY (job_id) REFERENCES public.jobs(id);


--
-- Name: application fkc1nsatrpy31m27gn3bm49kpk2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application
    ADD CONSTRAINT fkc1nsatrpy31m27gn3bm49kpk2 FOREIGN KEY (cv_id) REFERENCES public.cv(id);


--
-- Name: candidate fkc23nbdgfce6rnt56ofltvxu71; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidate
    ADD CONSTRAINT fkc23nbdgfce6rnt56ofltvxu71 FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: recruiter fke5tll0cw7cnohojpxb8qjcr5y; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recruiter
    ADD CONSTRAINT fke5tll0cw7cnohojpxb8qjcr5y FOREIGN KEY (company_id) REFERENCES public.company(id);


--
-- Name: application fkgj6l06j10b3sv83rvsnmei78a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application
    ADD CONSTRAINT fkgj6l06j10b3sv83rvsnmei78a FOREIGN KEY (candidate_id) REFERENCES public.candidate(id);


--
-- Name: application fkkij6qijf9k43ixvfti6v6013q; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application
    ADD CONSTRAINT fkkij6qijf9k43ixvfti6v6013q FOREIGN KEY (analysis_id) REFERENCES public.analysis(id);


--
-- Name: jobs fkkvqdntcagcst2hudgj1u8x443; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT fkkvqdntcagcst2hudgj1u8x443 FOREIGN KEY (company_id) REFERENCES public.company(id);


--
-- Name: users fkp56c1712k691lhsyewcssf40f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fkp56c1712k691lhsyewcssf40f FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- PostgreSQL database dump complete
--

