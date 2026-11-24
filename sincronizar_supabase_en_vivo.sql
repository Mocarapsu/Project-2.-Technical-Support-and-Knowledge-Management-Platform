-- ====================================================================
-- RIALSA: HABILITAR SINCRONIZACIÓN EN VIVO ENTRE COMPUTADORAS (SUPABASE)
-- Ejecutar en el SQL Editor de Supabase (https://pedgmulkxdrnpdlzwscr.supabase.co)
-- ====================================================================

-- 1. Dar permisos a anon y authenticated para leer y escribir tickets
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON TABLE public.users TO anon, authenticated;
GRANT ALL ON TABLE public.technicians TO anon, authenticated;
GRANT ALL ON TABLE public.tickets TO anon, authenticated;
GRANT ALL ON TABLE public.notifications TO anon, authenticated;

-- 2. Crear políticas permisivas RLS para que todas las computadoras compartan los mismos tickets
DROP POLICY IF EXISTS "Anon full access tickets" ON public.tickets;
CREATE POLICY "Anon full access tickets" ON public.tickets FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon full access users" ON public.users;
CREATE POLICY "Anon full access users" ON public.users FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon full access technicians" ON public.technicians;
CREATE POLICY "Anon full access technicians" ON public.technicians FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon full access notifications" ON public.notifications;
CREATE POLICY "Anon full access notifications" ON public.notifications FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
