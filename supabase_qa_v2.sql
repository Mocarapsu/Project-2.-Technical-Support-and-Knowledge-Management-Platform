-- RIALSA QA V2. Ejecutar desde SQL Editor de Supabase como propietario.
-- Copia de seguridad previa. No elimina tickets. No crea contraseñas ni cuentas Auth.
BEGIN;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS auth_user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.users ALTER COLUMN password SET DEFAULT '';
UPDATE public.users SET password='' WHERE password<>'';
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS solicitante_id text REFERENCES public.users(id);
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS descripcion text;
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS contexto_ia text;
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS sla_deadline timestamptz;
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS resolved_at timestamptz;
UPDATE public.tickets t SET solicitante_id=u.id FROM public.users u WHERE t.solicitante_id IS NULL AND lower(trim(t.solicitante))=lower(trim(u.nombre)) AND (SELECT count(*) FROM public.users x WHERE lower(trim(x.nombre))=lower(trim(t.solicitante)))=1;
UPDATE public.tickets SET prioridad=CASE lower(trim(prioridad)) WHEN 'crítica' THEN 'Crítica' WHEN 'alta' THEN 'Alta' WHEN 'media' THEN 'Media' WHEN 'baja' THEN 'Baja' ELSE 'No especificada' END;
UPDATE public.tickets SET categoria=CASE lower(trim(categoria)) WHEN 'red' THEN 'Redes' WHEN 'redes' THEN 'Redes' WHEN 'red y conectividad' THEN 'Redes' WHEN 'acceso' THEN 'Acceso' WHEN 'acceso y credenciales' THEN 'Acceso' WHEN 'software' THEN 'Software' WHEN 'software y aplicaciones' THEN 'Software' WHEN 'hardware' THEN 'Hardware' WHEN 'hardware y equipos' THEN 'Hardware' ELSE coalesce(nullif(trim(categoria),''),'Sin categoría') END;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access users" ON public.users;
DROP POLICY IF EXISTS "Public full access technicians" ON public.technicians;
DROP POLICY IF EXISTS "Public full access tickets" ON public.tickets;
DROP POLICY IF EXISTS "Public full access notifications" ON public.notifications;
REVOKE ALL ON public.users,public.technicians,public.tickets,public.notifications FROM PUBLIC,anon,authenticated;

CREATE OR REPLACE FUNCTION public.rialsa_actor() RETURNS public.users
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,public AS $$
DECLARE a public.users%ROWTYPE;
BEGIN
 SELECT * INTO a FROM public.users WHERE auth_user_id=auth.uid() AND estado='Activo' AND rol IN ('admin','tecnico','empleado');
 IF NOT FOUND THEN RAISE EXCEPTION 'Perfil no autorizado' USING ERRCODE='42501'; END IF;
 RETURN a;
END; $$;
CREATE OR REPLACE FUNCTION public.rialsa_profile() RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,public AS $$
DECLARE a public.users%ROWTYPE; au auth.users%ROWTYPE; mail text; display_name text;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Autenticación requerida' USING ERRCODE='42501'; END IF;
 SELECT * INTO a FROM public.users WHERE auth_user_id=auth.uid();
 IF NOT FOUND THEN
  SELECT * INTO au FROM auth.users WHERE id=auth.uid();
  mail:=lower(au.email);
  IF au.email_confirmed_at IS NULL OR mail IS NULL OR mail !~ '^[^@]+@(gid\.com\.mx|delnorte\.com\.mx)$' THEN RAISE EXCEPTION 'Correo institucional sin verificar' USING ERRCODE='42501'; END IF;
  IF EXISTS(SELECT 1 FROM public.users WHERE lower(email)=mail) THEN RAISE EXCEPTION 'El administrador debe vincular este perfil existente a Supabase Auth' USING ERRCODE='42501'; END IF;
  display_name:=left(coalesce(nullif(trim(au.raw_user_meta_data->>'nombre'),''),split_part(mail,'@',1)),120);
  INSERT INTO public.users(id,nombre,email,rol,departamento,estado,fecha_registro,password,auth_user_id)
  VALUES('USR-'||replace(au.id::text,'-',''),display_name,mail,'empleado','Solicitantes','Activo',to_char(now(),'YYYY-MM-DD'),'',au.id) RETURNING * INTO a;
 END IF;
 IF a.estado<>'Activo' OR a.rol NOT IN ('admin','tecnico','empleado') THEN RAISE EXCEPTION 'Perfil no autorizado' USING ERRCODE='42501'; END IF;
 RETURN jsonb_build_object('id',a.id,'nombre',a.nombre,'email',a.email,'rol',a.rol,'departamento',a.departamento,'estado',a.estado,'fechaRegistro',a.fecha_registro);
