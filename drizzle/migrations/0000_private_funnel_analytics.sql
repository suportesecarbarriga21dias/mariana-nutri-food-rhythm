CREATE TYPE public.app_role AS ENUM ('admin');
CREATE TABLE public.profiles (id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE, display_name text NOT NULL DEFAULT '', avatar_url text, created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT, UPDATE ON public.profiles TO authenticated; GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_profile_read ON public.profiles FOR SELECT TO authenticated USING (id=auth.uid());
CREATE POLICY own_profile_update ON public.profiles FOR UPDATE TO authenticated USING (id=auth.uid()) WITH CHECK (id=auth.uid());
CREATE TABLE public.user_roles (user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE, role public.app_role NOT NULL);
GRANT SELECT ON public.user_roles TO authenticated; GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_role ON public.user_roles FOR SELECT TO authenticated USING (user_id=auth.uid());
CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT EXISTS(SELECT 1 FROM public.user_roles r JOIN auth.users u ON u.id=r.user_id WHERE r.user_id=_user_id AND r.role=_role AND lower(u.email)='suportesecarbarriga21dias@gmail.com' AND u.email_confirmed_at IS NOT NULL); $$;
REVOKE ALL ON FUNCTION public.has_role(uuid,public.app_role) FROM PUBLIC; GRANT EXECUTE ON FUNCTION public.has_role(uuid,public.app_role) TO authenticated,service_role;
CREATE FUNCTION public.create_admin_profile() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN INSERT INTO public.profiles(id) VALUES(NEW.id) ON CONFLICT DO NOTHING; IF lower(NEW.email)='suportesecarbarriga21dias@gmail.com' AND NEW.email_confirmed_at IS NOT NULL THEN INSERT INTO public.user_roles(user_id,role) VALUES(NEW.id,'admin') ON CONFLICT DO NOTHING; END IF; RETURN NEW; END; $$;
REVOKE ALL ON FUNCTION public.create_admin_profile() FROM PUBLIC;
CREATE TRIGGER admin_profile_on_auth AFTER INSERT OR UPDATE OF email_confirmed_at,email ON auth.users FOR EACH ROW EXECUTE FUNCTION public.create_admin_profile();
CREATE TABLE public.analytics_sessions (id uuid PRIMARY KEY, visitor_id uuid NOT NULL, capability_hash text NOT NULL, entered_at timestamptz NOT NULL DEFAULT now(), last_activity timestamptz NOT NULL DEFAULT now(), entry_page text NOT NULL, referrer_host text NOT NULL DEFAULT '', device text NOT NULL, utm_source text NOT NULL DEFAULT '', utm_medium text NOT NULL DEFAULT '', utm_campaign text NOT NULL DEFAULT '', utm_content text NOT NULL DEFAULT '', utm_term text NOT NULL DEFAULT '', consent_version text NOT NULL DEFAULT '1');
GRANT SELECT ON public.analytics_sessions TO authenticated; GRANT ALL ON public.analytics_sessions TO service_role;
ALTER TABLE public.analytics_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY admin_sessions ON public.analytics_sessions FOR SELECT TO authenticated USING(public.has_role(auth.uid(),'admin'));
CREATE TABLE public.analytics_events (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), session_id uuid NOT NULL REFERENCES public.analytics_sessions(id) ON DELETE CASCADE, event_key text NOT NULL, name text NOT NULL, step integer, occurred_at timestamptz NOT NULL DEFAULT now(), UNIQUE(session_id,event_key));
GRANT SELECT ON public.analytics_events TO authenticated; GRANT ALL ON public.analytics_events TO service_role;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY admin_events ON public.analytics_events FOR SELECT TO authenticated USING(public.has_role(auth.uid(),'admin'));
CREATE INDEX analytics_event_session_time ON public.analytics_events(session_id,occurred_at);
CREATE INDEX analytics_session_time ON public.analytics_sessions(entered_at);
CREATE FUNCTION public.record_journey(p_session uuid,p_visitor uuid,p_capability uuid,p_meta jsonb,p_events jsonb) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,extensions AS $$
DECLARE e jsonb; h text; n text; st integer; existing text;
BEGIN
 IF jsonb_typeof(p_events)<>'array' OR jsonb_array_length(p_events)>20 OR length(p_meta::text)>2500 THEN RAISE EXCEPTION 'Invalid batch'; END IF;
 h:=encode(digest(p_capability::text,'sha256'),'hex');
 INSERT INTO public.analytics_sessions(id,visitor_id,capability_hash,entry_page,referrer_host,device,utm_source,utm_medium,utm_campaign,utm_content,utm_term)
 VALUES(p_session,p_visitor,h,CASE WHEN p_meta->>'entry_page'='/receitas' THEN '/receitas' ELSE '/' END,left(coalesce(p_meta->>'referrer_host',''),120),CASE WHEN p_meta->>'device' IN ('mobile','tablet','desktop') THEN p_meta->>'device' ELSE 'unknown' END,left(coalesce(p_meta->>'utm_source',''),80),left(coalesce(p_meta->>'utm_medium',''),80),left(coalesce(p_meta->>'utm_campaign',''),80),left(coalesce(p_meta->>'utm_content',''),80),left(coalesce(p_meta->>'utm_term',''),80)) ON CONFLICT DO NOTHING;
 SELECT capability_hash INTO existing FROM public.analytics_sessions WHERE id=p_session FOR UPDATE;
 IF existing IS DISTINCT FROM h THEN RAISE EXCEPTION 'Unauthorized session'; END IF;
 IF (SELECT count(*) FROM public.analytics_events WHERE session_id=p_session)>500 THEN RAISE EXCEPTION 'Session limit'; END IF;
 FOR e IN SELECT value FROM jsonb_array_elements(p_events) LOOP
 n:=e->>'name'; st:=(e->>'step')::integer;
 IF n NOT IN ('intro_viewed','start_clicked','questions_started','question_viewed','question_answered','question_advanced','question_returned','last_question_viewed','quiz_completed','result_viewed','recipes_presented','recipes_page_viewed','redemption_clicked','whatsapp_clicked','full_product_clicked') OR (st IS NOT NULL AND (st<1 OR st>100)) OR length(e->>'key')>100 OR e->>'key' IS NULL THEN RAISE EXCEPTION 'Invalid event'; END IF;
 INSERT INTO public.analytics_events(session_id,event_key,name,step) VALUES(p_session,e->>'key',n,st) ON CONFLICT DO NOTHING;
 END LOOP;
 UPDATE public.analytics_sessions SET last_activity=now() WHERE id=p_session;
 RETURN true;
END; $$;
REVOKE ALL ON FUNCTION public.record_journey(uuid,uuid,uuid,jsonb,jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_journey(uuid,uuid,uuid,jsonb,jsonb) TO anon,authenticated;
CREATE FUNCTION public.erase_journey(p_session uuid,p_capability uuid) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,extensions AS $$ BEGIN DELETE FROM public.analytics_sessions WHERE id=p_session AND capability_hash=encode(digest(p_capability::text,'sha256'),'hex'); RETURN true; END; $$;
REVOKE ALL ON FUNCTION public.erase_journey(uuid,uuid) FROM PUBLIC; GRANT EXECUTE ON FUNCTION public.erase_journey(uuid,uuid) TO anon,authenticated;