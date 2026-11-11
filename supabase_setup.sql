-- =========================================================================
-- CONFIGURACIÓN DE BASE DE DATOS SUPABASE (POSTGRESQL) - PROYECTO RIALSA
-- Universidad Politécnica de Durango · Software Projects Management
-- =========================================================================

-- 1. Crear tabla de Usuarios
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    rol TEXT NOT NULL,
    departamento TEXT NOT NULL,
    estado TEXT NOT NULL DEFAULT 'Activo',
    fecha_registro TEXT NOT NULL,
    password TEXT NOT NULL DEFAULT 'Password123!',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Crear tabla de Técnicos Resolutores
CREATE TABLE IF NOT EXISTS technicians (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    email TEXT NOT NULL,
    especialidad TEXT NOT NULL,
    nivel TEXT NOT NULL,
    tickets_activos INTEGER NOT NULL DEFAULT 0,
    estado TEXT NOT NULL DEFAULT 'Disponible',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Crear tabla de Tickets de Soporte
CREATE TABLE IF NOT EXISTS tickets (
    id TEXT PRIMARY KEY,
    asunto TEXT NOT NULL,
    solicitante TEXT NOT NULL,
    prioridad TEXT NOT NULL,
    categoria TEXT NOT NULL,
    estado TEXT NOT NULL DEFAULT 'Abierto',
    asignacion TEXT NOT NULL,
    departamento TEXT,
    fecha_creacion TEXT,
    sla_restante TEXT,
    notas_internas JSONB DEFAULT '[]'::jsonb,
    comentarios_publicos JSONB DEFAULT '[]'::jsonb,
    historial_auditoria JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Crear tabla de Notificaciones en Tiempo Real
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    titulo TEXT NOT NULL,
    mensaje TEXT NOT NULL,
    tipo TEXT NOT NULL,
    ticket_id TEXT,
    destinatario_rol TEXT NOT NULL DEFAULT 'todos',
    destinatario_usuario TEXT,
    leida BOOLEAN NOT NULL DEFAULT FALSE,
    timestamp TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Habilitar Row Level Security (RLS) y permitir acceso anónimo controlado
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public full access users" ON users;
CREATE POLICY "Public full access users" ON users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access technicians" ON technicians;
CREATE POLICY "Public full access technicians" ON technicians FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access tickets" ON tickets;
CREATE POLICY "Public full access tickets" ON tickets FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access notifications" ON notifications;
CREATE POLICY "Public full access notifications" ON notifications FOR ALL USING (true) WITH CHECK (true);

-- 6. Habilitar Tiempo Real (Supabase Realtime WebSockets)
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE users, technicians, tickets, notifications;
COMMIT;

-- 7. Datos Iniciales de Prueba (Semilla Oficial)
INSERT INTO users (id, nombre, email, rol, departamento, estado, fecha_registro, password)
VALUES
('USR-01', 'Carlos Operador Planta', 'empleado@gid.com.mx', 'empleado', 'Operaciones y Planta 1', 'Activo', '15 oct 2026', 'Password123!'),
('USR-02', 'Ricardo Daniel Hernández', 'ricardo@gid.com.mx', 'empleado', 'Desarrollo Frontend / TI2', 'Activo', '15 oct 2026', 'Password123!'),
('USR-03', 'Alfredo González Soto', 'alfredo@gid.com.mx', 'tecnico', 'Mesa de Ayuda L2 / Backend', 'Activo', '15 oct 2026', 'Password123!'),
('USR-04', 'Salvador Rivera Delgado', 'salvador@gid.com.mx', 'tecnico', 'Microservicios IA & Automatización', 'Activo', '15 oct 2026', 'Password123!'),
('USR-05', 'Ing. José Luis Bautista', 'bautista@gid.com.mx', 'admin', 'CISO / Dirección TI Central', 'Activo', '15 oct 2026', 'Password123!')
ON CONFLICT (id) DO NOTHING;

INSERT INTO technicians (id, nombre, email, especialidad, nivel, tickets_activos, estado)
VALUES
('TECH-01', 'Ana Torres', 'ana.torres@delnorte.com.mx', 'Mesa de Ayuda, Accesos & Cuentas', 'Nivel 1 (Mesa de Ayuda)', 1, 'Disponible'),
('TECH-02', 'Alfredo González Soto', 'alfredo@gid.com.mx', 'Software, SAP ERP & Bases de Datos', 'Nivel 2 (Especialista)', 1, 'Disponible'),
('TECH-03', 'Carlos Mendoza', 'carlos.mendoza@delnorte.com.mx', 'Infraestructura, Switches & Telecomunicaciones', 'Nivel 3 (Infraestructura)', 0, 'En guardia'),
('TECH-04', 'Salvador Rivera Delgado', 'salvador@gid.com.mx', 'Microservicios de IA, RAG & Automatización', 'Nivel 2 (Especialista)', 1, 'Disponible'),
('TECH-05', 'Ing. José Luis Bautista', 'bautista@gid.com.mx', 'Ciberseguridad & Dirección de Operaciones TI', 'Nivel 3 (Infraestructura)', 1, 'Disponible')
ON CONFLICT (id) DO NOTHING;

INSERT INTO tickets (id, asunto, solicitante, prioridad, categoria, estado, asignacion, departamento, fecha_creacion, sla_restante, notas_internas, comentarios_publicos, historial_auditoria)
VALUES
('TCK-1045', 'ERP bloqueado al facturar remisión', 'Carlos Operador Planta', 'Crítica', 'Software', 'Resuelto', 'Salvador Rivera Delgado', 'Operaciones y Planta 1', '15 oct 2026', '00 h 00 min', '["Procedimiento de desbloqueo aplicado", "Revisión de logs SAP exitosa"]'::jsonb, '[{"id":"C-1","autor":"Carlos Operador Planta","rol":"empleado","texto":"Muchas gracias, ya pudimos facturar.","fecha":"15 Oct 11:20"}]'::jsonb, '["15 Oct 11:20 · Marcado como Resuelto por Salvador Rivera"]'::jsonb),
('TCK-1046', 'Sin acceso a VPN desde casa', 'Ricardo Daniel Hernández', 'Alta', 'Acceso', 'En progreso', 'Ana Torres', 'Desarrollo Frontend / TI2', '15 oct 2026', '01 h 12 min', '["Revisión de certificados RADIUS pendiente"]'::jsonb, '[]'::jsonb, '["15 Oct 09:35 · Asignado a Ana Torres"]'::jsonb),
('TCK-1047', 'Impresora térmica de etiquetas no responde', 'Mario Díaz', 'Media', 'Hardware', 'Abierto', 'Alfredo González Soto', 'Almacén Central', '15 oct 2026', '03 h 45 min', '["Posible atasco de cabezal"]'::jsonb, '[]'::jsonb, '["15 Oct 09:20 · Asignado a Alfredo González Soto"]'::jsonb),
('TCK-1048', 'Sin conexión VPN laptop fuera de oficina', 'Carlos Operador Planta', 'Alta', 'Acceso', 'En progreso', 'Mesa de ayuda - Nivel 1', 'Operaciones y Planta 1', '15 oct 2026', '02 h 10 min', '[]'::jsonb, '[]'::jsonb, '["15 Oct 09:10 · Ticket escalado desde RIALSA IA"]'::jsonb),
('TCK-1049', 'Fallo de red en conmutador planta', 'Carlos Operador Planta', 'Baja', 'Redes', 'En progreso', 'Carlos Mendoza', 'Operaciones y Planta 1', '15 oct 2026', '07 h 30 min', '[]'::jsonb, '[]'::jsonb, '["15 Oct 08:45 · Ticket generado"]'::jsonb)
ON CONFLICT (id) DO NOTHING;