END; $$;
CREATE OR REPLACE FUNCTION public.rialsa_workspace() RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,public AS $$
DECLARE a public.users%ROWTYPE; tt jsonb; tech jsonb; nt jsonb;
BEGIN
 a:=public.rialsa_actor();
 SELECT coalesce(jsonb_agg(CASE WHEN a.rol='empleado' THEN to_jsonb(t)-'notas_internas'-'historial_auditoria' ELSE to_jsonb(t) END ORDER BY t.created_at DESC),'[]'::jsonb) INTO tt FROM public.tickets t WHERE a.rol<>'empleado' OR t.solicitante_id=a.id;
 SELECT coalesce(jsonb_agg(to_jsonb(t) ORDER BY t.nombre),'[]'::jsonb) INTO tech FROM public.technicians t WHERE a.rol<>'empleado';
 SELECT coalesce(jsonb_agg(to_jsonb(n) ORDER BY n.created_at DESC),'[]'::jsonb) INTO nt FROM public.notifications n WHERE lower(n.destinatario_usuario)=lower(a.email) AND (n.ticket_id IS NULL OR a.rol<>'empleado' OR EXISTS(SELECT 1 FROM public.tickets t WHERE t.id=n.ticket_id AND t.solicitante_id=a.id));
 RETURN jsonb_build_object('tickets',tt,'technicians',tech,'notifications',nt);
