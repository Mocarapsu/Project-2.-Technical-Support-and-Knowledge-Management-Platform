CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TYPE user_role AS ENUM ('END_USER', 'TECHNICIAN', 'ADMIN');
CREATE TYPE site_loc AS ENUM ('PLANT', 'WAREHOUSE', 'CORPORATE');
CREATE TYPE ticket_cat AS ENUM ('HARDWARE', 'SOFTWARE', 'NETWORK', 'ACCESS');
CREATE TYPE ticket_prio AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE ticket_stat AS ENUM ('OPEN', 'IN_PROGRESS', 'ESCALATED', 'RESOLVED', 'CLOSED');
CREATE TYPE res_origin AS ENUM ('AI', 'HUMAN');
CREATE TYPE kb_stat AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'END_USER',
    site_location site_loc NOT NULL DEFAULT 'PLANT',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tickets (
    ticket_id SERIAL PRIMARY KEY,
    requester_id UUID NOT NULL REFERENCES users(user_id),
    assigned_tech_id UUID REFERENCES users(user_id),
    category ticket_cat NOT NULL,
    priority ticket_prio NOT NULL DEFAULT 'MEDIUM',
    status ticket_stat NOT NULL DEFAULT 'OPEN',
    description TEXT NOT NULL,
    resolved_by res_origin,
    sla_breached BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ
);

CREATE TABLE ticket_notes (
    note_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id INTEGER NOT NULL REFERENCES tickets(ticket_id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(user_id),
    content TEXT NOT NULL,
    is_internal BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE attachments (
    attachment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id INTEGER NOT NULL REFERENCES tickets(ticket_id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(50) NOT NULL,
    file_size_bytes INTEGER NOT NULL
);

CREATE TABLE kb_articles (
    article_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    category ticket_cat NOT NULL,
    status kb_stat NOT NULL DEFAULT 'DRAFT',
    current_version INTEGER NOT NULL DEFAULT 1,
    is_vectorized BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE kb_versions (
    version_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID NOT NULL REFERENCES kb_articles(article_id) ON DELETE CASCADE,
    editor_id UUID NOT NULL REFERENCES users(user_id),
    version_number INTEGER NOT NULL,
    content_md TEXT NOT NULL
);

CREATE TABLE ai_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id),
    ticket_id INTEGER REFERENCES tickets(ticket_id),
    failed_attempts INTEGER NOT NULL DEFAULT 0,
    transcript_json JSONB NOT NULL
);

CREATE TABLE audit_logs (
    log_id BIGSERIAL PRIMARY KEY,
    actor_id UUID NOT NULL REFERENCES users(user_id),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    action VARCHAR(100) NOT NULL,
    old_value JSONB,
    new_value JSONB NOT NULL
);
-- USUARIOS DE PRUEBA OFICIALES (Password desencriptado: Gid2026*)
INSERT INTO users (full_name, email, password_hash, role, site_location) VALUES
('Carlos Operador Planta', 'empleado@gid.com.mx', '', 'END_USER', 'PLANT'),
('Ricardo Daniel Hernandez', 'ricardo@gid.com.mx', '', 'TECHNICIAN', 'CORPORATE'),
('Salvador Rivera Delgado', 'salvador@gid.com.mx', '', 'TECHNICIAN', 'PLANT'),
('Ing. Jose Luis Bautista', 'bautista@gid.com.mx', '', 'ADMIN', 'CORPORATE');
