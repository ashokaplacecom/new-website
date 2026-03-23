-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE verifications.approved_requests (
  request_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  approved_on timestamp with time zone NOT NULL DEFAULT now(),
  poc_note text,
  CONSTRAINT approved_requests_pkey PRIMARY KEY (request_id),
  CONSTRAINT approved_requests_request_id_fkey FOREIGN KEY (request_id) REFERENCES verifications.requests(id)
);
CREATE TABLE verifications.pocs (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  poc_name text,
  email text UNIQUE,
  CONSTRAINT pocs_pkey PRIMARY KEY (id)
);
CREATE TABLE verifications.rejected_requests (
  request_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  rejected_on timestamp with time zone NOT NULL DEFAULT now(),
  poc_note text,
  CONSTRAINT rejected_requests_pkey PRIMARY KEY (request_id),
  CONSTRAINT rejected_requests_request_id_fkey FOREIGN KEY (request_id) REFERENCES verifications.requests(id)
);
CREATE TABLE verifications.requests (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  request date timestamp with time zone NOT NULL DEFAULT now(),
  student bigint,
  status USER-DEFINED,
  student_message text,
  is_emergency boolean NOT NULL DEFAULT false,
  CONSTRAINT requests_pkey PRIMARY KEY (id),
  CONSTRAINT requests_student_fkey FOREIGN KEY (student) REFERENCES public.Students(id)
);