END; $$;
CREATE OR REPLACE FUNCTION public.rialsa_notify(a public.users,t public.tickets,title text,msg text,kind text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,public AS $$
BEGIN
 INSERT INTO public.notifications(id,titulo,mensaje,tipo,ticket_id,destinatario_rol,destinatario_usuario,leida,timestamp)
 SELECT 'NOTIF-'||gen_random_uuid()::text,title,msg,kind,t.id,u.rol,u.email,false,to_char(now() AT TIME ZONE 'America/Monterrey','YYYY-MM-DD HH24:MI')
 FROM public.users u WHERE u.estado='Activo' AND (u.id=a.id OR u.rol='admin' OR (u.rol='empleado' AND u.id=t.solicitante_id) OR (u.rol='tecnico' AND (kind='alerta' OR u.nombre=t.asignacion)));
END; $$;
CREATE OR REPLACE FUNCTION public.rialsa_ticket_action(p_action text,p_data jsonb) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,public AS $$
DECLARE a public.users%ROWTYPE; t public.tickets%ROWTYPE; tid text; v text; event_text text; msg text; title text; kind text:='estado'; ts text; target text; next_id bigint; h integer; subject text; descr text; cat text; pri text;
BEGIN
 a:=public.rialsa_actor(); ts:=to_char(now() AT TIME ZONE 'America/Monterrey','YYYY-MM-DD HH24:MI');
 IF p_action='create' THEN
  subject:=trim(coalesce(p_data->>'asunto','')); descr:=trim(coalesce(p_data->>'descripcion','')); cat:=p_data->>'categoria'; pri:=p_data->>'prioridad';
  IF length(subject) NOT BETWEEN 5 AND 200 OR length(descr) NOT BETWEEN 10 AND 8000 OR cat IS NULL OR cat NOT IN ('Acceso','Software','Hardware','Redes') OR pri IS NULL OR pri NOT IN ('Crítica','Alta','Media','Baja') THEN RAISE EXCEPTION 'Completa los campos obligatorios del ticket'; END IF;
  PERFORM pg_advisory_xact_lock(741062);
  SELECT coalesce(max(substring(id FROM '^TCK-([0-9]+)$')::bigint),1049)+1 INTO next_id FROM public.tickets WHERE id ~ '^TCK-[0-9]+$'; tid:='TCK-'||next_id;
  SELECT tech.nombre INTO target FROM public.technicians tech WHERE tech.estado<>'Ocupado' ORDER BY (SELECT count(*) FROM public.tickets x WHERE x.asignacion=tech.nombre AND x.estado<>'Resuelto'),tech.id LIMIT 1;
  target:=coalesce(target,'Sin asignar'); h:=CASE pri WHEN 'Crítica' THEN 1 WHEN 'Alta' THEN 4 ELSE 8 END;
  INSERT INTO public.tickets(id,asunto,descripcion,contexto_ia,solicitante,solicitante_id,prioridad,categoria,estado,asignacion,departamento,fecha_creacion,sla_restante,sla_deadline,notas_internas,comentarios_publicos,historial_auditoria)
  VALUES(tid,subject,descr,left(p_data->>'contextoIa',100000),a.nombre,a.id,pri,cat,CASE WHEN target='Sin asignar' THEN 'Abierto' ELSE 'En progreso' END,target,a.departamento,ts,h||' h 00 min',now()+make_interval(hours=>h),'[]','[]',jsonb_build_array('Ticket creado por '||a.nombre||' ('||ts||')')||CASE WHEN target='Sin asignar' THEN '[]'::jsonb ELSE jsonb_build_array('Asignado automáticamente a '||target||' ('||ts||')') END) RETURNING * INTO t;
  PERFORM public.rialsa_notify(a,t,'Ticket '||tid||' creado',subject||' · '||target,'alerta'); RETURN tid;
 END IF;
 IF p_action IS NULL OR p_action NOT IN ('resolve','assign','escalate','comment','note') THEN RAISE EXCEPTION 'Acción no reconocida'; END IF;
 SELECT * INTO t FROM public.tickets WHERE id=p_data->>'id' FOR UPDATE;
 IF NOT FOUND OR (a.rol='empleado' AND t.solicitante_id IS DISTINCT FROM a.id) THEN RAISE EXCEPTION 'Ticket no autorizado' USING ERRCODE='42501'; END IF;
 IF a.rol='empleado' AND p_action<>'comment' THEN RAISE EXCEPTION 'Permisos insuficientes' USING ERRCODE='42501'; END IF;
 IF t.estado='Resuelto' AND p_action IN ('resolve','assign','escalate') THEN RAISE EXCEPTION 'El ticket ya está resuelto'; END IF;
 v:=trim(coalesce(p_data->>'value',''));
 CASE p_action
 WHEN 'resolve' THEN t.estado:='Resuelto';t.resolved_at:=now();t.sla_restante:='Cerrado';event_text:='Ticket resuelto por '||a.nombre;title:='Ticket '||t.id||' resuelto';
 WHEN 'assign' THEN
  IF v='' OR (a.rol='tecnico' AND v<>a.nombre) OR NOT EXISTS(SELECT 1 FROM public.technicians WHERE nombre=v) THEN RAISE EXCEPTION 'Asignación no autorizada' USING ERRCODE='42501'; END IF;
  IF t.asignacion=v AND t.estado='En progreso' THEN RETURN t.id; END IF;
  event_text:='Asignado por '||a.nombre||': '||t.asignacion||' → '||v;t.asignacion:=v;t.estado:='En progreso';title:='Ticket '||t.id||' asignado';kind:='asignacion';
 WHEN 'escalate' THEN IF t.estado='Escalado' THEN RETURN t.id; END IF;t.estado:='Escalado';event_text:='Ticket escalado por '||a.nombre;title:='Ticket '||t.id||' escalado';
 WHEN 'comment' THEN
  IF length(v) NOT BETWEEN 1 AND 8000 THEN RAISE EXCEPTION 'Comentario inválido'; END IF;
  t.comentarios_publicos:=coalesce(t.comentarios_publicos,'[]')||jsonb_build_array(jsonb_build_object('id',gen_random_uuid()::text,'autor',a.nombre,'rol',a.rol,'texto',v,'fecha',ts)); event_text:='Comentario público de '||a.nombre; title:='Nuevo comentario en '||t.id;kind:='comentario';msg:=v;
 WHEN 'note' THEN
  IF length(v) NOT BETWEEN 1 AND 8000 THEN RAISE EXCEPTION 'Nota inválida'; END IF;
  t.notas_internas:=coalesce(t.notas_internas,'[]')||jsonb_build_array(v);event_text:='Nota interna agregada por '||a.nombre;
 END CASE;
 event_text:=event_text||' ('||ts||')';
 t.historial_auditoria:=jsonb_build_array(event_text)||coalesce(t.historial_auditoria,'[]');
 UPDATE public.tickets SET estado=t.estado,asignacion=t.asignacion,resolved_at=t.resolved_at,sla_restante=t.sla_restante,notas_internas=t.notas_internas,comentarios_publicos=t.comentarios_publicos,historial_auditoria=t.historial_auditoria WHERE id=t.id;
 IF p_action<>'note' THEN PERFORM public.rialsa_notify(a,t,title,coalesce(msg,event_text),kind); END IF;
 RETURN t.id;
END; $$;
CREATE OR REPLACE FUNCTION public.rialsa_mark_read(p_id text DEFAULT NULL) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,public AS $$
DECLARE a public.users%ROWTYPE;
BEGIN a:=public.rialsa_actor(); UPDATE public.notifications SET leida=true WHERE lower(destinatario_usuario)=lower(a.email) AND (p_id IS NULL OR id=p_id); RETURN true; END; $$;
CREATE OR REPLACE FUNCTION public.rialsa_add_technician(p_data jsonb) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,public AS $$
DECLARE a public.users%ROWTYPE; mail text; n text; lvl text; esp text;
BEGIN
 a:=public.rialsa_actor(); IF a.rol<>'admin' THEN RAISE EXCEPTION 'Permisos insuficientes' USING ERRCODE='42501'; END IF;
 mail:=lower(trim(coalesce(p_data->>'email',''))); n:=trim(coalesce(p_data->>'nombre','')); lvl:=p_data->>'nivel';esp:=coalesce(nullif(trim(p_data->>'especialidad'),''),'Soporte General');
 IF mail !~ '^[^@]+@(gid\.com\.mx|delnorte\.com\.mx)$' OR length(n) NOT BETWEEN 2 AND 120 OR lvl IS NULL OR lvl NOT IN ('Nivel 1 (Mesa de Ayuda)','Nivel 2 (Especialista)','Nivel 3 (Infraestructura)') THEN RAISE EXCEPTION 'Datos del técnico inválidos'; END IF;
 IF EXISTS(SELECT 1 FROM public.users WHERE lower(email)=mail) OR EXISTS(SELECT 1 FROM public.technicians WHERE lower(email)=mail) THEN RAISE EXCEPTION 'El correo ya está registrado'; END IF;
 INSERT INTO public.users(id,nombre,email,rol,departamento,estado,fecha_registro,password) VALUES('USR-'||gen_random_uuid()::text,n,mail,'tecnico',esp,'Activo',to_char(now(),'YYYY-MM-DD'),'');
 INSERT INTO public.technicians(id,nombre,email,especialidad,nivel,tickets_activos,estado) VALUES('TECH-'||gen_random_uuid()::text,n,mail,esp,lvl,0,'Disponible'); RETURN true;
END; $$;
REVOKE ALL ON FUNCTION public.rialsa_actor(),public.rialsa_notify(public.users,public.tickets,text,text,text),public.rialsa_profile(),public.rialsa_workspace(),public.rialsa_ticket_action(text,jsonb),public.rialsa_mark_read(text),public.rialsa_add_technician(jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.rialsa_profile(),public.rialsa_workspace(),public.rialsa_ticket_action(text,jsonb),public.rialsa_mark_read(text),public.rialsa_add_technician(jsonb) TO authenticated;
COMMIT;
