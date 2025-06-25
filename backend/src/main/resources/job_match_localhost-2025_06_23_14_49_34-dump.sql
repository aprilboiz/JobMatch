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
    id bigint NOT NULL,
    created_at timestamp(6) without time zone,
    match_skills character varying(255),
    missing_skills character varying(255),
    score real NOT NULL
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
    id bigint NOT NULL,
    created_at timestamp(6) without time zone,
    created_by character varying(255),
    deleted_at timestamp(6) without time zone,
    updated_at timestamp(6) without time zone,
    updated_by character varying(255),
    status character varying(255),
    analysis_id bigint,
    candidate_id bigint,
    cv_id bigint,
    job_id bigint,
    CONSTRAINT application_status_check CHECK (((status)::text = ANY ((ARRAY['APPLIED'::character varying, 'IN_REVIEW'::character varying, 'INTERVIEW'::character varying, 'OFFERED'::character varying, 'REJECTED'::character varying, 'WITHDRAWN'::character varying])::text[])))
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
    id bigint NOT NULL
);


ALTER TABLE public.candidate OWNER TO postgres;

--
-- Name: company; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.company (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone,
    created_by character varying(255),
    deleted_at timestamp(6) without time zone,
    updated_at timestamp(6) without time zone,
    updated_by character varying(255),
    address character varying(255) NOT NULL,
    company_size character varying(255) NOT NULL,
    description character varying(255),
    email character varying(255),
    industry character varying(255) NOT NULL,
    logo_url character varying(255),
    name character varying(255) NOT NULL,
    phone_number character varying(255),
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
    id bigint NOT NULL,
    created_at timestamp(6) without time zone,
    created_by character varying(255),
    deleted_at timestamp(6) without time zone,
    updated_at timestamp(6) without time zone,
    updated_by character varying(255),
    file_name character varying(255),
    file_path character varying(255),
    file_size character varying(255),
    file_type character varying(255),
    candidate_id bigint
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
-- Name: jobs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jobs (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone,
    created_by character varying(255),
    deleted_at timestamp(6) without time zone,
    updated_at timestamp(6) without time zone,
    updated_by character varying(255),
    application_deadline date NOT NULL,
    currency character varying(255),
    description oid,
    job_type character varying(255) NOT NULL,
    location character varying(255),
    max_salary numeric(38,2),
    min_salary numeric(38,2),
    number_of_openings integer NOT NULL,
    salary_period character varying(255),
    salary_type character varying(255) NOT NULL,
    status character varying(255),
    title character varying(255) NOT NULL,
    company_id bigint,
    recruiter_id bigint,
    CONSTRAINT jobs_currency_check CHECK (((currency)::text = ANY ((ARRAY['USD'::character varying, 'VND'::character varying, 'EUR'::character varying, 'GBP'::character varying, 'JPY'::character varying, 'AUD'::character varying, 'CAD'::character varying])::text[]))),
    CONSTRAINT jobs_job_type_check CHECK (((job_type)::text = ANY ((ARRAY['FULL_TIME'::character varying, 'PART_TIME'::character varying, 'INTERNSHIP'::character varying, 'CONTRACT'::character varying, 'REMOTE'::character varying])::text[]))),
    CONSTRAINT jobs_salary_period_check CHECK (((salary_period)::text = ANY ((ARRAY['ANNUAL'::character varying, 'MONTHLY'::character varying, 'WEEKLY'::character varying, 'HOURLY'::character varying])::text[]))),
    CONSTRAINT jobs_salary_type_check CHECK (((salary_type)::text = ANY ((ARRAY['FIXED'::character varying, 'RANGE'::character varying, 'NEGOTIABLE'::character varying, 'COMPETITIVE'::character varying])::text[]))),
    CONSTRAINT jobs_status_check CHECK (((status)::text = ANY ((ARRAY['OPEN'::character varying, 'CLOSED'::character varying, 'EXPIRED'::character varying])::text[])))
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
    id bigint NOT NULL,
    company_id bigint
);


ALTER TABLE public.recruiter OWNER TO postgres;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id bigint NOT NULL,
    name character varying(255),
    CONSTRAINT roles_name_check CHECK (((name)::text = ANY ((ARRAY['ADMIN'::character varying, 'CANDIDATE'::character varying, 'RECRUITER'::character varying])::text[])))
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
    user_type character varying(31) NOT NULL,
    id bigint NOT NULL,
    created_at timestamp(6) without time zone,
    created_by character varying(255),
    deleted_at timestamp(6) without time zone,
    updated_at timestamp(6) without time zone,
    updated_by character varying(255),
    avatar_url character varying(255),
    email character varying(255) NOT NULL,
    full_name character varying(255) NOT NULL,
    is_active boolean,
    password character varying(255) NOT NULL,
    phone_number character varying(255),
    role_id bigint
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
-- Name: 42662; Type: BLOB METADATA; Schema: -; Owner: postgres
--

SELECT pg_catalog.lo_create('42662');

ALTER LARGE OBJECT 42662 OWNER TO postgres;

--
-- Data for Name: analysis; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.analysis (id, created_at, match_skills, missing_skills, score) FROM stdin;
\.


--
-- Data for Name: application; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.application (id, created_at, created_by, deleted_at, updated_at, updated_by, status, analysis_id, candidate_id, cv_id, job_id) FROM stdin;
\.


--
-- Data for Name: candidate; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.candidate (id) FROM stdin;
\.


--
-- Data for Name: company; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.company (id, created_at, created_by, deleted_at, updated_at, updated_by, address, company_size, description, email, industry, logo_url, name, phone_number, website) FROM stdin;
\.


--
-- Data for Name: cv; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cv (id, created_at, created_by, deleted_at, updated_at, updated_by, file_name, file_path, file_size, file_type, candidate_id) FROM stdin;
\.


--
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jobs (id, created_at, created_by, deleted_at, updated_at, updated_by, application_deadline, currency, description, job_type, location, max_salary, min_salary, number_of_openings, salary_period, salary_type, status, title, company_id, recruiter_id) FROM stdin;
\.


--
-- Data for Name: recruiter; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.recruiter (id, company_id) FROM stdin;
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, name) FROM stdin;
1	CANDIDATE
2	RECRUITER
3	ADMIN
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (user_type, id, created_at, created_by, deleted_at, updated_at, updated_by, avatar_url, email, full_name, is_active, password, phone_number, role_id) FROM stdin;
\.


