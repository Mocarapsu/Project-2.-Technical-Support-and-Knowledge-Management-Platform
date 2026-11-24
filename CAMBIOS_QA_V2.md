# RIALSA — Correcciones QA V2 y rediseño

Alcance: Informe QA V2.0 (24/11/2026) y Texto pegado.txt. Se conserva React/Vite/TypeScript/Tailwind, Lucide, Framer Motion, Supabase y el catálogo original. No se modifican los servicios backend-core ni ai-service, Docker o los documentos de proyecto que venían en el ZIP. No se ejecutó ninguna operación contra la base remota.

## Ejecutar en macOS (demostración local)

Se recomienda Node.js 22 LTS o una versión posterior compatible con las dependencias del proyecto. Desde la raíz extraída:

```bash
cd frontend
npm ci
npm run dev
```

Abrir http://localhost:5173. `.env.development` activa el modo de demostración exclusivamente con Vite en desarrollo. Los botones de acceso rápido permiten probar Dirección TI, Técnico y Empleado; el demo conserva tickets y notificaciones en el almacenamiento local del navegador. No requiere XAMPP, Supabase remoto ni API key. Para comprobar tres cuentas en paralelo, abrir pestañas distintas y seleccionar cada cuenta. Para resetear los datos del demo, utilizar un perfil de navegador nuevo o borrar los datos del sitio localhost (esto borra los tickets de prueba locales). No utilizar el demo como sistema de producción.

Pruebas locales:

```bash
npx tsc --noEmit
node tests/qa-v2.mjs
npm run build
```

## Conectar una base Supabase existente (entorno real)

1. Hacer una copia de seguridad y usar primero un proyecto de staging. No ejecutar `supabase_setup.sql` sobre una base ya inicializada. En una base nueva, ejecutar primero `supabase_setup.sql` y después `supabase_qa_v2.sql` en SQL Editor. La semilla existente se conserva para staging, no usar identidades de demostración como datos reales.
2. En la base existente, ejecutar únicamente `supabase_qa_v2.sql`. Esta migración desactiva las políticas públicas antiguas, invalida las contraseñas almacenadas en la tabla de perfiles y añade operaciones RPC autorizadas. No elimina tickets; los tickets de propiedad ambigua se mantienen disponibles a personal de soporte, no se asignan automáticamente a empleados. Notificaciones antiguas sin destinatario individual ya no se exponen. Las prioridades desconocidas se conservan como “No especificada”. No se fabrican fechas de resolución históricas.
3. En Authentication > Users, crear o invitar las cuentas institucionales verificadas, con contraseñas nuevas. Vincular cada cuenta existente a su perfil explícitamente desde SQL Editor (usar el correo y UUID reales de cada cuenta, sin reutilizar un UUID):

```sql
UPDATE public.users
SET auth_user_id = 'UUID-DE-AUTH-USERS'::uuid
WHERE email = 'correo-institucional-verificado@gid.com.mx';
```

   Verificar que `rol` del perfil es el esperado (`admin`, `tecnico`, `empleado`) y que `estado` es `Activo`. Los usuarios nuevos que no tienen perfil se registran como empleados con correo institucional confirmado. Un técnico creado desde Admin requiere después invitación/vinculación de su identidad Auth. No conceder roles a partir del metadata que proporciona el cliente. Configurar URLs de redirección Auth para el dominio y localhost en staging.
4. Crear `frontend/.env.development.local` para probar la conexión real en desarrollo, y `frontend/.env.local` para el build:

```dotenv
VITE_DEMO_MODE=false
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=TU_CLAVE_PUBLICABLE
# VITE_AI_SERVICE_URL=https://tu-servicio-ia
```

   Utilizar la clave pública/publishable, nunca service_role ni una clave privada. En Vercel definir las mismas variables; producción no habilita accesos rápidos. Reiniciar Vite al cambiar variables. La aplicación conectada consulta periódicamente las RPC autorizadas para actualizar tickets/notificaciones. La recuperación de contraseña requiere configurar correo y redirecciones en Auth.

## Trazabilidad de cambios

| ID | Implementación |
|---|---|
| QA2-001 | Identidad y navegación derivadas de un perfil autenticado; limpieza de pantalla, filtros, selección y notificaciones al cambiar cuenta. Sesión demo por pestaña. |
| QA2-002 | Historial reciente por usuario, seguimiento contextual con fuentes y escalamiento cuando se agotan pasos documentados. |
| QA2-003 | Sin formulario de configuración BD para empleados o técnicos; configuración de despliegue externa y RPC autorizadas. |
| QA2-004 | Inicio usa los tickets propios activos y su estado vigente, no un ticket fijo. |
| QA2-005 | Acciones de resolución/asignación/escalamiento bloqueadas en tickets resueltos; RPC usa bloqueo de fila y verifica permisos. No se reescriben los eventos históricos de auditoría. |
| QA2-006 | Prioridad obligatoria en nuevos tickets; normalización y fallback explícito. |
| QA2-007 | Acceso rápido exclusivamente demo en desarrollo; login real por Supabase Auth en producción. |
| QA2-008 | Distribución por todas las categorías y estados reales, KPIs calculados solo con datos suficientes, reporte actualizado. |
| QA2-009 | Se evita citar un fragmento truncado como supuesto análisis completo; historial y contexto de escalamiento visibles. |
| QA2-010 | Ayuda abre la base de conocimiento. |
| QA2-011 | SLA de resueltos se muestra cerrado/cumplido/incumplido según evidencia disponible; se registra fecha al resolver. |
| QA2-012 | Catálogo normalizado de categorías, incluido Redes; filtros conservan valores heredados. |
| QA2-013 | Formulario compartido para todos los roles; validación, errores por campo y foco. |

Diseño: shell común por rol, sidebar colapsable y navegación móvil, login sobrio, listados compactos, componentes de botones, badges, estado vacío, detalle compartido, notificaciones, chat con fuente consultable, feedback, transiciones cortas y reduced-motion. Se mantiene la biblioteca de conocimiento original. No se añadieron dependencias nuevas. El formulario se simplificó a un paso real en lugar de simular un wizard de adjuntos; la persistencia de archivos no se añadió porque no existe en el contrato de tickets original.

## Validación y pendientes

- TypeScript (`tsc --noEmit`): aprobado en entorno de entrega.
- Pruebas unitarias de dominio e IA (`tests/qa-v2.mjs`): ejecutar para comprobar normalización, visibilidad, SLA y seguimiento conversacional.
- La compilación Vite y las pruebas visuales/e2e de navegador no pudieron completarse aquí: el ZIP original traía dependencias binarias para Windows y npm no pudo descargar las nativas de Linux. El ZIP de entrega no incluye node_modules ni builds viejos. La instalación limpia en Mac es necesaria.
- Migración SQL, autenticación Supabase, correo, prueba multiusuario de extremo a extremo, adjuntos, teclado y viewports deben verificarse en staging; la migración no fue ejecutada contra Supabase desde este entorno. No se certifica seguridad ni aptitud para producción.
- IA: se conserva el catálogo de procedimientos existentes y el endpoint opcional del microservicio. Se implementa contexto local y estado de análisis; no se afirma streaming real de tokens ni un nuevo proveedor LLM. No se incluyen claves privadas de Gemini. El microservicio original no se modificó; validar su integración con la URL configurada antes de producción.
- No se declara cierre de QA V2: repetir la regresión QA V3 sobre el nuevo build antes de publicar.
