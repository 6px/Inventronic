
CREATE TABLE public.locations (
    id uuid not null default gen_random_uuid(),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    name character varying,
    description text,
    owner_id uuid DEFAULT auth.uid(),
    parent_id uuid
);


--
-- Name: parts; Type: TABLE; Schema: public; Owner: supabase_admin
--

CREATE TABLE public.parts (
    id uuid not null default gen_random_uuid(),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    value character varying,
    description text,
    footprint character varying,
    quantity bigint,
    min_quantity bigint,
    owner_id uuid DEFAULT auth.uid(),
    location_id uuid,
    part character varying,
    ordering_url text,
    price numeric
);


--
-- Name: project_parts; Type: TABLE; Schema: public; Owner: supabase_admin
--

CREATE TABLE public.project_parts (
    id uuid not null default gen_random_uuid(),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    project_id uuid,
    part_id uuid,
    quantity bigint,
    references text,
    owner_id uuid DEFAULT auth.uid()
);


COMMENT ON TABLE public.project_parts IS 'link table between projects and parts';

--
-- Name: projects; Type: TABLE; Schema: public; Owner: supabase_admin
--

CREATE TABLE public.projects (
    id uuid not null default gen_random_uuid(),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    name text,
    description text,
    url text,
    owner_id uuid DEFAULT auth.uid()
);



--
-- Name: locations locations_pkey; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_pkey PRIMARY KEY (id);


--
-- Name: parts parts_pkey; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.parts
    ADD CONSTRAINT parts_pkey PRIMARY KEY (id);


--
-- Name: project_parts project_parts_pkey; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.project_parts
    ADD CONSTRAINT project_parts_pkey PRIMARY KEY (id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: parts_value_part_owner_id_footprint_idx; Type: INDEX; Schema: public; Owner: supabase_admin
--

CREATE UNIQUE INDEX parts_value_part_owner_id_footprint_idx ON public.parts USING btree (value, part, owner_id, footprint);


--
-- Name: locations locations_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: locations locations_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.locations(id);


--
-- Name: parts parts_location_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.parts
    ADD CONSTRAINT parts_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.locations(id) ON DELETE SET NULL;


--
-- Name: parts parts_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.parts
    ADD CONSTRAINT parts_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: project_parts project_parts_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.project_parts
    ADD CONSTRAINT project_parts_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: project_parts project_parts_part_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.project_parts
    ADD CONSTRAINT project_parts_part_id_fkey FOREIGN KEY (part_id) REFERENCES public.parts(id) ON DELETE CASCADE;


--
-- Name: project_parts project_parts_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.project_parts
    ADD CONSTRAINT project_parts_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: projects projects_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: locations Enable all for users based on owner_id; Type: POLICY; Schema: public; Owner: supabase_admin
--

CREATE POLICY "Enable all for users based on owner_id" ON public.locations USING ((auth.uid() = owner_id));


--
-- Name: parts Enable all for users based on owner_id; Type: POLICY; Schema: public; Owner: supabase_admin
--

CREATE POLICY "Enable all for users based on owner_id" ON public.parts USING ((auth.uid() = owner_id));


--
-- Name: projects Enable all for users based on user_id; Type: POLICY; Schema: public; Owner: supabase_admin
--

CREATE POLICY "Enable all for users based on user_id" ON public.projects USING ((auth.uid() = owner_id));


--
-- Name: project_parts Enable delete for users based on user_id; Type: POLICY; Schema: public; Owner: supabase_admin
--

CREATE POLICY "Enable delete for users based on user_id" ON public.project_parts USING ((auth.uid() = owner_id));


--
-- Name: locations; Type: ROW SECURITY; Schema: public; Owner: supabase_admin
--

ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

--
-- Name: parts; Type: ROW SECURITY; Schema: public; Owner: supabase_admin
--

ALTER TABLE public.parts ENABLE ROW LEVEL SECURITY;

--
-- Name: project_parts; Type: ROW SECURITY; Schema: public; Owner: supabase_admin
--

ALTER TABLE public.project_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: projects; Type: ROW SECURITY; Schema: public; Owner: supabase_admin
--

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