--
-- Name: analysis_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.analysis_seq', 1, false);


--
-- Name: application_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.application_seq', 1, false);


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
-- Name: roles_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_seq', 1, false);


--
-- Name: users_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_seq', 1, false);


--
-- Data for Name: 42662; Type: BLOBS; Schema: -; Owner: postgres
--

BEGIN;

SELECT pg_catalog.lo_open('42662', 131072);
SELECT pg_catalog.lowrite(0, '\x576520617265206c6f6f6b696e6720666f7220612053656e696f7220536f66747761726520456e67696e6565722e2e2e');
SELECT pg_catalog.lo_close(0);

COMMIT;

--
-- Name: analysis analysis_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analysis
    ADD CONSTRAINT analysis_pkey PRIMARY KEY (id);


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
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: users uk6dotkott2kjsp8vw4d0m25fb7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT uk6dotkott2kjsp8vw4d0m25fb7 UNIQUE (email);


--
-- Name: application uku7ojbxmo4btw2ajkqck6srek; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application
    ADD CONSTRAINT uku7ojbxmo4btw2ajkqck6srek UNIQUE (analysis_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: cv fk7c9mplioa4397rxb4uoryla9a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cv
    ADD CONSTRAINT fk7c9mplioa4397rxb4uoryla9a FOREIGN KEY (candidate_id) REFERENCES public.candidate(id);


--
-- Name: jobs fk8iswonhqfsk0uppjop11y0004; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT fk8iswonhqfsk0uppjop11y0004 FOREIGN KEY (recruiter_id) REFERENCES public.recruiter(id);


--
-- Name: recruiter fkb7kn9164x235a632vpsuijqwk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recruiter
    ADD CONSTRAINT fkb7kn9164x235a632vpsuijqwk FOREIGN KEY (id) REFERENCES public.users(id);


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
-- Name: candidate fkoptch312fkujpa59anarcj8tk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidate
    ADD CONSTRAINT fkoptch312fkujpa59anarcj8tk FOREIGN KEY (id) REFERENCES public.users(id);


--
-- Name: users fkp56c1712k691lhsyewcssf40f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fkp56c1712k691lhsyewcssf40f FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- PostgreSQL database dump complete
--

