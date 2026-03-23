-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.audit_trail (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  action text NOT NULL,
  user_id bigint,
  metadata jsonb,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT audit_trail_pkey PRIMARY KEY (id),
  CONSTRAINT audit_trail_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.students(id)
);
CREATE TABLE public.students (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  name text,
  email text UNIQUE,
  program text,
  emergencies_remaining smallint DEFAULT '3'::smallint,
  poc bigint,
  otp integer,
  otp_expiry timestamp with time zone,
  CONSTRAINT students_pkey PRIMARY KEY (id),
  CONSTRAINT Students_poc_fkey FOREIGN KEY (poc) REFERENCES verifications.pocs(id)
);